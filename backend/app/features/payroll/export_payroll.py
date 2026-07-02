from io import BytesIO
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.logging_config import logger

async def export_salary_sheet(
    month: int,
    year: int
):
    try:
        db = await get_db_conn()
        payrolls = await db[collections.PAYROLL].find(
            {
                "month": month,
                "year": year
            }
        ).to_list(length=None)
        if not payrolls:
            raise ValueError("No payroll records found")
        payroll_summary = await db[collections.PAYROLL_SUMMARY].find_one(
            {
                "month": month,
                "year": year
            }
        )

        if not payroll_summary:
            raise ValueError("Payroll summary not found")

        # Create Workbook 
        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = "Payroll"
        headers = [
            "Employee No",
            "Employee Name",
            "Department",
            "Designation",
            "Employment Type",
            "Monthly Salary",
            "Per Day Salary",
            "Working Days",
            "Worked Days",
            "Absent Days",
            "Monthly Leave Used",
            "Annual Leave Used",
            "Deductible Days",
            "Leave Deduction",
            "Late Count",
            "Late Deduction",
            "Half Days",
            "Half Day Deduction",
            "Bonus",
            "Loan Deduction",
            "Total Deductions",
            "Final Salary",
            "Salary Received"
        ]
        worksheet.append(headers)
        # Employee Payroll Records
        for payroll in payrolls:

            total_deductions = (
                payroll.get(
                    "leave_deduction",
                    0
                )
                + payroll.get(
                    "late_deduction",
                    0
                )
                + payroll.get(
                    "half_day_deduction",
                    0
                )
                + payroll.get(
                    "loan_deduction",
                    0
                )
            )

            worksheet.append(
                [
                    payroll.get("employee_no"),
                    payroll.get("employee_name"),
                    payroll.get("department"),
                    payroll.get("designation"),
                    payroll.get("employment_type"),
                    payroll.get("monthly_salary"),
                    payroll.get("per_day_salary"),
                    payroll.get("working_days"),
                    payroll.get("worked_days"),
                    payroll.get("absent_days"),
                    payroll.get("monthly_leave_used"),
                    payroll.get("annual_leave_used"),
                    payroll.get("deductible_days"),
                    payroll.get("leave_deduction"),
                    payroll.get("late_count"),
                    payroll.get("late_deduction"),
                    payroll.get("half_days"),
                    payroll.get("half_day_deduction"),
                    payroll.get("bonus"),
                    payroll.get("loan_deduction"),
                    total_deductions,
                    payroll.get("final_salary"),
                    "Yes"
                    if payroll.get(
                        "salary_received"
                    )
                    else "No"
                ]
            )
        # Payroll Summary
        worksheet.append([])
        worksheet.append(["Payroll Summary"])
        worksheet.append(
            [
                "Month",
                payroll_summary.get("month")
            ]
        )
        worksheet.append(
            [
                "Year",
                payroll_summary.get("year")
            ]
        )
        worksheet.append(
            [
                "Total Employees Processed",
                payroll_summary.get(
                    "total_employees_processed"
                )
            ]
        )
        worksheet.append(
            [
                "Total Gross Salary",
                payroll_summary.get(
                    "total_gross_salary"
                )
            ]
        )
        worksheet.append(
            [
                "Total Deductions",
                payroll_summary.get(
                    "total_deductions"
                )
            ]
        )
        worksheet.append(
            [
                "Total Net Payroll",
                payroll_summary.get(
                    "total_net_payroll"
                )
            ]
        )
        worksheet.append(
            [
                "Total Amount Required For Salary Disbursement",
                payroll_summary.get(
                    "total_amount_required_for_salary_disbursement"
                )
            ]
        )
        # Return Excel File
        excel_file = BytesIO()
        workbook.save(excel_file)
        excel_file.seek(0)
        return StreamingResponse(
            excel_file,
            media_type=(
                "application/"
                "vnd.openxmlformats-"
                "officedocument."
                "spreadsheetml.sheet"
            ),
            headers={
                "Content-Disposition":
                (
                    f'attachment; '
                    f'filename="Payroll_{month}_{year}.xlsx"'
                )
            }
        )
    except Exception as e:
        logger.exception(f"Error exporting salary sheet: {str(e)}")
        raise