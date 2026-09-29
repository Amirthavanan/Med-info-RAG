import hashlib
import chromadb
from .config import CHROMA_PATH, COLLECTION_NAME
from .embeddings import embed_text, embed_texts

_client = chromadb.PersistentClient(path=CHROMA_PATH)

def get_collection():
    col = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    # Check if dimension matches current embedding model (e.g. switching from 768 to 384)
    if col.count() > 0:
        try:
            col.query(query_embeddings=[[0.0] * 384], n_results=1)
        except Exception as e:
            if "dimension" in str(e).lower() or "expected" in str(e).lower():
                print(f"Dimension mismatch detected in Chroma collection '{COLLECTION_NAME}'. Re-initializing for all-MiniLM-L6-v2...")
                _client.delete_collection(COLLECTION_NAME)
                col = _client.get_or_create_collection(
                    name=COLLECTION_NAME,
                    metadata={"hnsw:space": "cosine"}
                )
    return col

def clear_collection():
    try:
        _client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    return _client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

def index_chunks(chunks, source_name):
    collection = get_collection()
    ids, docs, metadatas = [], [], []

    for i, item in enumerate(chunks):
        text = item["text"]
        raw_id = f"{source_name}|{item['page']}|{i}|{text}"
        doc_id = hashlib.sha256(raw_id.encode("utf-8")).hexdigest()[:32]
        ids.append(doc_id)
        docs.append(text)
        metadatas.append({
            "source": source_name,
            "page": int(item["page"]),
        })

    if ids:
        embeddings = embed_texts(docs)
        collection.upsert(
            ids=ids,
            documents=docs,
            embeddings=embeddings,
            metadatas=metadatas,
        )
    return len(ids)

def search(query, top_k=5):
    collection = get_collection()
    if collection.count() == 0:
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
    q = embed_text(query)
    return collection.query(
        query_embeddings=[q],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"],
    )
