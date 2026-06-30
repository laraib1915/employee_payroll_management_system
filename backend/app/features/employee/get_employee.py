from bson import ObjectId

from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.logging_config import logger
from app.utils.core_response import core_response
from app.models.employee import GetEmployee


async def get_employee(
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

        employee["id"] = str(employee["_id"])
        employee.pop("_id")

        response = GetEmployee.model_validate(
            employee
        )

        logger.info(
            f"Retrieved employee: {employee_id}"
        )

        return await core_response(
            status_code=200,
            message="Employee retrieved successfully",
            data=response.model_dump(mode="json")
        )

    except Exception as e:
        logger.exception(
            f"Error retrieving employee: {str(e)}"
        )
        raise