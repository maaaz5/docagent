from langchain_core.messages import HumanMessage, AIMessage
from src.state import GraphState
from src.model import get_model
from src.db import add_message, get_setting
from langchain_core.runnables import RunnableConfig

def generate_node(state: GraphState, config: RunnableConfig = None):
  """
  Generates answer using the filtered relevant documents.
  In strict mode (general chat disabled), strictly bounds answers to documents.
  """
  question = state.get("question", "")
  documents = state.get("documents", [])
  
  allow_chat = state.get("allow_general_chat")
  if allow_chat is None:
    allow_chat = get_setting("allow_general_chat", default=True)

  # If Strict Document Mode is active and no documents exist, return no-answer immediately
  if not allow_chat and not documents:
    print("--- [NODE: GENERATE] Strict Mode active & 0 documents found -> Returning no answer message ---")
    no_answer_msg = "I could not find any relevant information in the uploaded documents to answer your question."
    if config:
      thread_id = config.get("configurable", {}).get("thread_id")
      if thread_id:
        add_message(thread_id, "user", question)
        add_message(thread_id, "assistant", no_answer_msg)
    return {
      "generation": no_answer_msg,
      "messages": [AIMessage(content=no_answer_msg)],
      "loop_step": 0,
      "documents": [],
    }

  print(f"--- [NODE: GENERATE] Synthesizing answer with {len(documents)} chunks ---")

  model = get_model(temperature=0.3)

  context = "\n\n---\n\n".join(documents) if documents else "No relevant documents found."

  strict_instruction = (
    "CRITICAL CONSTRAINT (STRICT DOCUMENT MODE):\n"
    "You must answer EXCLUSIVELY using the facts in the Context above. Do NOT use outside general knowledge.\n"
    "If the Context does not provide sufficient facts to answer the question, state: "
    "'I could not find any relevant information in the uploaded documents to answer your question.'\n"
    if not allow_chat
    else ""
  )

  prompt = f"""You are an intelligent documentation and career assistant.
{strict_instruction}
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

  if config:
    thread_id = config.get("configurable", {}).get("thread_id")
    if thread_id:
      add_message(thread_id, "user", question)
      add_message(thread_id, "assistant", response.content)

  return {
      "generation": response.content,
      "messages": [AIMessage(content=response.content)],
      "loop_step": 0,
      "documents": documents,
  }