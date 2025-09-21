import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        # The cache is cleared on every check, so no need for timeout, size, or other state.
        pass

    def get(self, key: str) -> Optional[Any]:
        # Always clear the cache on every 'get' check, effectively returning nothing.
        self.clear()
        return None

    def set(self, key: str, value: Any) -> bool:
        # Don't do anything with the data.
        return True

    def delete(self, key: str) -> bool:
        # Doesn't do anything with the data, so no need to delete.
        return True

    def clear(self) -> bool:
        # Log a message for clarity, but the method itself is now empty.
        logger.info("Cache cleared.")
        return True

    def get_stats(self) -> dict:
        # Returns empty stats.
        return {
            'memory_cache_entries': 0,
            'memory_cache_size_bytes': 0,
            'memory_cache_size_mb': 0.0,
            'cache_timeout_seconds': 0,
            'redis_available': False
        }