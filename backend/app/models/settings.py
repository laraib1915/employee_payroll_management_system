from datetime import datetime, timezone
from pydantic import BaseModel, Field


class PayrollSettings(BaseModel):

    working_days_per_month: int = 22
    full_time_annual_leave_allocation: int = 10
    intern_annual_leave_allocation: int = 0
    monthly_leave_allocation: int = 1
    allowed_late_arrivals: int = 4
    late_deduction_rate: float = 0.25
    half_day_threshold_hours: int = 4
    generated_at: datetime = Field(
        default_factory=lambda:
        datetime.now(timezone.utc)
    )


class GetSettingsResponse(BaseModel):
    
    id: str     
    working_days_per_month: int 
    annual_leave_allocation: int 
    intern_annual_leave_allocation: int 
    monthly_leave_allocation: int 
    allowed_late_arrivals: int 
    late_deduction_rate: float 
    half_day_threshold_hours: int


class UpdatePayrollSettingsRequest( BaseModel ):

    working_days_per_month: int = Field( ge=1 )    
    full_time_annual_leave_allocation: int = Field( ge=0 )
    intern_annual_leave_allocation: int = Field( ge=0 )
    monthly_leave_allocation: int = Field( ge=0 )
    allowed_late_arrivals: int = Field( ge=0 )
    late_deduction_rate: float = Field( ge=0 )
    half_day_threshold_hours: int = Field( ge=1 )