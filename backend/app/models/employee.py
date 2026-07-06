from pydantic import BaseModel, model_serializer, Field, field_validator
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
    contact_number: Optional[str] | None = None
    cnic: Optional[str] | None = None
    department: Optional[str] | None = None
    designation: Optional[str] | None = None
    employment_type: EmployeeType
    monthly_salary: float
    annual_leave_balance: int = 10
    joining_date: date
    probation_duration: Optional[int] = None
    status: EmployeeStatus

    @field_validator("contact_number")
    @classmethod
    def validate_contact_number(cls, value):
        if value is None or value == "":
            return value

        if not value.isdigit():
            raise ValueError("Contact number must contain only digits")

        if len(value) != 11:
            raise ValueError("Contact number must be exactly 11 digits")

        return value

    @field_validator("cnic")
    @classmethod
    def validate_cnic(cls, value):
        if value is None or value == "":
            return value

        if not value.isdigit():
            raise ValueError("CNIC must contain only digits")

        if len(value) != 13:
            raise ValueError("CNIC must be exactly 13 digits")

        return value
    
    @field_validator(
        "contact_number",
        "cnic",
        "department",
        "designation",
        mode="before"
    )
    @classmethod
    def convert_swagger_string(cls, value):

        if value == "string":
            return None

        return value

class CreateEmployee(EmployeeBase):
    pass


class UpdateEmployee(BaseModel):
    employee_number: Optional[str] = None
    employee_name: Optional[str] = None
    contact_number: Optional[str] | None = None
    cnic: Optional[str] | None = None
    department: Optional[str] | None = None
    designation: Optional[str] | None = None
    employment_type: Optional[EmployeeType] = None
    monthly_salary: Optional[float] = None
    joining_date: Optional[date] = None
    annual_leave_balance: Optional[int] = None
    probation_duration: Optional[int] = None
    status: Optional[EmployeeStatus] = None

    @field_validator("contact_number")
    @classmethod
    def validate_contact_number(cls, value):
        if value is None or value == "":
            return value
        if not value.isdigit():
            raise ValueError("Contact number must contain only digits")
        if len(value) != 11:
            raise ValueError("Contact number must be exactly 11 digits")
        return value

    @field_validator("cnic")
    @classmethod
    def validate_cnic(cls, value):
        if value is None or value == "":
            return value
        if not value.isdigit():
            raise ValueError("CNIC must contain only digits")
        if len(value) != 13:
            raise ValueError("CNIC must be exactly 13 digits")
        return value


class GetEmployee(BaseModel):
    id: str
    employee_number: str
    employee_name: str
    contact_number: str | None = None
    cnic: str | None = None
    department: str | None = None
    designation: str | None = None
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