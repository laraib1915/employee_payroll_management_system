from pydantic import BaseModel, model_serializer, Field
from bson import ObjectId
from enum import Enum
from typing import Optional, List
from datetime import date

class EmployeeType (str, Enum):
    full_time = "Full-Time"
    part_time = "Part-Time"
    intern ="Intern"



class EmployeeStatus (str, Enum):
    active = "Active"
    inactive = "Inactive"


class EmployeeBase(BaseModel):
    employee_number: str
    employee_name: str
    contact_number: str
    cnic: Optional[str] = None
    department: str
    designation: str
    employment_type: EmployeeType
    monthly_salary: float
    annual_leave_balance: int = 10
    joining_date: date
    probation_duration: Optional[int] = None
    status: EmployeeStatus


class CreateEmployee(EmployeeBase):
    pass


class UpdateEmployee(BaseModel):
    employee_number: Optional[str] = None
    employee_name: Optional[str] = None
    contact_number: Optional[str] = None
    cnic: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    employment_type: Optional[EmployeeType] = None
    monthly_salary: Optional[float] = None
    joining_date: Optional[date] = None
    annual_leave_balance: Optional[int] = None
    probation_duration: Optional[int] = None
    status: Optional[EmployeeStatus] = None


class GetEmployee(BaseModel):
    id: str
    employee_number: str
    employee_name: str
    contact_number: str
    cnic: str | None = None
    department: str
    designation: str
    employment_type: EmployeeType
    monthly_salary: float
    annual_leave_balance: int
    joining_date: date
    probation_duration: int | None = None
    status: EmployeeStatus

    model_config = {
        "arbitrary_types_allowed": True,
        "populate_by_name": True
    }

    @model_serializer(mode="wrap")
    def serialize(self, handler):
        data = handler(self)
        data["id"] = str(self.id)
        data.pop("_id", None)
        return data

class GetAllEmployees(BaseModel):
    employees: List[GetEmployee]
    total_count: int