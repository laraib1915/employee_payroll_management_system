import traceback
from collections import defaultdict
import datetime
from fastapi import UploadFile
import pandas as pd
import io

from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.logging_config import logger
from app.utils.core_response import core_response

from app.models.attendance import (
    AttendanceDay,
    AttendanceDocument,
    AttendanceExcelRow
)

ALLOWED_EXTENSIONS = (".xls", ".xlsx")

def convert_to_minutes(value: datetime.time | None) -> int | None:
    if value is None:
        return None

    return value.hour * 60 + value.minute


async def upload_attendance(file: UploadFile):
    try:
        db = await get_db_conn()

        # =========================
        # Validate File
        # =========================
        if not file:
            return await core_response(
                message="No file uploaded",
                status_code=400
            )

        if not file.filename.lower().endswith(ALLOWED_EXTENSIONS):
            return await core_response(
                message="Only .xls and .xlsx files are allowed.",
                status_code=400
            )

        # =========================
        # Read File
        # =========================
        file_content = await file.read()

        if not file_content:
            return await core_response(
                message="Uploaded file is empty.",
                status_code=400
            )

        excel_file = io.BytesIO(file_content)

        if file.filename.lower().endswith(".xlsx"):
            df = pd.read_excel(
                excel_file,
                engine="openpyxl"
            )

        else:
            df = pd.read_excel(
                excel_file,
                engine="xlrd"
            )
        valid_rows = []
        errors = []

        # =========================
        # Validate Rows
        # =========================
        for index, row in df.iterrows():
            try:
                row_data = row.to_dict()
                # Convert NaN to None
                row_data = {
                    k: None if pd.isna(v) else v
                    for k, v in row_data.items()
                }

                # Convert Date
                if row_data.get("Date"):
                    row_data["Date"] = pd.to_datetime(
                        row_data["Date"],
                        dayfirst=True,
                        errors="coerce"
                    ).date()
                attendance = AttendanceExcelRow.model_validate( row_data)
                valid_rows.append(attendance)

            except Exception as e:
                errors.append({
                    "row": index + 2,
                    "error": str(e)
                })

        # =========================
        # Group Records
        # =========================
        grouped_data = defaultdict(list)
        seen_dates = defaultdict(set)

        for row in valid_rows:

            key = (
                row.employee_no,
                row.name,
                row.date.month,
                row.date.year
            )

            if row.date in seen_dates[key]:
                continue

            seen_dates[key].add(row.date)

            attendance_day = AttendanceDay(
                date=row.date,
                on_duty=row.on_duty,
                off_duty=row.off_duty,
                clock_in=row.clock_in,
                clock_out=row.clock_out,
                late_minutes=convert_to_minutes(row.late),
                early_minutes=convert_to_minutes(row.early),
                absent=row.absent,
                ot_time=row.ot_time,
                ndays_ot=row.ndays_ot,
                weekend_ot=row.weekend_ot,
                holiday_ot=row.holiday_ot
            )

            grouped_data[key].append(
                attendance_day.model_dump(mode="json")
            )

        inserted_count = 0
        updated_count = 0

        # =========================
        # Save to MongoDB
        # =========================
        for (
            employee_no,
            employee_name,
            month,
            year
        ), attendance_list in grouped_data.items():

            attendance_document = AttendanceDocument(
                employee_no=str(employee_no),
                employee_name=employee_name,
                month=month,
                year=year,
                attendance=attendance_list
            )

            existing_doc = await db[collections.ATTENDANCE].find_one({
                "employee_no": employee_no,
                "month": month,
                "year": year
            })
            if existing_doc:
                await db[collections.ATTENDANCE].update_one(
                    {
                        "_id": existing_doc["_id"]
                    },
                    {
                        "$set": {
                            "attendance": [
                                day.model_dump(mode="json")
                                for day in attendance_document.attendance
                            ],
                            "employee_name": employee_name
                        }
                    }
                )

                updated_count += 1

            else:

                await db[
                    collections.ATTENDANCE
                ].insert_one(
                    attendance_document.model_dump(mode="json")
                )

                inserted_count += 1

        logger.info(
            f"Attendance upload completed: "
            f"{inserted_count} inserted, "
            f"{updated_count} updated"
        )

        return await core_response(
            status_code=200,
            message="Attendance uploaded successfully",
            data={
                "total_rows": len(df),
                "valid_rows": len(valid_rows),
                "invalid_rows": len(errors),
                "inserted_documents": inserted_count,
                "updated_documents": updated_count,
                "errors": errors
            }
        )

    except Exception as e:
        logger.error(
            f"Error uploading attendance file: {str(e)}"
        )

        logger.error(traceback.format_exc())

        return await core_response(
            message="Failed to upload attendance file.",
            status_code=500
        )