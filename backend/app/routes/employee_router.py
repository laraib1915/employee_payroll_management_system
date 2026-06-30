from fastapi import APIRouter

from app.utils.core_response import core_response
from app.logging_config import logger

from app.features.employee.create_employee import create_employee
from app.features.employee.update_employee import update_employee
from app.features.employee.get_employee import get_employee
from app.features.employee.get_all_employee import get_all_employee
from app.features.employee.deactivate_employee import deactivate_employee

from app.models.employee import (
    CreateEmployee,
    UpdateEmployee
)

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.post("")
async def create_employee_api(
    payload: CreateEmployee
):
    try:
        return await create_employee(payload)

    except Exception as e:
        logger.exception("Error in create employee")
        return await core_response(
            status_code=500,
            message=str(e)
        )


@router.get("")
async def get_all_employees_api():
    try:
        return await get_all_employee()

    except Exception as e:
        logger.exception("Error in get all employees")
        return await core_response(
            status_code=500,
            message=str(e)
        )


@router.get("/{employee_id}")
async def get_employee_api(
    employee_id: str
):
    try:
        return await get_employee(employee_id)

    except Exception as e:
        logger.exception("Error in get employee")
        return await core_response(
            status_code=500,
            message=str(e)
        )


@router.patch("/{employee_id}")
async def update_employee_api(
    employee_id: str,
    payload: UpdateEmployee
):
    try:
        return await update_employee(
            employee_id,
            payload
        )

    except Exception as e:
        logger.exception("Error in update employee")
        return await core_response(
            status_code=500,
            message=str(e)
        )


@router.patch("/{employee_id}/deactivate")
async def deactivate_employee_api(
    employee_id: str
):
    try:
        return await deactivate_employee(employee_id)

    except Exception as e:
        logger.exception("Error in deactivate employee")
        return await core_response(
            status_code=500,
            message=str(e)
        )