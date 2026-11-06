"""
Base Repository for MongoDB collections.
Provides CRUD operations, pagination, and aggregation helpers.
"""
import logging
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ASCENDING, DESCENDING
from database.connection import get_collection

logger = logging.getLogger(__name__)


class BaseRepository:
    """Base repository class for MongoDB collection operations."""

    def __init__(self, collection_name):
        self.collection_name = collection_name

    @property
    def collection(self):
        """Get the MongoDB collection (lazy access)."""
        return get_collection(self.collection_name)

    @staticmethod
    def _to_object_id(id_value):
        """Convert string to ObjectId safely."""
        if isinstance(id_value, ObjectId):
            return id_value
        try:
            return ObjectId(str(id_value))
        except (InvalidId, TypeError):
            return None

    @staticmethod
    def _serialize_doc(doc):
        """Convert MongoDB document for JSON serialization."""
        if doc is None:
            return None
        if '_id' in doc:
            doc['id'] = str(doc['_id'])
            del doc['_id']
        # Convert ObjectId references
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, datetime):
                doc[key] = value.isoformat()
            elif isinstance(value, list):
                doc[key] = [
                    str(v) if isinstance(v, ObjectId)
                    else v.isoformat() if isinstance(v, datetime)
                    else v
                    for v in value
                ]
        return doc

    def _serialize_docs(self, docs):
        """Serialize a list of documents."""
        return [self._serialize_doc(doc) for doc in docs]

    def find_by_id(self, id_value):
        """Find a document by its ID (supports ObjectId, string ID, and custom string IDs)."""
        if not id_value:
            return None
        oid = self._to_object_id(id_value)
        if oid is not None:
            doc = self.collection.find_one({'$or': [{'_id': oid}, {'id': str(id_value)}]})
        else:
            doc = self.collection.find_one({'id': str(id_value)})
        return self._serialize_doc(doc)

    def find_one(self, filter_dict):
        """Find a single document matching the filter."""
        doc = self.collection.find_one(filter_dict)
        return self._serialize_doc(doc)

    def find_many(self, filter_dict=None, skip=0, limit=0, sort=None, projection=None):
        """Find multiple documents with optional pagination and sorting."""
        filter_dict = filter_dict or {}
        cursor = self.collection.find(filter_dict, projection)

        if sort:
            sort_list = []
            for field, direction in sort:
                sort_list.append((field, ASCENDING if direction == 1 else DESCENDING))
            cursor = cursor.sort(sort_list)

        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)

        return self._serialize_docs(list(cursor))

    def insert_one(self, document):
        """Insert a single document with timestamps."""
        now = datetime.now(timezone.utc)
        document['created_at'] = now
        document['updated_at'] = now
        result = self.collection.insert_one(document)
        document['id'] = str(result.inserted_id)
        if '_id' in document:
            del document['_id']
        return document

    def insert_many(self, documents):
        """Insert multiple documents with timestamps."""
        now = datetime.now(timezone.utc)
        for doc in documents:
            doc['created_at'] = now
            doc['updated_at'] = now
        result = self.collection.insert_many(documents)
        return [str(id) for id in result.inserted_ids]

    def update_one(self, id_value, update_dict):
        """Update a document by ID."""
        oid = self._to_object_id(id_value)
        if oid is None:
            return None
        update_dict['updated_at'] = datetime.now(timezone.utc)
        result = self.collection.update_one(
            {'_id': oid},
            {'$set': update_dict}
        )
        if result.modified_count > 0:
            return self.find_by_id(id_value)
        return None

    def update_many(self, filter_dict, update_dict):
        """Update multiple documents matching the filter."""
        update_dict['updated_at'] = datetime.now(timezone.utc)
        result = self.collection.update_many(
            filter_dict,
            {'$set': update_dict}
        )
        return result.modified_count

    def delete_one(self, id_value):
        """Delete a document by ID."""
        oid = self._to_object_id(id_value)
        if oid is None:
            return False
        result = self.collection.delete_one({'_id': oid})
        return result.deleted_count > 0

    def delete_many(self, filter_dict):
        """Delete multiple documents matching the filter."""
        result = self.collection.delete_many(filter_dict)
        return result.deleted_count

    def count(self, filter_dict=None):
        """Count documents matching the filter."""
        filter_dict = filter_dict or {}
        return self.collection.count_documents(filter_dict)

    def exists(self, filter_dict):
        """Check if a document matching the filter exists."""
        return self.collection.count_documents(filter_dict, limit=1) > 0

    def aggregate(self, pipeline):
        """Execute an aggregation pipeline."""
        results = list(self.collection.aggregate(pipeline))
        return self._serialize_docs(results)

    def paginate(self, filter_dict=None, page=1, page_size=20, sort=None):
        """Paginate query results."""
        filter_dict = filter_dict or {}
        page = max(1, page)
        skip = (page - 1) * page_size

        total = self.count(filter_dict)
        items = self.find_many(filter_dict, skip=skip, limit=page_size, sort=sort)

        return {
            'items': items,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size if page_size > 0 else 0,
            'has_next': skip + page_size < total,
            'has_prev': page > 1,
        }

    def create_index(self, keys, **kwargs):
        """Create an index on the collection."""
        return self.collection.create_index(keys, **kwargs)

    def text_search(self, query, filter_dict=None, limit=20):
        """Perform a text search."""
        search_filter = {'$text': {'$search': query}}
        if filter_dict:
            search_filter.update(filter_dict)
        cursor = self.collection.find(
            search_filter,
            {'score': {'$meta': 'textScore'}}
        ).sort([('score', {'$meta': 'textScore'})]).limit(limit)
        return self._serialize_docs(list(cursor))

    def distinct(self, field, filter_dict=None):
        """Get distinct values for a field."""
        return self.collection.distinct(field, filter_dict or {})

    def bulk_update(self, operations):
        """Perform bulk update operations."""
        from pymongo import UpdateOne
        if not operations:
            return 0
        bulk_ops = [
            UpdateOne(
                {'_id': self._to_object_id(op['id'])},
                {'$set': {**op['update'], 'updated_at': datetime.now(timezone.utc)}}
            )
            for op in operations
        ]
        result = self.collection.bulk_write(bulk_ops)
        return result.modified_count
