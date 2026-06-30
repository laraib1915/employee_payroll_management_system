from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.utils.core_response import core_response
from app.logging_config import logger
from app.models.settings import UpdatePayrollSettingsRequest, GetSettingsResponse

async def update_settings(
        payload:UpdatePayrollSettingsRequest
):
    try:
        db = await get_db_conn()
        existing_settings = await db[collections.SETTINGS].find_one()
        if not existing_settings:
            return await core_response(
                status_code=404,
                message="Settings not found"
            )
        updated_data = payload.model_dump(mode="json")
        await db[collections.SETTINGS].update_one(
            {
                "_id":existing_settings["_id"]
            },
            {
                "$set": updated_data
            }
        )
        updated_settings = await db[collections.SETTINGS].find_one(
            {
                "_id": existing_settings["_id"]
            }
        )
        settings_response = ( GetSettingsResponse( 
            id=str( updated_settings["_id"] ), 
            working_days_per_month= updated_settings[ "working_days_per_month" ], 
            annual_leave_allocation= updated_settings[ "full_time_annual_leave_allocation" ], 
            intern_annual_leave_allocation= updated_settings[ "intern_annual_leave_allocation" ], 
            monthly_leave_allocation= updated_settings[ "monthly_leave_allocation" ], 
            allowed_late_arrivals= updated_settings[ "allowed_late_arrivals" ], 
            late_deduction_rate= updated_settings[ "late_deduction_rate" ], 
            half_day_threshold_hours= updated_settings[ "half_day_threshold_hours" ]
            ) 
        )
        logger.info("Payroll settings updated successfully")
        return await core_response(
            status_code=200,
            message="Settings updated successfully",
            data=settings_response.model_dump(mode = "json")
        )
    except Exception as e:
        logger.exception(f"Error updating settings: " f"{str(e)}")
        raise