from datetime import datetime, timezone
from pydantic import BaseModel, Field


class PayrollDocument(BaseModel):

    employee_no: str
    employee_name: str

    department: str | None = None
    designation: str | None = None
    employment_type: str | None = None

    month: int
    year: int

    monthly_salary: float

    # from settings collection
    working_days: int

    absent_days: int = 0

    monthly_leave_used: int = 0
    annual_leave_used: int = 0

    deductible_days: int = 0

    leave_deduction: float = 0

    late_count: int = 0
    late_deduction: float = 0

    half_days: int = 0
    half_day_deduction: float = 0

    overtime_hours: float = 0

    manual_adjustment: float | None = None
    adjustment_reason: str | None = None

    final_salary: float

    salary_received: bool = False

    generated_at: datetime = Field(
        default_factory=lambda:
        datetime.now(timezone.utc)
    )