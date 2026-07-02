from app.models.employee import EmployeeType

async def calculate_absences(
    attendance_records: list,
    employee: dict,
    settings,
    public_holidays: int,
    daily_salary: float,
    annual_leave_override: int = 0
):
    absent_days = 0
    for day in attendance_records:
        if day.get("absent") is True:
            absent_days += 1

    monthly_leave_allowed = (settings.get("monthly_leave_allowed",1))
    monthly_leave_used = min(absent_days,monthly_leave_allowed)
    
    remaining_absences = (absent_days - monthly_leave_used)

    annual_leave_used = 0

    employment_type = employee.get("employment_type")
    if (employment_type !=EmployeeType.intern):

        employee_annual_balance = (
            employee.get("annual_leave_balance",0))
        annual_leave_used = min(
            annual_leave_override,
            remaining_absences,
            employee_annual_balance
        )
        
    deductible_days = (
        remaining_absences
        - annual_leave_used
        - public_holidays
    )

    deductible_days = max(
        0,
        deductible_days
    )
    # Leave Deduction
    leave_deduction = (
        deductible_days *
        daily_salary
    )
    return {

        "absent_days":absent_days,
        "monthly_leave_used":monthly_leave_used,
        "annual_leave_used":annual_leave_used,
        "deductible_days":deductible_days,
        "leave_deduction":leave_deduction
    }