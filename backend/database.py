"""
Database connection module for TEN MediaHQ.
Provides a shared MongoDB connection for all routes.
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'ten_mediahq')

if not mongo_url:
    raise ValueError("MONGO_URL environment variable is required")

# Add TLS options for MongoDB Atlas
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
    socketTimeoutMS=10000,
    retryWrites=True,
    tls=True,
    tlsAllowInvalidCertificates=False
)
db = client[db_name]
