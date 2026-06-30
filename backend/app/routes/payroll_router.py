from fastapi import APIRouter

from app.logging_config import logger

from app.utils.core_response import (
    core_response
)

from app.models.payroll_request import (
    GeneratePayrollRequest
)

from app.features.payroll.generate_payroll import (
    generate_payroll
)


router = APIRouter(

    prefix="/payroll",

    tags=["Payroll"]
)


@router.post("/generate")
async def generate_payroll_api(

    payload: GeneratePayrollRequest
):

    try:

        return await generate_payroll(
            payload
        )

    except Exception as e:

        logger.exception(
            "Error generating payroll"
        )

        return await core_response(
            status_code=500,
            message=str(e)
        )