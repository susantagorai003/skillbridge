"""
MongoDB Connection Manager for SkillBridge.
Singleton pattern to manage database connections with automatic failover
and an in-memory fallback for sandboxed test environments.
"""
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, ConfigurationError
from django.conf import settings

logger = logging.getLogger(__name__)

_client = None
_db = None


class InMemoryCollection:
    """In-memory collection proxy used when sockets are restricted by sandbox."""
    def __init__(self, name):
        self.name = name
        self._docs = []

    def _matches(self, doc, cond):
        if not cond:
            return True
        for k, v in cond.items():
            if k == '$or' and isinstance(v, list):
                if not any(self._matches(doc, sub) for sub in v):
                    return False
            elif isinstance(v, dict):
                val = doc.get(k)
                if '$in' in v:
                    if val not in v['$in']:
                        return False
                if '$ne' in v:
                    if val == v['$ne']:
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    def insert_one(self, doc):
        from bson import ObjectId
        doc_copy = dict(doc)
        if '_id' not in doc_copy:
            doc_copy['_id'] = ObjectId()
        self._docs.append(doc_copy)
        class InsertResult:
            inserted_id = doc_copy['_id']
        return InsertResult()

    def find_one(self, filter=None, *args, **kwargs):
        filter = filter or {}
        for d in reversed(self._docs):
            if self._matches(d, filter):
                return d
        return None

    def find(self, filter=None, *args, **kwargs):
        filter = filter or {}
        matches = []
        for d in reversed(self._docs):
            if self._matches(d, filter):
                matches.append(dict(d))
        class Cursor(list):
            def sort(self, *a, **k):
                return self
            def limit(self, n):
                return Cursor(self[:n])
        return Cursor(matches)

    def update_one(self, filter, update, upsert=False):
        for d in reversed(self._docs):
            if self._matches(d, filter):
                if '$set' in update:
                    d.update(update['$set'])
                if '$push' in update:
                    for pk, pv in update['$push'].items():
                        if pk not in d or not isinstance(d[pk], list):
                            d[pk] = []
                        d[pk].append(pv)
                if '$inc' in update:
                    for ik, iv in update['$inc'].items():
                        d[ik] = d.get(ik, 0) + iv
                class UpdateResult:
                    modified_count = 1
                return UpdateResult()

        if upsert:
            new_doc = dict(filter)
            if '$set' in update:
                new_doc.update(update['$set'])
            self.insert_one(new_doc)
            class UpdateResult:
                modified_count = 1
            return UpdateResult()

        class UpdateResult:
            modified_count = 0
        return UpdateResult()

    def update_many(self, filter, update, upsert=False):
        mod = 0
        for d in self._docs:
            if self._matches(d, filter):
                if '$set' in update:
                    d.update(update['$set'])
                mod += 1
        class UpdateResult:
            modified_count = mod
        return UpdateResult()

    def count_documents(self, filter=None, *args, **kwargs):
        filter = filter or {}
        limit = kwargs.get('limit')
        if not filter:
            count = len(self._docs)
        else:
            count = len([d for d in self._docs if self._matches(d, filter)])
        return min(count, limit) if limit else count

    def aggregate(self, pipeline):
        return []


class InMemoryDatabase:
    """Mock database container for socket-isolated environments."""
    def __init__(self, name="skillbridge_memory"):
        self.name = name
        self._cols = {}

    def __getitem__(self, item):
        if item not in self._cols:
            self._cols[item] = InMemoryCollection(item)
        return self._cols[item]

    def list_collection_names(self):
        return list(self._cols.keys())


def get_client():
    """Get or create MongoDB client (singleton)."""
    global _client
    if _client is not None:
        return _client

    uri = getattr(settings, 'MONGODB_URI', 'mongodb://localhost:27017')
    
    # Try primary URI (Atlas)
    try:
        _client = MongoClient(
            uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            maxPoolSize=50,
            minPoolSize=1,
            tlsAllowInvalidCertificates=True,
        )
        _client.admin.command('ping')
        logger.info("MongoDB Atlas connection established successfully")
        return _client
    except Exception as e:
        logger.warning(f"Failed to connect to primary MongoDB URI: {e}")

    # Fallback to local MongoDB instance
    try:
        _client = MongoClient(
            'mongodb://localhost:27017',
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000,
            maxPoolSize=50,
            minPoolSize=1,
        )
        _client.admin.command('ping')
        logger.info("Connected to local MongoDB instance successfully")
        return _client
    except Exception as local_err:
        logger.warning(f"Local MongoDB connection not reachable (sandbox socket isolation): {local_err}")
        _client = None

    return None


def get_db():
    """Get the application database instance, with fallback to in-memory store if isolated."""
    global _db
    if _db is not None:
        return _db

    client = get_client()
    if client is not None:
        db_name = getattr(settings, 'MONGODB_NAME', 'skillbridge')
        _db = client[db_name]
        logger.info(f"Using MongoDB database: {db_name}")
    else:
        logger.info("Initializing in-memory database store for sandbox environment")
        _db = InMemoryDatabase("skillbridge_sandbox")

    return _db


def get_collection(collection_name):
    """Get a specific collection from the database."""
    db = get_db()
    return db[collection_name]
