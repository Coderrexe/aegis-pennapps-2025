import json
import time
import os
from typing import Any, Optional
import logging
logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.cache_timeout = int(os.getenv('CACHE_TIMEOUT_MINUTES', 30)) * 60
        self.max_cache_size = int(os.getenv('MAX_CACHE_SIZE_MB', 100)) * 1024 * 1024
        self._memory_cache = {}
        self._cache_timestamps = {}
        self._current_cache_size = 0
        self.redis_client = None
        self._init_redis()
    
    def _init_redis(self):
        try:
            import redis
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
            logger.info("Redis cache initialized successfully")
        except ImportError:
            logger.info("Redis not available, using in-memory cache only")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Using in-memory cache only")
            self.redis_client = None
    
    def get(self, key: str) -> Optional[Any]:
        try:
            if self.redis_client:
                try:
                    cached_data = self.redis_client.get(f"crime_api:{key}")
                    if cached_data:
                        return json.loads(cached_data)
                except Exception as e:
                    logger.warning(f"Redis get error: {e}")
            if key in self._memory_cache:
                if time.time() - self._cache_timestamps[key] < self.cache_timeout:
                    return self._memory_cache[key]
                else:
                    self._remove_from_memory_cache(key)
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    def set(self, key: str, value: Any) -> bool:
        try:
            serialized_value = json.dumps(value)
            if self.redis_client:
                try:
                    self.redis_client.setex(
                        f"crime_api:{key}",
                        self.cache_timeout,
                        serialized_value
                    )
                    return True
                except Exception as e:
                    logger.warning(f"Redis set error: {e}")
            value_size = len(serialized_value.encode('utf-8'))
            while (self._current_cache_size + value_size > self.max_cache_size and
                   self._memory_cache):
                self._evict_oldest()
            self._memory_cache[key] = value
            self._cache_timestamps[key] = time.time()
            self._current_cache_size += value_size
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        try:
            if self.redis_client:
                try:
                    self.redis_client.delete(f"crime_api:{key}")
                except Exception as e:
                    logger.warning(f"Redis delete error: {e}")
            if key in self._memory_cache:
                self._remove_from_memory_cache(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    def clear(self) -> bool:
        try:
            if self.redis_client:
                try:
                    keys = self.redis_client.keys("crime_api:*")
                    if keys:
                        self.redis_client.delete(*keys)
                except Exception as e:
                    logger.warning(f"Redis clear error: {e}")
            self._memory_cache.clear()
            self._cache_timestamps.clear()
            self._current_cache_size = 0
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False
    
    def _remove_from_memory_cache(self, key: str):
        if key in self._memory_cache:
            value_size = len(json.dumps(self._memory_cache[key]).encode('utf-8'))
            del self._memory_cache[key]
            del self._cache_timestamps[key]
            self._current_cache_size -= value_size
    
    def _evict_oldest(self):
        if not self._cache_timestamps:
            return
        oldest_key = min(self._cache_timestamps.keys(),
                        key=lambda k: self._cache_timestamps[k])
        self._remove_from_memory_cache(oldest_key)
    
    def get_stats(self) -> dict:
        stats = {
            'memory_cache_entries': len(self._memory_cache),
            'memory_cache_size_bytes': self._current_cache_size,
            'memory_cache_size_mb': round(self._current_cache_size / (1024 * 1024), 2),
            'cache_timeout_seconds': self.cache_timeout,
            'redis_available': self.redis_client is not None
        }
        if self.redis_client:
            try:
                redis_info = self.redis_client.info('memory')
                stats['redis_memory_used'] = redis_info.get('used_memory_human', 'unknown')
            except:
                stats['redis_memory_used'] = 'unavailable'
        return stats