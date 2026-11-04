from langchain_core.messages import HumanMessage, AIMessage
from src.state import GraphState
from src.model import get_model


def generate_node(state: GraphState):
  """
  Generates answer using the filtered relevant documents.
  """
  question = state.get("question", "")
  documents = state.get("documents", [])
  
  print(f"--- [NODE: GENERATE] Synthesizing answer with {len(documents)} chunks ---")

  model = get_model(temperature=0.3)

  context = "\n\n---\n\n".join(documents) if documents else "No relevant documents found."

  prompt = f"""You are an intelligent documentation and career assistant.
Use the following retrieved context to answer the user's question directly, insightfully, and thoroughly.

Guidelines:
1. If the user is asking for an evaluation, assessment, or opinion (e.g. "is he good enough for AI jobs?", "is this candidate qualified?"):
   - Give a direct, confident conclusion upfront (e.g. "Yes, he is well-qualified for AI engineering positions.").
   - Explain your reasoning by analyzing relevant projects (e.g. PyTorch transformers from scratch, dual-horizon ML systems), production experience (Athing.online data pipelines, RAG), and technical stack.
   - Do NOT just copy/paste raw bullet points or output disclaimer sentences like "Based on the provided documents".
2. If the user asks a factual inquiry, answer clearly and cite sources inline like [Source: filename (chunk X)].

Context:
{context}

Question:
{question}
"""

  response = model.invoke([HumanMessage(content=prompt)])

  return {
      "generation": response.content,
      "messages": [AIMessage(content=response.content)],
      "loop_step": 0,
      "documents": [],
  }