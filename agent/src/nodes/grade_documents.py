import re
from typing import List
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage
from src.state import GraphState
from src.model import get_model

class DocumentRelevance(BaseModel):
  """Indices of documents that are relevant to the user query."""
  relevant_indices: List[int] = Field(
    description="List of 1-based indices of documents relevant to the question, e.g. [1, 3]."
  )

def grade_documents_node(state: GraphState):
  """
  Grades ALL retrieved document chunks in a SINGLE LLM call without brittle JSON parsing.
  """
  question = state["question"]
  documents = state.get("documents", [])

  if not documents:
    print("--- [NODE: GRADE DOCUMENTS] No documents to grade ---")
    return {"documents": []}
  
  print(f"--- [NODE: GRADE DOCUMENTS] Batch grading {len(documents)} chunks in 1 call ---")

  formatted_docs = "\n\n".join(
    f"[Document {i+1}]:\n{doc}" for i, doc in enumerate(documents)
  )

  prompt = f"""You are an expert document grader.
Review the following retrieved documents and identify which ones contain information relevant to the user's question.
Question:
{question}

Documents:
{formatted_docs}

Respond strictly in JSON matching this schema:
{{"relevant_indices": [1]}} (or list of indices, e.g. [1, 2], [] if none)"""
  
  model = get_model(temperature=0.0)
  grader = model.with_structured_output(DocumentRelevance, method="json_mode")

  try:
    result = grader.invoke(prompt)
    filtered_docs = [
      documents[idx - 1]
      for idx in result.relevant_indices
      if 1 <= idx <= len(documents)
    ]
  except Exception as e:
    print(f"Batch grading fallback due to error: {e}")
    filtered_docs = documents   

  print(f"--- [NODE: GRADE DOCUMENTS] Kept {len(filtered_docs)}/{len(documents)} relevant chunks ---")
  
  return {"documents": filtered_docs}
    