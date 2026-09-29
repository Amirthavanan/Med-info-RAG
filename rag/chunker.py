def chunk_pages(pages, chunk_size=1000, overlap=150):
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []
    step = chunk_size - overlap

    for page in pages:
        text = " ".join(page["text"].split())
        for start in range(0, len(text), step):
            chunk = text[start:start + chunk_size].strip()
            if not chunk:
                continue
            chunks.append({
                "text": chunk,
                "page": page["page"],
            })
            if start + chunk_size >= len(text):
                break
    return chunks
