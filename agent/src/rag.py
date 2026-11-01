from langchain_text_splitters import RecursiveCharacterTextSplitter
import os
from pathlib import Path
from langchain.tools import tool
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document
from pypdf import PdfReader
import sys
import json


CHROMA_PATH = Path(__file__).parent.parent / "chroma_db"
UPLOADS_DIR = Path(__file__).parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

embeddings = OllamaEmbeddings(
  model="qwen3-embedding:0.6b",
  base_url=os.getenv("OPENAI_BASE_URL", "http://localhost:11434").replace("/v1", ""),
)

vector_store = Chroma(
  collection_name="docs",
  embedding_function=embeddings,
  persist_directory=str(CHROMA_PATH)
)


text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)


def extract_text_from_file(file_path: Path) -> str:
  """Extracts raw text from PDF, Markdown, TXT, CSV, or code files."""
  if file_path.suffix.lower() == ".pdf":
    reader = PdfReader(str(file_path))
    return "\n\n".join([page.extract_text() or "" for page in reader.pages]).strip() 

  with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    return f.read().strip()

def index_file(file_path: Path, filename: str) -> dict:
  """Reads, chunks, and stores a file in Chroma."""
  file_size = file_path.stat().st_size
  raw_text = extract_text_from_file(file_path)
  if not raw_text:
    return {"filename": filename, "chunks": 0, "size": file_size}
  # Delete previous chunks of the same file to prevent duplicates
  try:
    data = vector_store.get(where={"filename": filename})
    if data.get("ids"):
      vector_store.delete(ids=data["ids"])
  except Exception:
    pass
  # Split into chunks and add metadata
  chunks = text_splitter.split_text(raw_text)
  docs = [
      Document(
          page_content=chunk,
          metadata={"filename": filename, "chunk_index": i, "file_size": file_size},
      )
      for i, chunk in enumerate(chunks)
  ]
  vector_store.add_documents(docs)
  return {"filename": filename, "chunks": len(chunks), "size": file_size, "status": "indexed"}


def list_documents() -> list[dict]:
  """Lists unique documents currently stored in Chroma."""
  data = vector_store.get()
  metadatas = data.get("metadatas", []) or []
  summary: dict[str, dict] = {}
  for meta in metadatas:
    if not meta or "filename" not in meta:
      continue
    fname = meta["filename"]
    if fname not in summary:
      summary[fname] = {"filename": fname, "chunks": 0, "size": meta.get("file_size", 0)}
    summary[fname]["chunks"] += 1
  return list(summary.values())

def delete_document(filename: str) -> bool:
  """Removes a document from Chroma."""
  data = vector_store.get(where={"filename": filename})
  if data.get("ids"):
    vector_store.delete(ids=data["ids"])
  return True


# 5. LangGraph Tools
@tool
def retrieve_documents(query: str) -> str:
  """Search the document bucket and retrieve relevant passages for the user's query."""
  results = vector_store.similarity_search(query, k=4)
  if not results:
      return "No relevant documents found in the bucket."
  formatted = [
      f"[Source: {doc.metadata.get('filename')} (chunk {doc.metadata.get('chunk_index', i+1)})]:\n{doc.page_content}"
      for i, doc in enumerate(results)
  ]
  return "\n\n---\n\n".join(formatted)



@tool
def list_bucket_documents() -> str:
  """List all the documents currently stored in the knowledge bucket."""
  docs = list_documents()
  if not docs:
      return "The knowledge bucket is empty."
  return "Documents in bucket:\n" + "\n".join(f"- {d['filename']} ({d['chunks']} chunks)" for d in docs)



# 6. CLI Interface for Next.js API
if __name__ == "__main__":
  action = sys.argv[1] if len(sys.argv) > 1 else ""
  if action == "list":
      print(json.dumps(list_documents()))
  elif action == "index" and len(sys.argv) >= 4:
      print(json.dumps(index_file(Path(sys.argv[2]), sys.argv[3])))
  elif action == "delete" and len(sys.argv) >= 3:
      print(json.dumps({"success": delete_document(sys.argv[2])}))