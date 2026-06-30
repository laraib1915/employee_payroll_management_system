from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.logging_config import logger
from app.utils.core_response import core_response
from app.models.settings import GetSettingsResponse

async def get_settings():
    try:
        db = await get_db_conn()
        settings = await db[collections.SETTINGS].find_one()
        if not settings:
            return await core_response(
                status_code=404,
                message="Settings not found"
            )
        settings_response = (GetSettingsResponse(
            id=str(settings["_id"]),
            working_days_per_month= settings[ "working_days_per_month" ],
            annual_leave_allocation= settings[ "full_time_annual_leave_allocation" ],
            intern_annual_leave_allocation= settings[ "intern_annual_leave_allocation" ], 
            monthly_leave_allocation= settings[ "monthly_leave_allocation" ], 
            allowed_late_arrivals= settings[ "allowed_late_arrivals" ], 
            late_deduction_rate= settings[ "late_deduction_rate" ], 
            half_day_threshold_hours= settings[ "half_day_threshold_hours" ]
        ))
        return await core_response(
            status_code=200,
            message="Settings fetched successfully",
            data=settings_response.model_dump(mode = "json")
        )
    except Exception as e:
        logger.exception(f"Error fetching settings: " f"{str(e)}")
        raise