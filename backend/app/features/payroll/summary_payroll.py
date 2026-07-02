from app.db.mongo import get_db_conn
from app.db.collections import collections
from app.models.payroll import PayrollSummary
from app.logging_config import logger

async def generate_payroll_summary(
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
        # Replace Existing Summary
        await db[collections.PAYROLL_SUMMARY].delete_one(
            {
                "month": month,
                "year": year
            }
        )
        # Calculate Summary
        total_employees_processed = len(payrolls)
        total_gross_salary = sum(payroll.get("monthly_salary",0)for payroll in payrolls)
        total_deductions = sum(payroll.get("leave_deduction",0)
            + payroll.get("late_deduction",0)
            + payroll.get("half_day_deduction",0)
            + payroll.get("loan_deduction",0)
            for payroll in payrolls
        )
        total_net_payroll = sum(payroll.get("final_salary",0)for payroll in payrolls)
        total_amount_required_for_salary_disbursement = (total_net_payroll)
        # Summary Document
        payroll_summary = PayrollSummary(
            month=month,
            year=year,
            total_employees_processed=total_employees_processed,
            total_gross_salary=total_gross_salary,
            total_deductions=total_deductions,
            total_net_payroll=total_net_payroll,
            total_amount_required_for_salary_disbursement=total_amount_required_for_salary_disbursement
        )

        payroll_summary_data = (payroll_summary.model_dump(mode="json"))
        await db[collections.PAYROLL_SUMMARY].insert_one(payroll_summary_data)
        logger.info(f"Payroll summary generated for "f"{month}/{year}")
        return payroll_summary_data

    except Exception as e:
        logger.exception(f"Error generating payroll summary: {str(e)}")
        raise