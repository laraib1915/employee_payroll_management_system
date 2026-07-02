from fastapi import UploadFile, File, APIRouter

from app.logging_config import logger
from app.utils.core_response import core_response
from app.features.attendance.upload_attendance import upload_attendance

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

@router.post("/upload")
async def upload_attendance_api(
    file: UploadFile = File(...)
):
    try:
        return await upload_attendance(file)
    except Exception as e:
        logger.exception("Error uploading attendance file")
        return await core_response(
            status_code=500,
            message=str(e)
        )