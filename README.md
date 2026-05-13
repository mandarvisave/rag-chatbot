# AI Document Search 
Live Now - https://rag-chatbot-indol.vercel.app/

AI Document Search is a full-stack Retrieval-Augmented Generation (RAG) chatbot that lets users upload PDF documents and ask natural-language questions about their contents. It extracts document text, chunks it, embeds it, stores it in a vector database, retrieves the most relevant passages, and uses an LLM to generate grounded answers with source snippets.

![AI Document Search](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=111827)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C?style=for-the-badge)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000?style=for-the-badge)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM_API-7C3AED?style=for-the-badge)

## Features

- Upload PDF files through a clean drag-and-drop interface
- Extract text using PyMuPDF
- Split documents into overlapping chunks with LangChain
- Generate semantic embeddings using OpenRouter-compatible OpenAI embeddings
- Store and retrieve document chunks using Pinecone or local FAISS
- Ask questions and receive grounded LLM answers
- View expandable source snippets under each assistant response
- Persist vector data locally with FAISS or use Pinecone for production deployment
- React + Vite frontend with Tailwind CSS
- FastAPI backend containerized with Docker

## Tech Stack

**Frontend**

- React 18
- Vite
- Tailwind CSS
- Axios
- Lucide React

**Backend**

- FastAPI
- Python 3.11
- LangChain
- PyMuPDF
- OpenRouter API
- Pinecone
- FAISS
- Docker

**AI**

- LLM: `openai/gpt-4o-mini` via OpenRouter
- Embeddings: `openai/text-embedding-3-small`
- Retrieval: top-k semantic search over document chunks

## Architecture

```text
User uploads PDF
        |
        v
FastAPI backend
        |
        v
PyMuPDF text extraction
        |
        v
RecursiveCharacterTextSplitter
        |
        v
OpenRouter embeddings
        |
        v
Pinecone / FAISS vector store
        |
        v
Question embedding + similarity search
        |
        v
Context-aware LLM response
        |
        v
Answer with sources in React UI
```

## Project Structure

```text
rag-chatbot/
  backend/
    app/
      main.py
      config.py
      routers/
        upload.py
        chat.py
      services/
        pdf_service.py
        vector_service.py
        llm_service.py
      models/
        schemas.py
    requirements.txt
    Dockerfile
    .env.example

  frontend/
    src/
      App.jsx
      api/client.js
      hooks/useChat.js
      components/
        PDFUploader.jsx
        ChatWindow.jsx
        MessageBubble.jsx
    package.json
    vite.config.js
    tailwind.config.js
    vercel.json
```

## Environment Variables

Create a `.env` file inside `backend/`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini
EMBEDDING_MODEL=openai/text-embedding-3-small

VECTOR_STORE=pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=rag-docs

CHUNK_SIZE=800
CHUNK_OVERLAP=100
TOP_K=5
```

For local-only development, you can use FAISS:

```env
VECTOR_STORE=faiss
```

FAISS data is persisted locally as:

```text
backend/faiss_store.pkl
```

## Local Setup

### 1. Clone The Repository

```bash
git clone https://github.com/mandarvisave/rag-chatbot.git
cd rag-chatbot
```

### 2. Start The Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

On Windows:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend runs at:

```text
http://localhost:8000
```

API docs:

```text
http://localhost:8000/docs
```

### 3. Start The Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## API Endpoints

### Upload PDF

```http
POST /api/upload-pdf
```

Accepts a PDF file and returns the number of indexed chunks.

Example response:

```json
{
  "filename": "report.pdf",
  "chunks_stored": 18
}
```

### Chat

```http
POST /api/chat
```

Example request:

```json
{
  "question": "What are the key findings in this document?"
}
```

Example response:

```json
{
  "answer": "The document highlights...",
  "sources": [
    {
      "content": "The first 120 characters of the retrieved chunk...",
      "filename": "report.pdf",
      "page": 2,
      "score": 0.12
    }
  ]
}
```

## Deployment

### Backend

Deploy the `backend/` folder as a Docker web service on Render, Railway, Fly.io, or any Docker-compatible host.

Make sure to add all backend environment variables in your hosting dashboard.

Health check:

```text
https://your-backend-url.com/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### Frontend

Deploy the `frontend/` folder to Vercel.

Vercel settings:

```text
Root Directory: frontend
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Add this Vercel environment variable:

```env
VITE_API_URL=https://your-backend-url.com/api
```

## Pinecone Setup

Create a Pinecone index with:

```text
Index name: rag-docs
Dimension: 1536
Metric: cosine
Vector type: dense
```

The dimension must be `1536` because `text-embedding-3-small` returns 1536-dimensional embeddings.

## Common Issues

### `ModuleNotFoundError: No module named 'langchain_core'`

Your backend dependencies are not installed in the Python environment running Uvicorn.

Fix:

```bash
pip install -r requirements.txt
```

### `OpenRouter rejected OPENROUTER_API_KEY`

Create a fresh OpenRouter key, update `backend/.env`, and restart the backend.

### `Pinecone rejected PINECONE_API_KEY`

Make sure the Pinecone API key belongs to the same Pinecone project where your index exists.

### Vercel `vite: Permission denied`

Do not commit `node_modules` or `dist`. Remove them from Git:

```bash
git rm -r --cached frontend/node_modules --ignore-unmatch
git rm -r --cached frontend/dist --ignore-unmatch
git commit -m "Remove local build artifacts"
git push
```

## Future Improvements

- Multi-file document collections
- User authentication
- Conversation memory
- Document deletion and re-indexing
- Streaming LLM responses
- Citation highlighting inside PDFs
- Cloud file storage for uploaded documents

## Author

Built by **Mandar Visave**.

If you like this project, consider giving it a star on GitHub.
