import os
from typing import List
from sentence_transformers import SentenceTransformer
from .config import EMBEDDING_MODEL

_model = None

def get_embedding_model() -> SentenceTransformer:
    global _model
    if _model is None:
        model_name = EMBEDDING_MODEL or "all-MiniLM-L6-v2"
        try:
            # Load cached model weights immediately without HF Hub network latency
            _model = SentenceTransformer(model_name, local_files_only=True)
        except Exception:
            _model = SentenceTransformer(model_name)
    return _model

def embed_text(text: str) -> List[float]:
    """Generate a 384-dimensional vector embedding for a single text using all-MiniLM-L6-v2."""
    model = get_embedding_model()
    embedding = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
    return embedding.tolist()

def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generate vector embeddings for a list of texts in an efficient batch."""
    if not texts:
        return []
    model = get_embedding_model()
    embeddings = model.encode(texts, batch_size=32, convert_to_numpy=True, normalize_embeddings=True, show_progress_bar=False)
    return embeddings.tolist()
