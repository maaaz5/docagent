import pytest
from unittest.mock import patch, MagicMock
from langchain_core.messages import HumanMessage, AIMessage
from src.edges import decide_to_generate, route_question, RouteQuery

# Unit Tests

def test_decide_to_generate_with_documents(state_with_docs):
  """When documents exist, the graph should route directly to 'generate'."""
  destination = decide_to_generate(state_with_docs)
  assert destination == "generate"


def test_decide_to_generate_rewrites_when_empty(base_state):
  """When documents are empty and attempts < 2, route to 'rewrite_query'."""
  base_state['documents'] = []
  base_state['loop_step'] = 0
  destination = decide_to_generate(base_state)
  assert destination == "rewrite_query"


def test_decide_to_generate_stops_after_max_retries(base_state):
  """When loop_step hits max retries (2), proceed to 'generate' anyway."""
  base_state["documents"] = []
  base_state["loop_step"] = 2
  destination = decide_to_generate(base_state)
  assert destination == "generate"


@patch("src.edges.get_model")
def test_route_question_mocked(mock_get_model):
  """Unit test: verifies that route_question decodes structured output properly."""
  mock_router = MagicMock()

  mock_router.invoke.return_value = RouteQuery(datasource="vectorstore")
  
  mock_get_model.return_value.with_structured_output.return_value = mock_router

  state = {"messages": [HumanMessage(content="Explain architecture")]}
  assert route_question(state) == "vectorstore"


# Integration tests

@pytest.mark.integration
def test_real_llm_routes_document_inquiry_to_vectorstore():
  """Verify your REAL model routes factual file inquiries to vectorstore."""
  state = {
    "messages": [HumanMessage(content="What projects are listed in the uploaded PDF resume?")],
  }
  decision = route_question(state)
  assert decision == "vectorstore"

@pytest.mark.integration
def test_real_llm_routes_conversational_followup_to_chat():
  """Verify your REAL model routes follow-up evaluation questions to general_chat."""
  state = {
    "messages": [
      HumanMessage(content="Tell me about MohamedAmine"),
      AIMessage(content="MohamedAmine is an AI engineer specializing in NLP and RAG."),
      HumanMessage(content="Is he skilled enough for AI engineer roles?"),
    ],
  }
  decision = route_question(state)
  assert decision == "general_chat"