# agent/src/nodes/direct_chat.py
from typing import Optional
from langchain_core.messages import AIMessage, SystemMessage
from src.state import GraphState
from src.model import get_model
from src.db import add_message, get_setting
from langchain_core.runnables import RunnableConfig

SYSTEM_PROMPT = SystemMessage(
  content="You are a knowledgeable and helpful documentation assistant. Respond warmly to greetings and gratitude. When users ask questions, opinions, or evaluations about previously discussed documents or topics, use the conversation history to give thoughtful, well-reasoned answers."
)

def direct_chat_node(state: GraphState, config: Optional[RunnableConfig] = None):
  """
  Directly responds to greetings, thanks, or general conversation without retrieval.
  """
  allow_chat = state.get("allow_general_chat")
  if allow_chat is None:
    allow_chat = get_setting("allow_general_chat", default=True)

  if not allow_chat:
    no_chat_msg = "Strict Document Mode is enabled. I only answer questions using the documents uploaded to your Knowledge Bucket."
    if config:
      thread_id = config.get("configurable", {}).get("thread_id")
      if thread_id:
        messages = state.get("messages", [])
        user_msg = messages[-1].content if messages else "Hello"
        add_message(thread_id, "user", str(user_msg))
        add_message(thread_id, "assistant", no_chat_msg)
    return {
      "generation": no_chat_msg,
      "messages": [AIMessage(content=no_chat_msg)],
      "loop_step": 0,
      "documents": [],
    }

  print("--- [NODE: DIRECT CHAT] Responding directly without vector retrieval ---")
  
  model = get_model(temperature=0.7)
  
  messages = state.get("messages", [])
  response = model.invoke([SYSTEM_PROMPT] + list(messages))

  if config:
    thread_id = config.get("configurable", {}).get("thread_id")
    if thread_id:
      user_msg = messages[-1].content if messages else "Hello"
      add_message(thread_id, "user", str(user_msg))
      add_message(thread_id, "assistant", response.content)

  return {
      "generation": response.content,
      "messages": [AIMessage(content=response.content)],
      "loop_step": 0,
      "documents": [],
  }