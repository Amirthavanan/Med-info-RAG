from typing import Dict, Any, List
from rag.pipeline import answer_question
from rag.vector_store import get_collection
import rag.config as config
from backend.schemas.chat import ChatResponse, ChatSource
from backend.services.indexing_service import IndexingService

class RagService:
    @staticmethod
    def ask(query: str) -> ChatResponse:
        if not query or not query.strip():
            return ChatResponse(
                answer="Please provide a valid question regarding the indexed drug documents.",
                sources=[]
            )

        # Call the existing RAG pipeline
        result = answer_question(query.strip())
        
        raw_sources = result.get("sources", [])
        formatted_sources: List[ChatSource] = []
        for s in raw_sources:
            doc_name = s.get("document") or s.get("source") or "Unknown"
            page_val = s.get("page") or 1
            content_val = s.get("content") or s.get("text") or ""
            formatted_sources.append(
                ChatSource(
                    document=str(doc_name),
                    page=page_val,
                    content=str(content_val)
                )
            )

        return ChatResponse(
            answer=result.get("answer", "No answer could be generated."),
            sources=formatted_sources
        )

    @staticmethod
    def get_stats() -> Dict[str, Any]:
        collection = get_collection()
        total_chunks = collection.count()
        docs = IndexingService.get_documents()

        return {
            "total_documents": len(docs),
            "total_chunks": total_chunks,
            "embedding_model": config.EMBEDDING_MODEL,
            "generation_model": config.GENERATION_MODEL,
            "chroma_status": "connected",
            "backend_status": "healthy",
            "chunk_size": config.CHUNK_SIZE,
            "chunk_overlap": config.CHUNK_OVERLAP,
            "top_k": config.TOP_K,
            "collection_name": config.COLLECTION_NAME
        }

    @staticmethod
    def get_health() -> Dict[str, Any]:
        collection = get_collection()
        total_chunks = collection.count()
        
        return {
            "status": "healthy",
            "database": "connected",
            "collection": config.COLLECTION_NAME,
            "total_chunks": total_chunks,
            "embedding_model": config.EMBEDDING_MODEL,
            "generation_model": config.GENERATION_MODEL,
            "api_key_configured": bool(config.GEMINI_API_KEY)
        }
