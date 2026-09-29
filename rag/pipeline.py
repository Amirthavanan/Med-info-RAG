from .config import CHUNK_SIZE, CHUNK_OVERLAP, TOP_K
from .pdf_loader import extract_pages
from .chunker import chunk_pages
from .vector_store import index_chunks, search
from .prompts import SYSTEM_PROMPT
from .gemini_client import generate_text

def index_pdf(uploaded_file, source_name):
    pages = extract_pages(uploaded_file)
    chunks = chunk_pages(pages, CHUNK_SIZE, CHUNK_OVERLAP)
    count = index_chunks(chunks, source_name)
    return {"pages": len(pages), "chunks": count}

def answer_question(question):
    results = search(question, TOP_K)
    documents = results.get("documents", [[]])[0]
    metadata = results.get("metadatas", [[]])[0]

    context_parts = []
    for doc, meta in zip(documents, metadata):
        context_parts.append(
            f"[Source: {meta.get('source', 'unknown')}, page {meta.get('page', '?')}]\n{doc}"
        )

    context = "\n\n".join(context_parts)
    if not context:
        return {
            "answer": "No drug-label documents have been indexed yet.",
            "sources": []
        }

    prompt = SYSTEM_PROMPT.format(context=context, question=question)
    answer = generate_text(prompt)

    sources = [
        {"source": m.get("source", "unknown"), "page": m.get("page", "?"), "text": d}
        for d, m in zip(documents, metadata)
    ]
    return {"answer": answer, "sources": sources}
