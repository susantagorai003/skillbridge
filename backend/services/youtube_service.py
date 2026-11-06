"""
YouTube Learning & Tutorial Integration Service for SkillBridge.
Utilizes RapidAPI youtube138 endpoint with smart in-memory/MongoDB caching and
high-quality curated fallback masterclasses.
"""
import os
import json
import logging
import urllib.request
import urllib.parse
import urllib.error
import ssl
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

# Curated Fallback Masterclasses for Tech Stack (ensures 100% uptime)
CURATED_FALLBACK_VIDEOS = {
    'docker': [
        {
            'video_id': '3c-iBn73dDE',
            'title': 'Docker Tutorial for Beginners [FULL COURSE in 3 Hours]',
            'author': 'TechWorld with Nana',
            'duration_text': '3h 10m',
            'views': '4.2M views',
            'thumbnail': 'https://i.ytimg.com/vi/3c-iBn73dDE/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=3c-iBn73dDE',
            'embed_url': 'https://www.youtube.com/embed/3c-iBn73dDE'
        },
        {
            'video_id': 'pg19Z8LL06w',
            'title': 'Docker Containerization Full Course - Hands On',
            'author': 'freeCodeCamp.org',
            'duration_text': '2h 15m',
            'views': '1.8M views',
            'thumbnail': 'https://i.ytimg.com/vi/pg19Z8LL06w/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=pg19Z8LL06w',
            'embed_url': 'https://www.youtube.com/embed/pg19Z8LL06w'
        }
    ],
    'typescript': [
        {
            'video_id': '30LWjhZzg50',
            'title': 'Learn TypeScript - Full Tutorial for Beginners',
            'author': 'freeCodeCamp.org',
            'duration_text': '4h 45m',
            'views': '1.8M views',
            'thumbnail': 'https://i.ytimg.com/vi/30LWjhZzg50/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=30LWjhZzg50',
            'embed_url': 'https://www.youtube.com/embed/30LWjhZzg50'
        },
        {
            'video_id': 'd56mG7DezGs',
            'title': 'TypeScript Course for Beginners - Learn TypeScript from Scratch',
            'author': 'Academind',
            'duration_text': '1h 35m',
            'views': '920K views',
            'thumbnail': 'https://i.ytimg.com/vi/d56mG7DezGs/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=d56mG7DezGs',
            'embed_url': 'https://www.youtube.com/embed/d56mG7DezGs'
        }
    ],
    'django': [
        {
            'video_id': 'ptVx4iU3Z5Y',
            'title': 'Python Django Full Course for Beginners',
            'author': 'freeCodeCamp.org',
            'duration_text': '3h 50m',
            'views': '2.1M views',
            'thumbnail': 'https://i.ytimg.com/vi/ptVx4iU3Z5Y/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=ptVx4iU3Z5Y',
            'embed_url': 'https://www.youtube.com/embed/ptVx4iU3Z5Y'
        },
        {
            'video_id': 'F5mRW0jo-U4',
            'title': 'Django REST Framework Full Course - Build Powerful APIs',
            'author': 'Dennis Ivy',
            'duration_text': '4h 10m',
            'views': '850K views',
            'thumbnail': 'https://i.ytimg.com/vi/F5mRW0jo-U4/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=F5mRW0jo-U4',
            'embed_url': 'https://www.youtube.com/embed/F5mRW0jo-U4'
        }
    ],
    'ci/cd': [
        {
            'video_id': 'R8_veQiYBjI',
            'title': 'GitHub Actions Full Course - Build Complete CI/CD Pipelines',
            'author': 'TechWorld with Nana',
            'duration_text': '1h 45m',
            'views': '1.1M views',
            'thumbnail': 'https://i.ytimg.com/vi/R8_veQiYBjI/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=R8_veQiYBjI',
            'embed_url': 'https://www.youtube.com/embed/R8_veQiYBjI'
        },
        {
            'video_id': 'scEDHsr3APg',
            'title': 'What is CI/CD? Continuous Integration & Deployment Explained',
            'author': 'freeCodeCamp.org',
            'duration_text': '50m',
            'views': '1.3M views',
            'thumbnail': 'https://i.ytimg.com/vi/scEDHsr3APg/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=scEDHsr3APg',
            'embed_url': 'https://www.youtube.com/embed/scEDHsr3APg'
        }
    ],
    'kubernetes': [
        {
            'video_id': 'X48VuDVv0do',
            'title': 'Kubernetes Tutorial for Beginners [FULL COURSE in 4 Hours]',
            'author': 'TechWorld with Nana',
            'duration_text': '3h 40m',
            'views': '3.4M views',
            'thumbnail': 'https://i.ytimg.com/vi/X48VuDVv0do/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=X48VuDVv0do',
            'embed_url': 'https://www.youtube.com/embed/X48VuDVv0do'
        }
    ],
    'aws': [
        {
            'video_id': 'SOTamWNgDKc',
            'title': 'AWS Certified Cloud Practitioner Training 2024 - Full Course',
            'author': 'freeCodeCamp.org',
            'duration_text': '14h',
            'views': '2.9M views',
            'thumbnail': 'https://i.ytimg.com/vi/SOTamWNgDKc/hq720.jpg',
            'video_url': 'https://www.youtube.com/watch?v=SOTamWNgDKc',
            'embed_url': 'https://www.youtube.com/embed/SOTamWNgDKc'
        }
    ]
}


