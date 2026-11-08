from typing import Literal
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage
from src.state import GraphState
from src.model import get_model
from src.db import get_setting


class RouteQuery(BaseModel):
  """Route a user query to the most relevant path."""
  datasource: Literal["vectorstore", "general_chat"] = Field(
    description=(
      "Choose 'vectorstore' ONLY if the user is asking to search or look up NEW factual information, files, or data from the documents.\n"
      "Choose 'general_chat' for greetings, gratitude, chit-chat, OR when the user is asking for an opinion, evaluation, reasoning, or follow-up question based on what was ALREADY discussed in the conversation."
    )
  )

def route_question(state: GraphState) -> str:
  """
  Determines whether to route the question to Chroma retrieval or direct chat using the LLM.
  If allow_general_chat is False (Strict Document Mode), strictly forces 'vectorstore'.
  """
  allow_chat = state.get("allow_general_chat")
  if allow_chat is None:
    allow_chat = get_setting("allow_general_chat", default=True)

  if not allow_chat:
    print("--- [ROUTER] General chat is DISABLED (Strict Mode) -> Forcing 'vectorstore' ---")
    return "vectorstore"

  messages = state.get("messages", [])

  # 1. ALWAYS extract the latest user message from chat history
  question = ""
  for msg in reversed(messages):
    if isinstance(msg, HumanMessage) or getattr(msg, "type", "") == "human":
      question = msg.content
      break

  question = question or ""

  # 2. Extract conversation history BEFORE the current question
  history_context = ""
  if len(messages) > 1:
    previous_msgs = messages[:-1][-4:]  # Last 4 messages prior to the current question
    history_lines = []
    for m in previous_msgs:
      role = "User" if (isinstance(m, HumanMessage) or getattr(m, "type", "") == "human") else "Assistant"
      snippet = str(m.content)[:300].replace("\n", " ")
      history_lines.append(f"{role}: {snippet}")

    if history_lines:
      history_context = "Conversation History:\n" + "\n".join(history_lines) + "\n\n"

  print(f"--- [ROUTER] Classifying intent with LLM for: '{question}' ---")

  model = get_model(temperature=0.0)
  router = model.with_structured_output(RouteQuery)

  prompt = f"""You are an expert router deciding whether to search documents or continue in direct conversation.

{history_context}Current User Question:
{question}

Instructions:
- Route to 'vectorstore' ONLY if the user is asking to lookup or retrieve specific NEW information/facts from uploaded files that are not already in the conversation history.
- Route to 'general_chat' if the user is asking a follow-up question, seeking an opinion/analysis/evaluation of what was ALREADY stated in the conversation history, or engaging in conversation."""

  try:
    decision = router.invoke(prompt)
    dest = decision.datasource
  except Exception as e:
    err_str = str(e).lower()
    if "general_chat" in err_str:
      dest = "general_chat"
    else:
      dest = "vectorstore"

  print(f"--- [ROUTER] Recovered routing to '{dest}' ---")

  return dest


def decide_to_generate(state: GraphState) -> str:
  """
  Determines whether to generate an answer, or rewrite the query.
  If filtered documents are empty and we haven't hit max retries, rewrite!
  """
  filtered_documents = state.get("documents", [])
  loop_step = state.get("loop_step", 0)

  if filtered_documents:
    print("--- [EDGE] Documents found -> Route to 'generate' ---")
    return "generate"

  if loop_step < 2:
    print(f"--- [EDGE] No relevant documents (step {loop_step}/2) -> Route to 'rewrite_query' ---")
    return "rewrite_query"

  print("--- [EDGE] Max retries reached -> Route to 'generate' ---")
  return "generate"