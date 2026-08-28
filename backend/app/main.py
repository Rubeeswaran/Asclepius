from fastapi import FastAPI

app = FastAPI(
    title="Asclepius API",
    description="Biomedical relationship exploration backend",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "name": "Asclepius",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }