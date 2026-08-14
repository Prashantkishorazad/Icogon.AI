from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.user import router as user_router
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.upload import router as upload_router
from app.routers.orchestrator import router as orchestrator_router


app = FastAPI(
    title="ICOGON AI API",
    version="1.0.0"
)


# ==========================================
# CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Frontend - Vite
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Frontend - Vite alternate port
        "http://localhost:5174",
        "http://127.0.0.1:5174",

        # Frontend - CURRENT PORT
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ==========================================
# ROUTERS
# ==========================================

app.include_router(user_router)

app.include_router(auth_router)

app.include_router(chat_router)

app.include_router(upload_router)

app.include_router(orchestrator_router)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def home():
    return {
        "message": "ICOGON AI API Running 🚀"
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
def health():
    return {
        "status": "ok"
    }
