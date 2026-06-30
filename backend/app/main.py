from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.employee_router import (
    router as employee_router
)

from app.routes.attendence_router import (
    router as attendence_router
)

from app.routes.payroll_router import (
    router as payroll_router
)

from app.routes.settings_router import (
    router as settings_router
)
from app.features.settings.seed_settings import (
    seed_settings
)


app = FastAPI()


@app.on_event("startup")
async def startup_event():

    await seed_settings()


origins = {
    "http://localhost:5173"
}


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(employee_router)
app.include_router(attendence_router)
app.include_router(payroll_router)
app.include_router(settings_router)

@app.get("/")
async def root():

    return {
        "message":
        "FastAPI and MongoDB is running"
    }