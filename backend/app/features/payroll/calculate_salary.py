async def calculate_salary(
    monthly_salary: float,
    leave_deduction: float,
    late_deduction: float,
    half_day_deduction: float,
    loan_deduction: float = 0,
    bonus: float = 0,
    manual_adjustment: float = 0
):
    # Total Deductions
    total_deductions = (
        leave_deduction
        + late_deduction
        + half_day_deduction
        + loan_deduction
    )

    # Final Salary
    final_salary = (
        monthly_salary
        - total_deductions
        + manual_adjustment
        + bonus
    )

    final_salary = max(0,final_salary)
    return {
        "total_deductions":total_deductions,
        "final_salary":final_salary
    }