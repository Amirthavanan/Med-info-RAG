from typing import List, Optional
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: Optional[str] = None
    question: Optional[str] = None
    history: Optional[List[ChatMessage]] = None

    def get_query(self) -> str:
        return (self.message or self.question or "").strip()

class ChatSource(BaseModel):
    document: str
    page: int | str
    content: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[ChatSource]
