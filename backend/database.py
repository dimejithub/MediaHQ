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
# Reduced timeouts for faster fallback when MongoDB is unavailable
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=2000,  # Reduced from 10000 for faster fallback
    connectTimeoutMS=2000,
    socketTimeoutMS=2000,
    retryWrites=True,
    tls=True,
    tlsAllowInvalidCertificates=False
)
db = client[db_name]
