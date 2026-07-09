from datetime import datetime, date

from app.db.mongo import get_db_conn
from app.db.collections import collections

from app.models.payroll import PayrollDocument
from app.models.payroll_request import GeneratePayrollRequest

from app.features.payroll.calculate_absences import calculate_absences
from app.features.payroll.calculate_lates import calculate_lates
from app.features.payroll.calculate_halfdays import calculate_halfdays
from app.features.payroll.calculate_salary import calculate_salary
from app.features.payroll.summary_payroll import generate_payroll_summary
from app.utils.core_response import core_response
from app.logging_config import logger

async def generate_payroll(
    payload: GeneratePayrollRequest
):
    try:
        current_date = datetime.now()
        current_month = current_date.month
        current_year = current_date.year

        if payload.year > current_year or (payload.year == current_year and payload.month > current_month):
            return await core_response(
                status_code=400,
                message=f"Cannot generate payroll for future months. Current month is {current_month}/{current_year}. Please select a valid month."
            )
        
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
                message=f"No attendance records found for {payload.month}/{payload.year}. Please upload attendance data first."
            )
        generated_payrolls = []
        # Generate Payroll
        for attendance_doc in attendance_documents:
            employee_no = str(attendance_doc["employee_no"])
            
            # Fetch Employee
            employee = await db[collections.EMPLOYEES].find_one({"employee_number": employee_no})
            if not employee:
                continue
            if employee.get("status") != "Active":
                continue
            
            joining_date = employee.get("joining_date")

            if joining_date:
                # Handle legacy JSON string dates
                if isinstance(joining_date, str):
                    joining_date = date.fromisoformat(joining_date)

                # Handle MongoDB datetime values
                elif isinstance(joining_date, datetime):
                    joining_date = joining_date.date()

                if (
                    joining_date.year > payload.year or
                    (
                        joining_date.year == payload.year
                        and joining_date.month > payload.month
                    )
                ):
                    continue
                
            # Check Existing Payroll
            existing_payroll = await db[collections.PAYROLL].find_one(
                {
                    "employee_no": employee_no,
                    "month": payload.month,
                    "year": payload.year
                }
            )

            # Restore Previous Leaves
            if existing_payroll:
                previous_annual_leave_used = (existing_payroll.get("annual_leave_used",0))
                if previous_annual_leave_used > 0:
                    await db[collections.EMPLOYEES].update_one(
                        {"employee_number": employee_no},
                        {"$inc": {"annual_leave_balance":previous_annual_leave_used}}
                    )

                    # Refresh employee data
                    employee = await db[collections.EMPLOYEES].find_one(
                        {"employee_number": employee_no}
                    )

            # Salary Setup
            monthly_salary = employee["monthly_salary"]
            working_days = settings["working_days_per_month"]
            daily_salary = (monthly_salary / working_days)
            attendance_records = (attendance_doc["attendance"])
            
            # Payroll Overrides
            annual_leave_override = 0
            loan_deduction = 0.0
            bonus = 0.0
            worked_days_override = None
            half_days_override = None

            for override in payload.payroll_overrides:
                if override.employee_no == employee_no:

                    if (override.worked_days_to_apply is not None and override.worked_days_to_apply > 0):
                        worked_days_override = (override.worked_days_to_apply)

                    if (override.half_days_to_apply is not None and override.half_days_to_apply >= 0):
                        half_days_override = (override.half_days_to_apply)

                    annual_leave_override = (override.annual_leaves_to_apply)
                    loan_deduction = (override.loan_deduction_to_apply)
                    bonus = (override.bonus_to_apply)
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

            actual_worked_days = (working_days - absence_result["absent_days"])
            final_worked_days = (
                worked_days_override
                if worked_days_override is not None
                else actual_worked_days
            )

            # Leave / Deduction Logic
            if worked_days_override is not None:
                # Missing days according to override
                total_missing_days = max( working_days - worked_days_override, 0 )
                # Paid leaves consumed
                total_paid_leaves = ( absence_result["monthly_leave_used"] + absence_result["annual_leave_used"] )
                deductible_days = max(total_missing_days - total_paid_leaves, 0 )
                recalculated_leave_deduction = ( deductible_days * daily_salary )
            else:
                deductible_days = ( absence_result["deductible_days"])
                recalculated_leave_deduction = ( absence_result["leave_deduction"] )
            
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
            # Half Day Override Logic
            if half_days_override is not None:
                final_half_days = (half_days_override)
                recalculated_half_day_deduction = ( (final_half_days * daily_salary) / 2 )
            else:
                final_half_days = ( halfday_result["half_days"] )
                recalculated_half_day_deduction = ( halfday_result[ "half_day_deduction"] )

            # Final Salary Calculation
            salary_result = (
                await calculate_salary(
                    monthly_salary=monthly_salary,
                    leave_deduction=( recalculated_leave_deduction ),
                    late_deduction=late_result[ "late_deduction" ],
                    half_day_deduction=( recalculated_half_day_deduction ),
                    loan_deduction=loan_deduction,
                    bonus=bonus,
                    manual_adjustment=0
                )
            )
            # Build Payroll Document
            payroll_document = PayrollDocument(
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
                worked_days=actual_worked_days,
                worked_days_override=(worked_days_override),
                absent_days=(absence_result["absent_days"]),
                monthly_leave_used=(absence_result["monthly_leave_used"]),
                annual_leave_used=(absence_result["annual_leave_used"]),
                deductible_days=(deductible_days),
                leave_deduction=(recalculated_leave_deduction),
                late_count=(late_result["late_count"]),
                late_deduction=(late_result["late_deduction"]),
                half_days=(halfday_result["half_days"]),
                half_days_override=(half_days_override),
                half_day_deduction=(recalculated_half_day_deduction),
                overtime_hours=0,
                bonus=bonus,
                loan_deduction=(loan_deduction),
                final_salary=(salary_result["final_salary"])
            )
            # Save / Override Payroll
            payroll_data = (payroll_document.model_dump(mode="json"))
            await db[collections.PAYROLL].update_one(
                {
                    "employee_no": employee_no,
                    "month": payload.month,
                    "year": payload.year
                },
                {"$set": payroll_data},
                upsert=True
            )
            # Deduct Annual Leaves
            annual_leave_used = (absence_result["annual_leave_used"])
            if annual_leave_used > 0:
                await db[collections.EMPLOYEES].update_one(
                    {"employee_number": employee_no},
                    {
                        "$inc": {
                            "annual_leave_balance":
                            -annual_leave_used
                        }
                    }
                )
            generated_payrolls.append(payroll_data)

        # Generate Payroll Summary
        logger.info(f"Generated payrolls: {len(generated_payrolls)}")
        await generate_payroll_summary(
            month=payload.month,
            year=payload.year
        )
        logger.info(f"Payroll generated for "f"{len(generated_payrolls)} "f"employees")

        return await core_response(
            status_code=201,
            message="Payroll generated successfully",
            data={
                "generated_payrolls":
                len(generated_payrolls)
            }
        )
    except Exception as e:
        logger.exception(f"Error generating payroll: "f"{str(e)}")
        raise