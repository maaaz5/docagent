from pathlib import Path
from src.rag import extract_text_from_file, text_splitter, index_file

def test_extract_text_from_file(tmp_path: Path):
  """Verifies that plain text and markdown files are read accurately."""
  sample_file = tmp_path / "sample.txt"
  sample_file.write_text("MohamedAmine is an AI Engineer specializing in LangGraph.", encoding="utf-8")

  extracted = extract_text_from_file(sample_file)
  assert "MohamedAmine" in extracted
  assert "LangGraph" in extracted

def test_extract_text_from_empty_file(tmp_path: Path):
  """Verifies that 0-byte empty files return an empty string without crashing."""
  empty_file = tmp_path / "empty.txt"
  empty_file.write_text("", encoding="utf-8")
  assert extract_text_from_file(empty_file) == ""

def test_text_splitter_chunks_large_documents():
  """Verifies that text larger than chunk_size (1000) gets split into multiple chunks."""
  long_text = "Building reliable agent workflows with LangGraph, ChromaDB, and Next.js. " * 50
  chunks = text_splitter.split_text(long_text)

  assert len(chunks) > 1

  for chunk in chunks:
    assert len(chunk) <= 1200

def test_index_file_empty_returns_zero_chunks(tmp_path: Path):
  """If a user uploads an empty file, it shouldn't create phantom chunks in vector store."""
  empty_file = tmp_path / "empty_doc.txt"
  empty_file.write_text("", encoding="utf-8")
  result = index_file(empty_file, "empty_doc.txt")
  
  assert result["chunks"] == 0
  assert result["filename"] == "empty_doc.txt"