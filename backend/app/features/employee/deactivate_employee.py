from bson import ObjectId

from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.logging_config import logger
from app.utils.core_response import core_response


async def deactivate_employee(
    employee_id: str
):
    try:
        db = await get_db_conn()

        employee = await db[collections.EMPLOYEES].find_one(
            {
                "_id": ObjectId(employee_id)
            }
        )

        if not employee:
            return await core_response(
                status_code=404,
                message="Employee not found"
            )

        await db[collections.EMPLOYEES].update_one(
            {
                "_id": ObjectId(employee_id)
            },
            {
                "$set": {
                    "status": "Inactive"
                }
            }
        )

        logger.info(
            f"Employee deactivated successfully: {employee_id}"
        )

        return await core_response(
            status_code=200,
            message="Employee deactivated successfully"
        )

    except Exception as e:
        logger.exception(
            f"Error deactivating employee: {str(e)}"
        )
        raise