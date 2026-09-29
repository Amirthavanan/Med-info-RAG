from fastapi import APIRouter, HTTPException
from backend.schemas.chat import ChatRequest, ChatResponse
from backend.services.rag_service import RagService

router = APIRouter(prefix="/api", tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Process question against indexed drug information documents using RAG.
    Returns grounded answer along with expanded source citations.
    """
    query = request.get_query()
    if not query:
        raise HTTPException(status_code=400, detail="Query message cannot be empty")
    
    try:
        response = RagService.ask(query)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )
