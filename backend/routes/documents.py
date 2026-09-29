from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.schemas.documents import (
    DocumentItem,
    UploadResponse,
    UploadResultItem,
    IndexRequest,
    IndexResponse,
    ActionResponse
)
from backend.services.indexing_service import IndexingService

router = APIRouter(prefix="/api", tags=["Documents"])

@router.get("/documents", response_model=List[DocumentItem])
def get_documents():
    """Retrieve all indexed drug-label documents."""
    docs = IndexingService.get_documents()
    return [DocumentItem(**d) for d in docs]

@router.post("/documents/upload", response_model=UploadResponse)
async def upload_documents(
    files: List[UploadFile] = File(...),
    auto_index: bool = Form(True)
):
    """
    Upload one or multiple PDF drug labels and optionally index them immediately.
    """
    results: List[UploadResultItem] = []
    overall_success = True

    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            results.append(UploadResultItem(
                filename=file.filename,
                pages=0,
                chunks=0,
                file_size=0,
                status="error",
                message="Only PDF files are supported"
            ))
            overall_success = False
            continue

        try:
            content = await file.read()
            file_size = len(content)

            if auto_index:
                # Save and index into ChromaDB
                doc_record = IndexingService.save_and_index_file(content, file.filename)
                results.append(UploadResultItem(
                    filename=file.filename,
                    pages=doc_record["pages"],
                    chunks=doc_record["chunks"],
                    file_size=file_size,
                    status="indexed",
                    message="Document successfully processed and indexed"
                ))
            else:
                # Save without indexing
                save_path = IndexingService.UPLOADS_DIR / file.filename
                with open(save_path, "wb") as f:
                    f.write(content)
                results.append(UploadResultItem(
                    filename=file.filename,
                    pages=0,
                    chunks=0,
                    file_size=file_size,
                    status="uploaded",
                    message="File saved. Ready for indexing."
                ))
        except Exception as e:
            overall_success = False
            results.append(UploadResultItem(
                filename=file.filename,
                pages=0,
                chunks=0,
                file_size=0,
                status="error",
                message=str(e)
            ))

    return UploadResponse(results=results, success=overall_success)

@router.post("/documents/index", response_model=IndexResponse)
def index_document(req: IndexRequest):
    """Index an existing uploaded document by filename or document_id."""
    target_filename = req.filename
    if not target_filename and req.document_id:
        doc = IndexingService.get_document_by_id(req.document_id)
        if doc:
            target_filename = doc["filename"]

    if not target_filename:
        raise HTTPException(status_code=400, detail="Must provide either filename or document_id")

    try:
        record = IndexingService.index_existing_file(target_filename)
        return IndexResponse(
            filename=record["filename"],
            pages=record["pages"],
            chunks=record["chunks"],
            status="indexed",
            message="Document successfully indexed into vector database"
        )
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{document_id}", response_model=ActionResponse)
def delete_document(document_id: str):
    """Remove a document and its embeddings from the knowledge base."""
    try:
        result = IndexingService.delete_document(document_id)
        return ActionResponse(
            success=result["success"],
            message=result["message"],
            deleted_chunks=result.get("deleted_chunks", 0)
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

@router.post("/knowledge-base/clear", response_model=ActionResponse)
def clear_knowledge_base():
    """Clear all vector embeddings and indexed documents from the system."""
    try:
        result = IndexingService.clear_all()
        return ActionResponse(
            success=result["success"],
            message=result["message"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear knowledge base: {str(e)}")
