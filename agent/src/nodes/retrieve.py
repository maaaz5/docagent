from langchain_core.messages import HumanMessage
from src.state import GraphState
from src.rag import vector_store

def retrieve_node(state: GraphState):
  """
  Retrieves top chunks from Chroma vector store based on the question.
  """
  loop_step = state.get("loop_step", 0)
  messages = state.get("messages", [])

  if loop_step > 0 and state.get("question"):
    question = state["question"]
  else:
    question = ""
    for msg in reversed(messages):
      if isinstance(msg, HumanMessage) or getattr(msg, "type", "") == "human":
        question = msg.content
        break
  
  question = question or ""
  print(f"--- [NODE: RETRIEVE] Query: '{question}' ---")

  results = vector_store.similarity_search(question, k=4)
  
  documents = [
    f"[Source: {doc.metadata.get('filename', 'doc')} (chunk {doc.metadata.get('chunk_index', 0)})]:\n{doc.page_content}"
    for doc in results
  ]

  return {
    "question": question,
    "documents": documents,
    "loop_step": loop_step,
  }