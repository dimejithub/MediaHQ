"""
Database connection module for TEN MediaHQ.
Provides a shared MongoDB connection with optimized settings for performance.
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'ten_mediahq')

if not mongo_url:
    raise ValueError("MONGO_URL environment variable is required")

# Optimized connection settings for better performance
# - maxPoolSize: allows more concurrent connections
# - minPoolSize: keeps connections warm
# - maxIdleTimeMS: closes idle connections after 30s
# - serverSelectionTimeoutMS: fast fail for unavailable server
client = AsyncIOMotorClient(
    mongo_url,
    maxPoolSize=10,
    minPoolSize=2,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=3000,
    connectTimeoutMS=3000,
    socketTimeoutMS=5000,
    retryWrites=True,
    retryReads=True,
    tls=True,
    tlsAllowInvalidCertificates=False
)

db = client[db_name]

# Track database availability
_db_available = None
_last_check = None

async def check_db_connection() -> bool:
    """Check if database is available (with caching)"""
    global _db_available, _last_check
    
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    
    # Cache the result for 30 seconds
    if _last_check and _db_available is not None:
        if now - _last_check < timedelta(seconds=30):
            return _db_available
    
    try:
        # Quick ping to check connection
        await asyncio.wait_for(
            db.command('ping'),
            timeout=2.0
        )
        _db_available = True
    except Exception:
        _db_available = False
    
    _last_check = now
    return _db_available

async def get_with_fallback(collection_name: str, query: dict, fallback_data: list, projection: dict = None, limit: int = 100):
    """
    Get data from database with automatic fallback to provided data.
    This ensures fast responses even when DB is slow/unavailable.
    """
    try:
        if projection is None:
            projection = {"_id": 0}
        
        result = await asyncio.wait_for(
            db[collection_name].find(query, projection).to_list(limit),
            timeout=2.0
        )
        
        if result:
            return result, True  # (data, from_db)
    except Exception as e:
        print(f"DB query failed for {collection_name}, using fallback: {e}")
    
    return fallback_data, False  # (data, from_db)
