from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.logging_config import logger


async def create_indexes():
    try:
        db = await get_db_conn()

        await db[collections.EMPLOYEES].create_index(
            "employee_number",
            unique=True,
            name="employee_number_unique"
        )

        await db[collections.ATTENDANCE].create_index(
            [
                ("employee_no", 1),
                ("month", 1),
                ("year", 1)
            ],
            unique=True,
            name="attendance_employee_month_year_unique"
        )

        await db[collections.ATTENDANCE].create_index(
            [
                ("month", 1),
                ("year", 1)
            ],
            name="attendance_month_year"
        )

        await db[collections.PAYROLL].create_index(
            [
                ("employee_no", 1),
                ("month", 1),
                ("year", 1)
            ],
            unique=True,
            name="payroll_employee_month_year_unique"
        )

        await db[collections.PAYROLL].create_index(
            [
                ("month", 1),
                ("year", 1)
            ],
            name="payroll_month_year"
        )

        await db[collections.PAYROLL_SUMMARY].create_index(
            [
                ("month", 1),
                ("year", 1)
            ],
            unique=True,
            name="payroll_summary_month_year_unique"
        )

        logger.info("Database indexes created successfully")

    except Exception as e:
        logger.exception(f"Error creating database indexes: {e}")
        raise