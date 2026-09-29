from fastapi import APIRouter
from backend.schemas.documents import HealthResponse, StatsResponse
from backend.services.rag_service import RagService

router = APIRouter(prefix="/api", tags=["Health & Stats"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    """Check system health, database connection, and API configuration."""
    health_data = RagService.get_health()
    return HealthResponse(**health_data)

@router.get("/stats", response_model=StatsResponse)
def get_stats():
    """Retrieve operational statistics including document counts and model config."""
    stats_data = RagService.get_stats()
    return StatsResponse(**stats_data)
