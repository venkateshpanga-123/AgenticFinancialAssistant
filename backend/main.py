from fastapi import FastAPI

from app.database.database import Base, engine
from app.models.user import User

app = FastAPI(
    title="Agentic Financial Operations Assistant",
    version="1.0.0"
)

# Create database tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "status": "success",
        "message": "Agentic Financial Operations Assistant API is Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }