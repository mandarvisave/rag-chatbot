import os
from pathlib import Path
from uuid import uuid4

from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

from app.config import get_settings

try:
    from pinecone import Pinecone, ServerlessSpec
except ImportError:  # pragma: no cover - optional dependency path
    Pinecone = None
    ServerlessSpec = None


class VectorService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.embeddings = self._build_embeddings()
        self.store: FAISS | None = None
        self._load_faiss_if_available()

    def _build_embeddings(self) -> OpenAIEmbeddings:
        os.environ["OPENAI_API_KEY"] = self.settings.openrouter_api_key
        return OpenAIEmbeddings(
            model=self.settings.embedding_model,
            base_url=self.settings.openrouter_base_url,
            api_key=self.settings.openrouter_api_key,
        )

    def _ensure_openrouter_key(self) -> None:
        if not self.settings.openrouter_api_key:
            raise RuntimeError(
                "OPENROUTER_API_KEY is missing. Add it to backend/.env and restart the backend."
            )

    @property
    def use_pinecone(self) -> bool:
        return self.settings.vector_store.lower() == "pinecone"

    def _load_faiss_if_available(self) -> None:
        if self.use_pinecone:
            return

        path = Path(self.settings.faiss_store_path)
        if path.is_file():
            self.store = FAISS.deserialize_from_bytes(
                path.read_bytes(),
                self.embeddings,
                allow_dangerous_deserialization=True,
            )

    def has_documents(self) -> bool:
        if self.use_pinecone:
            return bool(self.settings.pinecone_api_key)
        return self.store is not None and self.store.index.ntotal > 0

    def upsert(self, documents: list[Document]) -> int:
        if self.use_pinecone:
            return self._upsert_pinecone(documents)
        return self._upsert_faiss(documents)

    def similarity_search(self, question: str, k: int) -> list[tuple[Document, float]]:
        if self.use_pinecone:
            return self._similarity_search_pinecone(question, k)

        if self.store is None:
            return []
        self._ensure_openrouter_key()
        return self.store.similarity_search_with_score(question, k=k)

    def _upsert_faiss(self, documents: list[Document]) -> int:
        self._ensure_openrouter_key()
        if self.store is None:
            self.store = FAISS.from_documents(documents, self.embeddings)
        else:
            self.store.add_documents(documents)

        Path(self.settings.faiss_store_path).write_bytes(self.store.serialize_to_bytes())
        return len(documents)

    def _pinecone_index(self):
        if Pinecone is None:
            raise RuntimeError("pinecone-client is not installed.")
        if not self.settings.pinecone_api_key:
            raise RuntimeError("PINECONE_API_KEY is required for VECTOR_STORE=pinecone.")

        try:
            pc = Pinecone(api_key=self.settings.pinecone_api_key)
            has_index = (
                pc.has_index(self.settings.pinecone_index_name)
                if hasattr(pc, "has_index")
                else self.settings.pinecone_index_name
                in [index["name"] for index in pc.list_indexes()]
            )
            if not has_index:
                pc.create_index(
                    name=self.settings.pinecone_index_name,
                    dimension=1536,
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
                )
            return pc.Index(self.settings.pinecone_index_name)
        except Exception as exc:
            if "Unauthorized" in exc.__class__.__name__ or "Invalid API Key" in str(exc):
                raise RuntimeError(
                    "Pinecone rejected PINECONE_API_KEY. Create/copy a valid API key "
                    "for the same Pinecone project as your index, update backend/.env, "
                    "and restart the backend."
                ) from exc
            raise

    def _upsert_pinecone(self, documents: list[Document]) -> int:
        self._ensure_openrouter_key()
        index = self._pinecone_index()
        texts = [doc.page_content for doc in documents]
        vectors = self.embeddings.embed_documents(texts)
        payload = [
            (
                str(uuid4()),
                vector,
                {
                    **doc.metadata,
                    "text": doc.page_content,
                },
            )
            for doc, vector in zip(documents, vectors, strict=True)
        ]
        index.upsert(vectors=payload)
        return len(documents)

    def _similarity_search_pinecone(
        self, question: str, k: int
    ) -> list[tuple[Document, float]]:
        self._ensure_openrouter_key()
        index = self._pinecone_index()
        query_vector = self.embeddings.embed_query(question)
        results = index.query(vector=query_vector, top_k=k, include_metadata=True)
        matches: list[tuple[Document, float]] = []
        for match in results.get("matches", []):
            metadata = dict(match.get("metadata") or {})
            text = metadata.pop("text", "")
            matches.append(
                (
                    Document(page_content=text, metadata=metadata),
                    float(match.get("score", 0.0)),
                )
            )
        return matches


vector_service = VectorService()
