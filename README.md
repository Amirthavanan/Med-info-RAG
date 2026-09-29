# 💊 MedInfo RAG — Drug Information Assistant

A modern, production-grade clinical drug information RAG application powered by **FastAPI**, **React + Vite**, **Google Gemini**, and **ChromaDB**.

---

## 🏛️ System Architecture

```text
React + Vite (Modern UI with Tailwind CSS & Lucide Icons)
      ↓ REST API
FastAPI (REST Endpoints & Validation)
      ↓
Existing Python RAG Pipeline (`rag/`)
      ↓
Gemini Embeddings (gemini-embedding-001) → ChromaDB (Vector Similarity) → Gemini LLM (Grounded Clinical Synthesis)
```

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI)

1. Activate your Python virtual environment:
   ```powershell
   # Windows
   .\.venv\Scripts\activate

   # macOS / Linux
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure `.env` is configured with your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash
   EMBEDDING_MODEL=gemini-embedding-001
   CHROMA_PATH=data/chroma
   COLLECTION_NAME=drug_labels
   ```

4. Start the FastAPI backend server:
   ```bash
   uvicorn backend.main:app --reload
   ```
   * Backend Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   * API Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 2. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * Open the Web App: [http://localhost:5173](http://localhost:5173)

---

## 💻 Available Pages & Features

1. **Dashboard**:
   - Monograph counts, vector chunk metrics, ChromaDB health, and backend connection telemetry.
   - Active neural models display (`gemini-3.5-flash` + `gemini-embedding-001`).
   - Grounded RAG architecture flow visualization.

2. **Upload & Index**:
   - Drag-and-drop multiple PDF prescribing information uploads.
   - Real-time indexing progress indicator and page/chunk extraction statistics.

3. **Drug Information Chat**:
   - ChatGPT-style interface with Markdown rendering.
   - Zero-extrapolation, document-grounded answers.
   - Source citations with document name, page numbers, and expandable retrieved passages.
   - One-click copy answer and reset conversation.

4. **Indexed Documents**:
   - Complete monograph catalog with search, page counts, chunk metrics, and timestamp.
   - Document deletion action removing chunks from ChromaDB and registry.

5. **Settings & System Information**:
   - Live backend ping diagnostic tool with latency counter.
   - Pipeline hyperparameters (chunk size, overlap, top-k).
   - Knowledge base purge action (with confirmation dialog).

---

## 🧪 Testing

Run automated tests:
```bash
pytest
```
