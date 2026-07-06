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
    per_day_salary: float
    working_days: int
    worked_days: int
    worked_days_override: int | None = None
    absent_days: int = 0
    monthly_leave_used: int = 0
    annual_leave_used: int = 0
    deductible_days: int = 0
    leave_deduction: float = 0
    late_count: int = 0
    late_deduction: float = 0
    half_days: int = 0
    half_days_override: int | None = None
    half_day_deduction: float = 0
    overtime_hours: float = 0
    bonus: float = 0.0
    loan_deduction: float = 0.0
    final_salary: float
    salary_received: bool = False
    generated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class PayrollSummary(BaseModel):

    month: int
    year: int
    total_employees_processed: int
    total_gross_salary: float
    total_deductions: float
    total_net_payroll: float
    total_amount_required_for_salary_disbursement: float
    generated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )