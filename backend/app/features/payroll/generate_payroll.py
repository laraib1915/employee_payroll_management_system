from app.db.mongo import get_db_conn
from app.db.collections import collections

from app.models.payroll import PayrollDocument
from app.models.payroll_request import GeneratePayrollRequest
from app.features.payroll.calculate_absences import calculate_absences
from app.features.payroll.calculate_lates import calculate_lates
from app.features.payroll.calculate_halfdays import calculate_halfdays
from app.features.payroll.calculate_salary import calculate_salary
from app.utils.core_response import core_response
from app.logging_config import logger
from app.features.payroll.summary_payroll import generate_payroll_summary
from app.models import settings

async def generate_payroll(
    payload: GeneratePayrollRequest
):
    try:
        db = await get_db_conn()
        
        settings = await db[collections.SETTINGS].find_one()
        if not settings:
            return await core_response(
                status_code=404,
                message="Payroll settings not found"
            )
        
        attendance_documents = await db[collections.ATTENDANCE].find(
            {
                "month": payload.month,
                "year": payload.year
            }
        ).to_list(length=None)

        if not attendance_documents:
            return await core_response(
                status_code=404,
                message="No attendance records found"
            )
        generated_payrolls = []

        for attendance_doc in attendance_documents:
            employee_no = str(attendance_doc["employee_no"])

            # Prevent Duplicate Payroll
            existing_payroll = await db[collections.PAYROLL].find_one(
                {
                    "employee_no": employee_no,
                    "month": payload.month,
                    "year": payload.year
                }
            )
            if existing_payroll:
                continue
            # Fetch Employee
            employee = await db[collections.EMPLOYEES].find_one(
                {
                    "employee_number": employee_no
                }
            )
            if not employee:
                continue
            # Daily Salary
            monthly_salary = employee["monthly_salary"]
            working_days = settings["working_days_per_month"]
            daily_salary = (monthly_salary / working_days)
            attendance_records = (attendance_doc["attendance"])
            # Annual Leave Override
            annual_leave_override = 0
            loan_deduction = 0.0
            bonus = 0.0

            for override in payload.payroll_overrides:

                if override.employee_no == employee_no:

                    if override.working_days_to_apply is not None:
                        working_days = override.working_days_to_apply

                    annual_leave_override = (
                        override.annual_leaves_to_apply
                    )

                    loan_deduction = (
                        override.loan_deduction_to_apply
                    )

                    bonus = (
                    override.bonus_to_apply
                    )

                    break       
            # Absence Calculation
            absence_result = (
                await calculate_absences(
                    attendance_records=attendance_records,
                    employee=employee,
                    settings=settings,
                    public_holidays=payload.public_holidays,
                    daily_salary=daily_salary,
                    annual_leave_override=annual_leave_override
                )
            )
            worked_days = (
                working_days -absence_result["absent_days"]
            )
            # Late Calculation
            late_result = (
                await calculate_lates(
                    attendance_records=attendance_records,
                    settings=settings,
                    daily_salary=daily_salary
                )
            )
            # Half Day Calculation
            halfday_result = (
                await calculate_halfdays(
                    attendance_records=attendance_records,
                    settings=settings,
                    daily_salary=daily_salary
                )
            )
            # Final Salary Calculation
            salary_result = (
                await calculate_salary(
                    monthly_salary=monthly_salary,
                    leave_deduction=absence_result["leave_deduction"],
                    late_deduction=late_result["late_deduction"],
                    half_day_deduction=halfday_result["half_day_deduction"],
                    loan_deduction=loan_deduction,
                    bonus=bonus,
                    manual_adjustment=0
                )
            )
            # Build Payroll Document
            payroll_document = (
                PayrollDocument(
                    employee_no=employee_no,
                    employee_name=employee.get("employee_name"),
                    department=employee.get("department"),
                    designation=employee.get("designation"),
                    employment_type=employee.get("employment_type"),
                    month=payload.month,
                    year=payload.year,
                    monthly_salary=monthly_salary,
                    per_day_salary=daily_salary,
                    working_days=working_days,
                    worked_days=worked_days,
                    worked_days_override=None,
                    absent_days=absence_result["absent_days"],
                    monthly_leave_used=absence_result["monthly_leave_used"],
                    annual_leave_used=absence_result["annual_leave_used"],
                    loan_deduction=loan_deduction,
                    bonus=bonus,
                    deductible_days=absence_result["deductible_days"],
                    leave_deduction=absence_result["leave_deduction"],
                    late_count=late_result["late_count"],
                    late_deduction=late_result["late_deduction"],
                    half_days=halfday_result["half_days"],
                    half_day_deduction=halfday_result["half_day_deduction"],
                    overtime_hours=0,
                    final_salary=salary_result["final_salary"]
                )
            )
            # Save Payroll
            payroll_data = (payroll_document.model_dump(mode="json"))
            await db[collections.PAYROLL].insert_one(payroll_data)

            # Reduce annual leave balance after payroll is saved
            annual_leave_used = absence_result["annual_leave_used"]
            if annual_leave_used > 0:
                await db[collections.EMPLOYEES].update_one(
                {
                        "employee_number": employee_no
                    },
                    {
                        "$inc": {
                            "annual_leave_balance": -annual_leave_used
                        }
                    }
                )
            generated_payrolls.append(payroll_data)
            await generate_payroll_summary(
            month=payload.month,
            year=payload.year
            )

        logger.info(f"Payroll generated for "f"{len(generated_payrolls)} "f"employees")
        return await core_response(
            status_code=201,
            message="Payroll generated successfully",
            data={"generated_payrolls":len(generated_payrolls)}
        )
    except Exception as e:
        logger.exception(f"Error generating payroll: "f"{str(e)}")
        raise