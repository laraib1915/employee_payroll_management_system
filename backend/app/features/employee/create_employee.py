from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.logging_config import logger
from app.utils.core_response import core_response
from app.models.employee import (
    CreateEmployee,
    EmployeeType,
    GetEmployee
)


async def create_employee(
    payload: CreateEmployee
):
    try:
        db = await get_db_conn()

        existing_employee = await db[collections.EMPLOYEES].find_one(
            {
                "employee_number": payload.employee_number
            }
        )

        if existing_employee:
            return await core_response(
                status_code=400,
                message="Employee number already exists"
            )

        employee_data = payload.model_dump(mode="json")

        # Interns do not receive annual leaves
        if payload.employment_type == EmployeeType.intern:
            employee_data["annual_leave_balance"] = 0

        result = await db[collections.EMPLOYEES].insert_one(
            employee_data
        )

        created_employee = await db[collections.EMPLOYEES].find_one(
            {
                "_id": result.inserted_id
            }
        )

        created_employee["id"] = str(created_employee["_id"])
        created_employee.pop("_id")

        employee_response = GetEmployee.model_validate(
            created_employee
        )

        logger.info(
            f"Employee created successfully: {payload.employee_number}"
        )

        return await core_response(
            status_code=201,
            message="Employee created successfully",
            data=employee_response.model_dump(
                mode="json",
                exclude_none=True
                )
        )

    except Exception as e:
        logger.exception(
            f"Error creating employee: {str(e)}"
        )
        raise