import os
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import Optional

from src.db import (
    list_threads as db_list_threads,
    upsert_thread as db_upsert_thread,
    delete_thread as db_delete_thread,
    get_messages as db_get_messages,
    add_message as db_add_message,
)

from src.rag import index_file, list_documents, delete_document



app = FastAPI(
  title="DocAgent Knowledge Bucket API",
  description="FastAPI server service for document ingestions and ChromaDB"
)


app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


class ThreadCreate(BaseModel):
  id: str
  title: Optional[str] = "New Conversation"

class MessageCreate(BaseModel):
  role: str
  content: str


UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/health")
async def health():
  return {"status": "ok", "service": "bucket-api"}


@app.get("/api/bucket")
async def get_bucket_documents():
  """List all documents currently stored in the Chroma vector store."""
  try:
    docs = list_documents()
    return {"documents": docs}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e)) 


@app.post("/api/bucket/upload")
async def upload_documents(files: list[UploadFile] = File(...)):
  """Upload documents, extract text, chunk, and embed into ChromaDB."""
  if not files:
    raise HTTPException(status_code=400, detail="No files provided")

  indexed = []
  for file in files:
    temp_path = UPLOADS_DIR / file.filename
    try:
      with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

      result = index_file(temp_path, file.filename)
      indexed.append(result)
    finally:
      if temp_path.exists():
        temp_path.unlink(missing_ok=True)
  return {"success": True, "indexed": indexed}


@app.delete("/api/bucket/{filename}")
async def remove_document(filename: str):
  """Delete all vector chunks belonging to a document from Chroma."""
  try:
    success = delete_document(filename)
    return {"success": success, "filename": filename}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/threads")
async def get_threads():
  return {"threads": db_list_threads()}

@app.post("/api/threads")
async def create_thread(payload: ThreadCreate):
  return db_upsert_thread(payload.id, payload.title)

@app.delete("/api/threads/{thread_id}")
async def remove_thread(thread_id: str):
  return {"success": db_delete_thread(thread_id), "id": thread_id}

@app.get("/api/threads/{thread_id}/messages")
async def get_messages(thread_id: str):
  return {"messages": db_get_messages(thread_id)}

@app.post("/api/threads/{thread_id}/messages")
async def append_message(thread_id: str, payload: MessageCreate):
  return db_add_message(thread_id, payload.role, payload.content)

      
if __name__ == "__main__":
  port = int(os.getenv("BUCKET_API_PORT", "8000"))
  uvicorn.run("bucket_api:app", host="0.0.0.0", port=port, reload=True)