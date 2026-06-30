from app.db.mongo import get_db_conn
from app.logging_config import logger
from app.db.collections import collections
from app.models.settings import PayrollSettings

async def seed_settings():
    db = await get_db_conn()
    existing_settings = await db[collections.SETTINGS].find_one()
    if existing_settings:
        logger.info("Payroll settings already exists")
        return
    default_settings = PayrollSettings().model_dump(mode="json")
    await db[collections.SETTINGS].insert_one(default_settings)
    logger.info("Default payroll settings seeded successfully")