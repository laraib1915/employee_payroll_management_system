from pydantic import BaseModel, Field


class PayrollOverride(BaseModel):

    employee_no: str
    working_days_to_apply: int | None = None
    annual_leaves_to_apply: int = Field(default=0, ge=0)
    bonus_to_apply: float = Field(default=0.0, ge=0)
    loan_deduction_to_apply: float = Field(default=0.0, ge=0)


class GeneratePayrollRequest(BaseModel):

    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000)
    public_holidays: int = Field(default=0, ge=0)
    payroll_overrides: list[PayrollOverride] = Field(default_factory=list)


class UpdatePayrollRequest(BaseModel):

    worked_days: int = Field(ge=0)