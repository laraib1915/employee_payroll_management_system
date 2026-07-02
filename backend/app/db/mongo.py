from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import MONGO_URL, DB_NAME
from app.logging_config import logger

_default_client: AsyncIOMotorClient | None = None
_db_conn: AsyncIOMotorDatabase | None = None

async def get_db_conn () -> AsyncIOMotorDatabase:
    """
    Returns a shared MongoDB database connection.
    Creates a new connection on first use and validates
    existing connections using MongoDB ping.
    """

    global _default_client, _db_conn

    if _default_client is None or _db_conn is None:
        try:
            logger.info( "Initializing MongoDB connection" )
            _default_client = AsyncIOMotorClient(MONGO_URL)
            _db_conn = _default_client[DB_NAME]

            await _db_conn.command("ping")

            logger.info( "MongoDB connection established successfully" )
            return _db_conn
        except Exception as e:
            logger.exception( f"Failed to establish MongoDB connection: {e}" )
            raise

    try:
        await _db_conn.command("ping", maxTimeMS=1000)
        return _db_conn

    except Exception as e:
        logger.warning( f"MongoDB ping failed: {e}. Reconnecting..." )

        try:
            _default_client.close()
        except Exception as close_error:
            logger.exception( f"Error while closing MongoDB client: {close_error}" )

        try:
            _default_client = AsyncIOMotorClient(MONGO_URL)
            _db_conn = _default_client[DB_NAME]

            await _db_conn.command( "ping" )

            logger.info( "MongoDB reconnection successful" )
            return _db_conn
        except Exception as reconnect_error:
            logger.exception(  f"MongoDB reconnection failed: {reconnect_error}" )
            raise