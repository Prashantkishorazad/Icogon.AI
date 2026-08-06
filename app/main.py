from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.user import router as user_router
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router
from app.routers.upload import router as upload_router

app = FastAPI(
    title="ICOGON AI API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(upload_router)


@app.get("/")
def home():
    return {
        "message": "ICOGON AI API Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }