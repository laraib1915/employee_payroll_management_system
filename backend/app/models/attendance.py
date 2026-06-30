import datetime
from pydantic import BaseModel, Field

class AttendanceExcelRow(BaseModel):

    employee_no: str | int = Field(alias="Emp No.")

    serial_no: int | None = Field(
        default=None,
        alias="No."
    )

    name: str = Field(alias="Name")

    date: datetime.date = Field(alias="Date")

    on_duty: datetime.time | None = Field(
        default=None,
        alias="On duty"
    )

    off_duty: datetime.time | None = Field(
        default=None,
        alias="Off duty"
    )

    clock_in: datetime.time | None = Field(
        default=None,
        alias="Clock In"
    )

    clock_out: datetime.time | None = Field(
        default=None,
        alias="Clock Out"
    )

    late: datetime.time | None = Field(
        default=None,
        alias="Late"
    )

    early: datetime.time | None = Field(
        default=None,
        alias="Early"
    )

    absent: bool | None = Field(
        default=None,
        alias="Absent"
    )

    ot_time: str | None = Field(
        default=None,
        alias="OT Time"
    )

    ndays_ot: float | None = Field(
        default=None,
        alias="NDays_OT"
    )

    weekend_ot: float | None = Field(
        default=None,
        alias="WeekEnd_OT"
    )

    holiday_ot: float | None = Field(
        default=None,
        alias="Holiday_OT"
    )

    model_config = { "populate_by_name": True }


class AttendanceDay(BaseModel):

    date: datetime.date

    on_duty: datetime.time | None = None
    off_duty: datetime.time | None = None

    clock_in: datetime.time | None = None
    clock_out: datetime.time | None = None

    late_minutes: int | None = None
    early_minutes: int | None = None

    absent: bool | None = None

    ot_time: str | None = None

    ndays_ot: float | None = None
    weekend_ot: float | None = None
    holiday_ot: float | None = None


class AttendanceDocument(BaseModel):

    employee_no: str
    employee_name: str

    month: int
    year: int

    attendance: list[AttendanceDay] = Field(
        default_factory=list
    )