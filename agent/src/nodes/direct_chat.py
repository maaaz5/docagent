# agent/src/nodes/direct_chat.py
from langchain_core.messages import AIMessage, SystemMessage
from src.state import GraphState
from src.model import get_model

SYSTEM_PROMPT = SystemMessage(
  content="You are a knowledgeable and helpful documentation assistant. Respond warmly to greetings and gratitude. When users ask questions, opinions, or evaluations about previously discussed documents or topics, use the conversation history to give thoughtful, well-reasoned answers."
)

def direct_chat_node(state: GraphState):
  """
  Directly responds to greetings, thanks, or general conversation without retrieval.
  """
  print("--- [NODE: DIRECT CHAT] Responding directly without vector retrieval ---")
  
  model = get_model(temperature=0.7)
  
  messages = state.get("messages", [])
  response = model.invoke([SYSTEM_PROMPT] + list(messages))

  return {
      "generation": response.content,
      "messages": [AIMessage(content=response.content)],
      "loop_step": 0,
      "documents": [],
  }