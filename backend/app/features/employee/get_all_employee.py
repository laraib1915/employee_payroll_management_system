from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.logging_config import logger
from app.utils.core_response import core_response
from app.models.employee import (
    GetEmployee,
    GetAllEmployees
)

async def get_all_employee():
    try:
        db = await get_db_conn()
        employees_cursor = db[collections.EMPLOYEES].find()
        cursor = db[collections.EMPLOYEES].find()
        employees = await cursor.to_list(length=None)
        employee_responses = []

        for employee in employees:
            employee["id"] = str (employee["_id"])
            employee.pop("_id")

            employee_responses.append(
                GetEmployee.model_validate(employee)
            )
        
        response = GetAllEmployees(
            employees=employee_responses,
            total_count=len(employee_responses)
        )
        logger.info(f"Retrieved {len(employee_responses)} employees")

        return await core_response(
            status_code=200,
            message="Employees retrieved successfully",
            data=response.model_dump(mode="json")
        )
    except Exception as e:
        logger.exception(f"Error retrieving employees: {str(e)}")
        raise