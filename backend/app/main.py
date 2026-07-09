from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await seed_settings()
        print("✅ Settings seeded successfully")
    except Exception as e:
        print(f"❌ Error occurred while seeding settings: {e}")
    yield

app = FastAPI(
    title="Employee Payroll and Attendance Management system",
    description="Backend system for managing employee payroll and attendance",
    version="1.0.0",
    lifespan=lifespan
    )


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://your-vercel-app.vercel.app",  # Add your production URL
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/assets", StaticFiles(directory="app/static/assets"), name="assets")

app.include_router(employee_router)
app.include_router(attendence_router)
app.include_router(payroll_router)
app.include_router(settings_router)


@app.get("/")
async def serve_frontend():
    return FileResponse("app/static/index.html")


@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    return FileResponse("app/static/index.html")