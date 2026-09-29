from rag.chunker import chunk_pages

def test_chunk_pages_preserves_page_metadata():
    pages = [{"page": 3, "text": "word " * 300}]
    chunks = chunk_pages(pages, chunk_size=100, overlap=20)
    assert chunks
    assert all(c["page"] == 3 for c in chunks)
    assert all(c["text"] for c in chunks)
