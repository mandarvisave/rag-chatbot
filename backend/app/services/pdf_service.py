from io import BytesIO

import fitz
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import get_settings


class PDFService:
    def extract_chunks(self, pdf_bytes: bytes, filename: str) -> list[Document]:
        settings = get_settings()
        documents: list[Document] = []

        with fitz.open(stream=BytesIO(pdf_bytes), filetype="pdf") as pdf:
            for page_index, page in enumerate(pdf, start=1):
                text = page.get_text("text").strip()
                if text:
                    documents.append(
                        Document(
                            page_content=text,
                            metadata={"filename": filename, "page": page_index},
                        )
                    )

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ".", " ", ""],
        )
        return splitter.split_documents(documents)


pdf_service = PDFService()
