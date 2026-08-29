from fastapi import FastAPI

from .api.search import router as search_router
from .api.diseases import router as disease_router
from .api.targets import router as target_router
from .api.compounds import router as compound_router
from .api.evidence import router as evidence_router
from .api.ai import router as ai_router
from .database import supabase

app = FastAPI(
    title="Asclepius API",
    description="Biomedical relationship exploration backend",
    version="0.1.0",
)

app.include_router(search_router)
app.include_router(disease_router)
app.include_router(target_router)
app.include_router(compound_router)
app.include_router(evidence_router)
app.include_router(ai_router)


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