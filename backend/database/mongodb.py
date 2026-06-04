from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging

logger = logging.getLogger("healthbeast.database")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_helper = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    db_helper.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_helper.db = db_helper.client[settings.DATABASE_NAME]
    logger.info(f"Connected to MongoDB database: '{settings.DATABASE_NAME}' successfully!")

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_helper.client:
        db_helper.client.close()
    logger.info("MongoDB connection closed.")

def get_database():
    return db_helper.db
