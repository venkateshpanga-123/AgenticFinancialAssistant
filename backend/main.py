from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine

from app.api import auth
from app.api import support
from app.api import transactions
from app.api import agent
from app.api import approvals
from app.api import risky
from app.api import audit

# =========================================================
# CREATE APP
# =========================================================

app = FastAPI(
    title="Agentic Financial Assistant",
    version="1.0.0"
)

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)

# =========================================================
# API ROUTERS
# =========================================================

app.include_router(auth.router)
app.include_router(support.router)
app.include_router(transactions.router)
app.include_router(agent.router)
app.include_router(approvals.router)
app.include_router(risky.router)
app.include_router(audit.router)

# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Agentic Financial Assistant API",
        "status": "running"
    }