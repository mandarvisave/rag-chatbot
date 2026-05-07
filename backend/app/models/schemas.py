from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    filename: str
    chunks_stored: int


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)


class Source(BaseModel):
    content: str
    filename: str | None = None
    page: int | None = None
    score: float | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source] = []
