from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models.schemas import UploadResponse
from app.services.pdf_service import pdf_service
from app.services.vector_service import vector_service

router = APIRouter()


@router.post("/upload-pdf", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    pdf_bytes = await file.read()
    chunks = pdf_service.extract_chunks(pdf_bytes, file.filename)

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="No readable text was found in this PDF.",
        )

    try:
        chunks_stored = vector_service.upsert(chunks)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        if "AuthenticationError" in exc.__class__.__name__ or "User not found" in str(exc):
            raise HTTPException(
                status_code=401,
                detail=(
                    "OpenRouter rejected OPENROUTER_API_KEY while creating embeddings. "
                    "Create/copy a valid OpenRouter API key, update backend/.env, "
                    "and restart the backend."
                ),
            ) from exc
        raise HTTPException(
            status_code=502,
            detail=(
                "Document text was extracted, but embedding/indexing failed. "
                "Check OPENROUTER_API_KEY, EMBEDDING_MODEL, and backend logs."
            ),
        ) from exc

    return UploadResponse(filename=file.filename, chunks_stored=chunks_stored)
