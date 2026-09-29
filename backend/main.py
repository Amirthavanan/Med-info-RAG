import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv(override=True)

from backend.routes.health import router as health_router
from backend.routes.documents import router as documents_router
from backend.routes.chat import router as chat_router

app = FastAPI(
    title="MedInfo RAG — Drug Information Assistant API",
    description="Document-grounded healthcare drug information assistant powered by Gemini and ChromaDB",
    version="1.0.0",
)

# Enable CORS for frontend applications (Vite, local dev, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(health_router)
app.include_router(documents_router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {
        "name": "MedInfo RAG — Drug Information Assistant API",
        "status": "online",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
