import os

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import get_settings


class LLMService:
    def __init__(self) -> None:
        self.settings = get_settings()
        os.environ["OPENAI_API_KEY"] = self.settings.openrouter_api_key
        self.llm = ChatOpenAI(
            model=self.settings.openrouter_model,
            base_url=self.settings.openrouter_base_url,
            api_key=self.settings.openrouter_api_key,
            temperature=0.2,
        )

    def answer_question(self, question: str, matches: list[tuple[object, float]]) -> str:
        context = "\n\n".join(
            f"Source {index} ({doc.metadata.get('filename', 'unknown')}, "
            f"page {doc.metadata.get('page', 'unknown')}):\n{doc.page_content}"
            for index, (doc, _score) in enumerate(matches, start=1)
        )
        system_prompt = (
            "You are AI Document Search, a helpful RAG assistant. Answer the user's "
            "question using only the provided context. If the answer is not in the "
            "context, say you do not know based on the uploaded documents. Be concise, "
            "accurate, and cite relevant page numbers when available.\n\n"
            f"Context:\n{context}"
        )
        response = self.llm.invoke(
            [
                SystemMessage(content=system_prompt),
                HumanMessage(content=question),
            ]
        )
        return str(response.content)


llm_service = LLMService()
