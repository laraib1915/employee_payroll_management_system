from bson import ObjectId

from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.logging_config import logger
from app.utils.core_response import core_response
from app.models.employee import (
    UpdateEmployee,
    GetEmployee,
    EmployeeType
)


async def update_employee(
    employee_id: str,
    payload: UpdateEmployee
):
    try:
        db = await get_db_conn()

        existing_employee = await db[collections.EMPLOYEES].find_one(
            {
                "_id": ObjectId(employee_id)
            }
        )

        if not existing_employee:
            return await core_response(
                status_code=404,
                message="Employee not found"
            )

        update_data = payload.model_dump(
            exclude_unset=True,
            mode="json"
        )

        # Interns should always have 0 annual leaves
        if (
            "employment_type" in update_data
            and update_data["employment_type"] == EmployeeType.intern
        ):
            update_data["annual_leave_balance"] = 0

        # Check duplicate employee number if being updated
        if "employee_number" in update_data:
            duplicate_employee = await db[collections.EMPLOYEES].find_one(
                {
                    "employee_number": update_data["employee_number"],
                    "_id": {"$ne": ObjectId(employee_id)}
                }
            )

            if duplicate_employee:
                return await core_response(
                    status_code=400,
                    message="Employee number already exists"
                )

        await db[collections.EMPLOYEES].update_one(
            {
                "_id": ObjectId(employee_id)
            },
            {
                "$set": update_data
            }
        )

        updated_employee = await db[collections.EMPLOYEES].find_one(
            {
                "_id": ObjectId(employee_id)
            }
        )

        updated_employee["id"] = str(updated_employee["_id"])
        updated_employee.pop("_id")

        response = GetEmployee.model_validate(
            updated_employee
        )

        logger.info(
            f"Employee updated successfully: {employee_id}"
        )

        return await core_response(
            status_code=200,
            message="Employee updated successfully",
            data=response.model_dump(mode="json")
        )

    except Exception as e:
        logger.exception(
            f"Error updating employee: {str(e)}"
        )
        raise