from datetime import datetime,date

async def calculate_halfdays(
    attendance_records: list,
    settings,
    daily_salary: float
):
    # Half Day Counter
    half_days = 0
    threshold_hours = (settings.get("half_day_threshold_hours", 0))

    for day in attendance_records:
        clock_in = day.get("clock_in")
        clock_out = day.get("clock_out")
        # Skip Invalid Records
        if not clock_in or not clock_out:
            continue

        # Convert Time -> Datetime
        # Convert string to time if needed
        if isinstance(clock_in, str):
            clock_in = datetime.strptime(clock_in, "%H:%M:%S").time()
        if isinstance(clock_out, str):
            clock_out = datetime.strptime(clock_out, "%H:%M:%S").time()
        check_in_datetime = datetime.combine(
            date.today(),
            clock_in
        )
        check_out_datetime = datetime.combine(
            date.today(),
            clock_out
        )
        # Worked Hours
        worked_seconds = (
            check_out_datetime -
            check_in_datetime
        ).total_seconds()

        worked_hours = (
            worked_seconds / 3600
        )

        # Half Day Check
        if worked_hours <= threshold_hours:
            half_days += 1

    # Deduction Calculation
    half_day_deduction = (
        half_days *
        (daily_salary / 2)
    )

    return {
        "half_days":half_days,
        "half_day_deduction":half_day_deduction
    }