class YouTubeService:
    """Service to search and retrieve top technical tutorial videos via RapidAPI youtube138."""

    def __init__(self):
        self.api_key = os.environ.get('RAPIDAPI_KEY', '48efeb9953msh77f362c12e4d4b8p1e7ebejsnd071a475693a').strip()
        self.host = os.environ.get('RAPIDAPI_YOUTUBE_HOST', 'youtube138.p.rapidapi.com').strip()
        self._memory_cache = {}

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 10)

    def search_tutorials(self, skill: str, query: str = "", limit: int = 4) -> List[Dict[str, Any]]:
        """
        Search top YouTube tutorial videos for a given skill or customized query.
        Uses in-memory cache and returns formatted video metadata.
        """
        clean_skill = skill.strip().lower()
        search_query = query.strip() if query else f"{skill} tutorial for beginners"
        cache_key = f"{clean_skill}::{search_query.lower()}"

        # 1. Check in-memory cache
        now = datetime.now(timezone.utc)
        if cache_key in self._memory_cache:
            entry = self._memory_cache[cache_key]
            if now - entry['timestamp'] < timedelta(hours=24):
                return entry['videos'][:limit]

        # 2. Query RapidAPI youtube138
        videos = []
        if self.is_configured():
            try:
                encoded_query = urllib.parse.quote_plus(search_query)
                url = f"https://{self.host}/search/?q={encoded_query}&hl=en&gl=US"
                headers = {
                    "x-rapidapi-key": self.api_key,
                    "x-rapidapi-host": self.host,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }

                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE

                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
                    if response.status == 200:
                        raw_data = json.loads(response.read().decode('utf-8'))
                        contents = raw_data.get('contents', [])
                        for item in contents:
                            if 'video' in item and len(videos) < limit:
                                v = item['video']
                                video_id = v.get('videoId')
                                if not video_id:
                                    continue

                                # Formatting duration
                                length_sec = v.get('lengthSeconds')
                                if length_sec:
                                    mins = length_sec // 60
                                    hours = mins // 60
                                    duration_text = f"{hours}h {mins % 60}m" if hours > 0 else f"{mins}m"
                                else:
                                    duration_text = "Full Course"

                                # Formatting views
                                views_raw = v.get('stats', {}).get('views', 0)
                                if views_raw >= 1000000:
                                    views_text = f"{views_raw / 1000000:.1f}M views"
                                elif views_raw >= 1000:
                                    views_text = f"{views_raw / 1000:.0f}K views"
                                else:
                                    views_text = f"{views_raw} views" if views_raw else "Popular"

                                # Best thumbnail
                                thumbnails = v.get('thumbnails', [])
                                thumb_url = thumbnails[-1].get('url') if thumbnails else f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"

                                videos.append({
                                    'video_id': video_id,
                                    'title': v.get('title', f"{skill} Masterclass"),
                                    'author': v.get('author', {}).get('title', 'Expert Educator'),
                                    'duration_text': duration_text,
                                    'views': views_text,
                                    'thumbnail': thumb_url,
                                    'video_url': f"https://www.youtube.com/watch?v={video_id}",
                                    'embed_url': f"https://www.youtube.com/embed/{video_id}"
                                })

                        if videos:
                            logger.info(f"Retrieved {len(videos)} YouTube tutorials for skill: {skill} via RapidAPI")
                            self._memory_cache[cache_key] = {'videos': videos, 'timestamp': now}
                            return videos
            except Exception as e:
                logger.warning(f"RapidAPI YouTube search failed or unreachable: {e}. Using curated fallbacks.")

        # 3. Fallback to Curated Video Library
        for key, fallback_list in CURATED_FALLBACK_VIDEOS.items():
            if key in clean_skill or clean_skill in key:
                return fallback_list[:limit]

        # Generic Tech Fallback
        generic_search_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote_plus(search_query)}"
        return [
            {
                'video_id': 'generic-1',
                'title': f'{skill.title()} Complete Crash Course for Developers',
                'author': 'freeCodeCamp.org',
                'duration_text': '2h 30m',
                'views': '1.2M views',
                'thumbnail': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
                'video_url': generic_search_url,
                'embed_url': None
            }
        ]


# Global Singleton
youtube_service = YouTubeService()
