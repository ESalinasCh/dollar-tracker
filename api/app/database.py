"""
MongoDB database connection and price history storage.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import Optional, List
import logging
import os

logger = logging.getLogger(__name__)

# MongoDB connection string - defaults to local, can be overridden with env var
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "dollar_tracker")


class Database:
    """MongoDB database connection handler."""
    
    client: Optional[AsyncIOMotorClient] = None
    db = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB."""
        try:
            cls.client = AsyncIOMotorClient(MONGO_URL)
            cls.db = cls.client[DB_NAME]
            
            # Create indexes for price_history collection
            await cls.db.price_history.create_index([("timestamp", -1)])
            await cls.db.price_history.create_index([("exchange", 1), ("timestamp", -1)])
            
            logger.info(f"Connected to MongoDB at {MONGO_URL}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            cls.client = None
            cls.db = None
    
    @classmethod
    async def disconnect(cls):
        """Disconnect from MongoDB."""
        if cls.client:
            cls.client.close()
            logger.info("Disconnected from MongoDB")
    
    @classmethod
    def is_connected(cls) -> bool:
        """Check if database is connected."""
        return cls.client is not None and cls.db is not None


class PriceHistoryService:
    """Service for storing and retrieving price history from MongoDB."""
    
    @staticmethod
    async def store_price(
        exchange: str,
        bid: float,
        ask: float,
        last: float,
        source: str = "api"
    ) -> Optional[str]:
        """
        Store a price record in the database.
        Returns the inserted document ID or None if failed.
        """
        if not Database.is_connected():
            logger.warning("MongoDB not connected, skipping price storage")
            return None
        
        try:
            doc = {
                "exchange": exchange,
                "bid": bid,
                "ask": ask,
                "last": last,
                "timestamp": datetime.utcnow(),
                "source": source
            }
            result = await Database.db.price_history.insert_one(doc)
            logger.debug(f"Stored price for {exchange}: {last}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Failed to store price: {e}")
            return None
    
    @staticmethod
    async def get_price_24h_ago(exchange: str = None) -> Optional[float]:
        """
        Get the price from approximately 24 hours ago.
        Returns the 'last' price or None if not found.
        """
        if not Database.is_connected():
            return None
        
        try:
            target_time = datetime.utcnow() - timedelta(hours=24)
            # Allow 1 hour window around 24h mark
            window_start = target_time - timedelta(hours=1)
            window_end = target_time + timedelta(hours=1)
            
            query = {
                "timestamp": {"$gte": window_start, "$lte": window_end}
            }
            if exchange:
                query["exchange"] = exchange
            
            doc = await Database.db.price_history.find_one(
                query,
                sort=[("timestamp", -1)]
            )
            
            if doc:
                return doc.get("last")
            return None
        except Exception as e:
            logger.error(f"Failed to get 24h ago price: {e}")
            return None
    
    @staticmethod
    async def get_history(
        exchange: str = None,
        hours: int = 24
    ) -> List[dict]:
        """
        Get price history for the specified time range.
        Returns list of price documents.
        """
        if not Database.is_connected():
            return []
        
        try:
            since = datetime.utcnow() - timedelta(hours=hours)
            query = {"timestamp": {"$gte": since}}
            if exchange:
                query["exchange"] = exchange
            
            cursor = Database.db.price_history.find(
                query,
                sort=[("timestamp", 1)]
            )
            
            return await cursor.to_list(length=1000)
        except Exception as e:
            logger.error(f"Failed to get history: {e}")
            return []
    
    @staticmethod
    async def calculate_24h_change(current_price: float, exchange: str = None) -> Optional[float]:
        """
        Calculate the 24h price change percentage.
        Returns the percentage change or None if no historical data.
        """
        price_24h_ago = await PriceHistoryService.get_price_24h_ago(exchange)
        
        if price_24h_ago and price_24h_ago > 0:
            change = ((current_price - price_24h_ago) / price_24h_ago) * 100
            return round(change, 2)
        
        return None
    
    @staticmethod
    async def cleanup_old_data(days_to_keep: int = 30):
        """
        Remove price data older than specified days.
        """
        if not Database.is_connected():
            return
        
        try:
            cutoff = datetime.utcnow() - timedelta(days=days_to_keep)
            result = await Database.db.price_history.delete_many(
                {"timestamp": {"$lt": cutoff}}
            )
            logger.info(f"Cleaned up {result.deleted_count} old price records")
        except Exception as e:
            logger.error(f"Failed to cleanup old data: {e}")


# Singleton instances
db = Database()
price_history_service = PriceHistoryService()
