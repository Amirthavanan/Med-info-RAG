from typing import List, Optional
from pydantic import BaseModel, Field

class DocumentItem(BaseModel):
    id: str
    filename: str
    pages: int = 0
    chunks: int = 0
    file_size: int = 0
    indexed_at: str
    status: str = "indexed"

class DocumentListResponse(BaseModel):
    documents: List[DocumentItem]
    total_count: int

class UploadResultItem(BaseModel):
    filename: str
    pages: int
    chunks: int
    file_size: int
    status: str
    message: Optional[str] = None

class UploadResponse(BaseModel):
    results: List[UploadResultItem]
    success: bool

class IndexRequest(BaseModel):
    filename: Optional[str] = None
    document_id: Optional[str] = None

class IndexResponse(BaseModel):
    filename: str
    pages: int
    chunks: int
    status: str
    message: str

class StatsResponse(BaseModel):
    total_documents: int
    total_chunks: int
    embedding_model: str
    generation_model: str
    chroma_status: str
    backend_status: str
    chunk_size: int
    chunk_overlap: int
    top_k: int
    collection_name: str

class HealthResponse(BaseModel):
    status: str
    database: str
    collection: str
    total_chunks: int
    embedding_model: str
    generation_model: str
    api_key_configured: bool

class ActionResponse(BaseModel):
    success: bool
    message: str
    deleted_chunks: Optional[int] = None
