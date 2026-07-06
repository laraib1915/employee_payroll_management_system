async def calculate_lates(
    attendance_records: list,
    settings,
    daily_salary: float
):
    # Count Late Arrivals
    late_count = 0
    for day in attendance_records:
        late_value = day.get("late_minutes")
        if (
            late_value is not None
            and str(late_value).strip() != ""
        ):
            late_count += 1
    # Allowed Lates
    allowed_lates = (settings.get("allowed_late_arrivals", 0))
    extra_lates = max(
        0,
        late_count - allowed_lates
    )
    # Deduction Calculation
    deduction_rate = (settings.get("late_deduction_rate", 0))

    late_deduction = (
        extra_lates *
        (daily_salary * deduction_rate)
    )

    return {

        "late_count":late_count,
        "extra_lates":extra_lates,
        "late_deduction":late_deduction
    }