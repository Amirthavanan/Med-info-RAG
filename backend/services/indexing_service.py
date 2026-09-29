import os
import io
import json
import uuid
import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from rag.pdf_loader import extract_pages
from rag.chunker import chunk_pages
from rag.vector_store import get_collection, clear_collection, index_chunks
from rag.config import CHUNK_SIZE, CHUNK_OVERLAP

REGISTRY_PATH = Path("data/documents_registry.json")
UPLOADS_DIR = Path("data/uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

def _read_registry() -> Dict[str, Any]:
    if not REGISTRY_PATH.exists():
        initial_registry = {"documents": []}
        _sync_from_chroma(initial_registry)
        _save_registry(initial_registry)
        return initial_registry
    try:
        with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Sync with chroma if chroma has docs not in registry
            _sync_from_chroma(data)
            return data
    except Exception:
        fallback = {"documents": []}
        _sync_from_chroma(fallback)
        return fallback

def _save_registry(data: Dict[str, Any]):
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def _sync_from_chroma(registry: Dict[str, Any]):
    """Sync any pre-existing indexed documents found in ChromaDB into registry."""
    try:
        collection = get_collection()
        if collection.count() == 0:
            return
        
        existing_filenames = {d["filename"] for d in registry.get("documents", [])}
        results = collection.get(include=["metadatas"])
        metadatas = results.get("metadatas", [])
        
        doc_stats: Dict[str, Dict[str, Any]] = {}
        for meta in metadatas:
            if not meta:
                continue
            src = meta.get("source")
            if not src:
                continue
            page = int(meta.get("page", 1))
            if src not in doc_stats:
                doc_stats[src] = {"chunks": 0, "max_page": 1}
            doc_stats[src]["chunks"] += 1
            if page > doc_stats[src]["max_page"]:
                doc_stats[src]["max_page"] = page

        modified = False
        for src, stats in doc_stats.items():
            if src not in existing_filenames:
                doc_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, src))[:8]
                registry.setdefault("documents", []).append({
                    "id": doc_id,
                    "filename": src,
                    "pages": stats["max_page"],
                    "chunks": stats["chunks"],
                    "file_size": 0,
                    "indexed_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "status": "indexed"
                })
                modified = True
        
        if modified and REGISTRY_PATH.exists():
            _save_registry(registry)
    except Exception as e:
        print(f"ChromaDB sync warning: {e}")

class IndexingService:
    @staticmethod
    def get_documents() -> List[Dict[str, Any]]:
        registry = _read_registry()
        return registry.get("documents", [])

    @staticmethod
    def get_document_by_id(doc_id: str) -> Optional[Dict[str, Any]]:
        docs = IndexingService.get_documents()
        for d in docs:
            if d.get("id") == doc_id or d.get("filename") == doc_id:
                return d
        return None

    @staticmethod
    def save_and_index_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Save PDF to uploads folder, parse, chunk, embed, and register."""
        # 1. Save locally for reference
        save_path = UPLOADS_DIR / filename
        with open(save_path, "wb") as f:
            f.write(file_bytes)
        file_size = len(file_bytes)

        # 2. Extract pages using pypdf
        stream = io.BytesIO(file_bytes)
        pages = extract_pages(stream)
        if not pages:
            raise ValueError(f"No extractable text found in '{filename}'. Ensure the PDF contains readable text.")

        # 3. Chunk
        chunks = chunk_pages(pages, CHUNK_SIZE, CHUNK_OVERLAP)

        # 4. Index in ChromaDB
        count = index_chunks(chunks, filename)

        # 5. Update Registry
        registry = _read_registry()
        doc_id = str(uuid.uuid4())[:8]

        # Remove previous entry if re-indexing the same file
        docs = [d for d in registry.get("documents", []) if d.get("filename") != filename]
        
        doc_record = {
            "id": doc_id,
            "filename": filename,
            "pages": len(pages),
            "chunks": count,
            "file_size": file_size,
            "indexed_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "indexed"
        }
        docs.insert(0, doc_record)
        registry["documents"] = docs
        _save_registry(registry)

        return doc_record

    @staticmethod
    def index_existing_file(filename: str) -> Dict[str, Any]:
        file_path = UPLOADS_DIR / filename
        if not file_path.exists():
            raise FileNotFoundError(f"File {filename} not found in uploads directory")
        with open(file_path, "rb") as f:
            data = f.read()
        return IndexingService.save_and_index_file(data, filename)

    @staticmethod
    def delete_document(doc_id_or_name: str) -> Dict[str, Any]:
        doc = IndexingService.get_document_by_id(doc_id_or_name)
        if not doc:
            raise ValueError(f"Document '{doc_id_or_name}' not found")

        filename = doc["filename"]
        collection = get_collection()
        deleted_count = 0

        try:
            # Query count of chunks to be deleted
            existing = collection.get(where={"source": filename})
            if existing and existing.get("ids"):
                deleted_count = len(existing["ids"])
                collection.delete(where={"source": filename})
        except Exception as e:
            print(f"Error deleting from ChromaDB: {e}")

        # Update registry
        registry = _read_registry()
        registry["documents"] = [
            d for d in registry.get("documents", [])
            if d.get("id") != doc["id"] and d.get("filename") != filename
        ]
        _save_registry(registry)

        # Also remove uploaded file if exists
        upload_path = UPLOADS_DIR / filename
        if upload_path.exists():
            try:
                upload_path.unlink()
            except Exception:
                pass

        return {
            "success": True,
            "message": f"Document '{filename}' successfully deleted",
            "deleted_chunks": deleted_count
        }

    @staticmethod
    def clear_all() -> Dict[str, Any]:
        clear_collection()
        _save_registry({"documents": []})
        return {
            "success": True,
            "message": "Entire knowledge base and indexed documents cleared."
        }
