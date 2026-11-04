from typing import List
from copilotkit.langgraph import CopilotKitState

class GraphState(CopilotKitState):
  """
    Represents the state of our Corrective RAG graph.
    Inherits from CopilotKitState (which includes 'messages' for CopilotChat).
  """
  question: str
  documents: List[str]
  generation: str
  loop_step: int