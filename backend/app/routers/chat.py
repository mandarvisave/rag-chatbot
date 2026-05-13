from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.models.schemas import ChatRequest, ChatResponse, Source
from app.services.llm_service import llm_service
from app.services.vector_service import vector_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    if not vector_service.has_documents():
        return ChatResponse(
            answer="Please upload a PDF first so I have documents to search.",
            sources=[],
        )

    settings = get_settings()
    try:
        matches = vector_service.similarity_search(request.question, k=settings.top_k)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        if "AuthenticationError" in exc.__class__.__name__ or "User not found" in str(exc):
            raise HTTPException(
                status_code=401,
                detail=(
                    "OpenRouter rejected OPENROUTER_API_KEY while embedding the question. "
                    "Create/copy a valid OpenRouter API key, update backend/.env, "
                    "and restart the backend."
                ),
            ) from exc
        raise HTTPException(
            status_code=502,
            detail="Question embedding or vector search failed. Check backend logs.",
        ) from exc

    if not matches:
        return ChatResponse(
            answer="I could not find relevant context in the indexed documents.",
            sources=[],
        )

    try:
        answer = llm_service.answer_question(request.question, matches)
    except Exception as exc:
        if "AuthenticationError" in exc.__class__.__name__ or "User not found" in str(exc):
            raise HTTPException(
                status_code=401,
                detail=(
                    "OpenRouter rejected OPENROUTER_API_KEY while generating the answer. "
                    "Create/copy a valid OpenRouter API key, update backend/.env, "
                    "and restart the backend."
                ),
            ) from exc
        raise HTTPException(
            status_code=502,
            detail="LLM answer generation failed. Check OPENROUTER_API_KEY and model settings.",
        ) from exc
    sources = [
        Source(
            content=doc.page_content[:120],
            filename=doc.metadata.get("filename"),
            page=doc.metadata.get("page"),
            score=score,
        )
        for doc, score in matches
    ]
    return ChatResponse(answer=answer, sources=sources)
