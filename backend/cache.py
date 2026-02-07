"""
In-memory caching module for TEN MediaHQ.
Provides fast data access with TTL-based expiration.
"""

from datetime import datetime, timezone, timedelta
from typing import Any, Optional, Dict
import asyncio

class SimpleCache:
    """Simple in-memory cache with TTL support"""
    
    def __init__(self, default_ttl: int = 60):
        self._cache: Dict[str, tuple] = {}  # key -> (value, expiry_time)
        self._default_ttl = default_ttl
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        if key in self._cache:
            value, expiry = self._cache[key]
            if datetime.now(timezone.utc) < expiry:
                return value
            else:
                # Expired, remove it
                del self._cache[key]
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with TTL"""
        ttl = ttl or self._default_ttl
        expiry = datetime.now(timezone.utc) + timedelta(seconds=ttl)
        self._cache[key] = (value, expiry)
    
    def delete(self, key: str) -> None:
        """Delete key from cache"""
        if key in self._cache:
            del self._cache[key]
    
    def clear(self) -> None:
        """Clear all cached data"""
        self._cache.clear()
    
    def invalidate_pattern(self, pattern: str) -> None:
        """Invalidate all keys matching a pattern (simple prefix match)"""
        keys_to_delete = [k for k in self._cache.keys() if k.startswith(pattern)]
        for key in keys_to_delete:
            del self._cache[key]

# Global cache instance - 60 second default TTL
cache = SimpleCache(default_ttl=60)

# Cache key generators
def users_cache_key(team: Optional[str] = None) -> str:
    return f"users:{team or 'all'}"

def services_cache_key(team: Optional[str] = None) -> str:
    return f"services:{team or 'all'}"

def equipment_cache_key(team: Optional[str] = None) -> str:
    return f"equipment:{team or 'all'}"

def dashboard_cache_key(team: Optional[str] = None) -> str:
    return f"dashboard:{team or 'all'}"

def teams_cache_key() -> str:
    return "teams:all"
