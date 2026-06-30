from pydantic import BaseModel, Field


class AnnualLeaveOverride(BaseModel):

    employee_no: str

    annual_leaves_to_apply: int = Field( ge=0 )


class GeneratePayrollRequest(BaseModel):

    month: int = Field(
        ge=1,
        le=12
    )

    year: int = Field( ge=2000 )

    public_holidays: int = Field(
        default=0,
        ge=0
    )

    annual_leave_overrides: list[AnnualLeaveOverride] = Field(default_factory=list)