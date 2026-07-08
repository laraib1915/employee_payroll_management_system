import os
from dotenv import load_dotenv
from app.logging_config import logger

# Load variables from the .env file in the project root
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URL or not DB_NAME:
    raise EnvironmentError(
        "Missing required environment variables: MONGO_URL or DB_NAME"
    )

logger.info(f"MONGO_URL: {MONGO_URL}")
logger.info(f"DB_NAME: {DB_NAME}")