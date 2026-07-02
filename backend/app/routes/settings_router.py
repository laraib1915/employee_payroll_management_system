from fastapi import APIRouter
from app.logging_config import logger
from app.utils.core_response import core_response
from app.models.settings import UpdatePayrollSettingsRequest
from app.features.settings.get_settings import get_settings
from app.features.settings.update_settings import update_settings

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)


@router.get("")
async def get_settings_api():
    try:
        return await get_settings()
    except Exception as e:
        logger.exception(
            "Error fetching settings"
        )
        return await core_response(
            status_code=500,
            message=str(e)
        )


@router.put("")
async def update_settings_api(
    payload:
    UpdatePayrollSettingsRequest
):
    try:
        return await update_settings(
            payload
        )
    except Exception as e:
        logger.exception(
            "Error updating settings"
        )
        return await core_response(
            status_code=500,
            message=str(e)
        )