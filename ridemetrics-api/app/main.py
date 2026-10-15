from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine
app = FastAPI(
    title="RideMetrics API",
    description="API for cycling activity analytics",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ridemetrics-api",
    }


@app.get("/")
def root():
    return {
        "message": "Welcome to the RideMetrics API",
        "docs": "/docs",
    }

@app.get("/health/database")
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected",
        }

    except Exception:
        return {
            "status": "error",
            "database": "unavailable",
        }