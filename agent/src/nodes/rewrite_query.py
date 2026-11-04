from langchain_core.messages import SystemMessage, HumanMessage
from src.state import GraphState
from src.model import get_model

def rewrite_query_node(state: GraphState):
  """
  Rewrites the search query to improve retrieval from Chroma.
  """
  question = state["question"]
  loop_step = state.get("loop_step", 0) + 1

  print(f"--- [NODE: REWRITE QUERY] Attempt #{loop_step} for: '{question}' ---")

  model = get_model(temperature=0.0)

  system = SystemMessage(
    content="You are a query optimizer. Look at the input question and formulate an improved, clearer search query for vector retrieval. Provide ONLY the rewritten query, nothing else."
  )

  human = HumanMessage(content=question)

  better_question = model.invoke([system, human]).content.strip()
  
  print(f"--- [NODE: REWRITE QUERY] New query: '{better_question}' ---")

  return {
      "question": better_question,
      "loop_step": loop_step,
  }