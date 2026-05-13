from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import chat, upload

app = FastAPI(title="AI Document Search API", version="1.0.0")
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(upload.router, tags=["upload-compat"])
app.include_router(chat.router, tags=["chat-compat"])


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
