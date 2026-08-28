from fastapi import FastAPI

from backend.app.api import (
    compounds,
    diseases,
    evidence,
    search,
    targets,
)
from backend.app.database import supabase


app = FastAPI(
    title="Asclepius API",
    description="Biomedical relationship exploration backend",
    version="0.1.0",
)


app.include_router(targets.router)
app.include_router(compounds.router)
app.include_router(diseases.router)
app.include_router(evidence.router)
app.include_router(search.router)


@app.get("/")
def root():
    return {
        "name": "Asclepius",
        "status": "running",
    }


@app.get("/health")
def health():
    try:
        supabase.table("organs").select("id").limit(1).execute()

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception:
        return {
            "status": "unhealthy",
            "database": "disconnected",
        }