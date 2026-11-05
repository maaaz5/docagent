import pytest
from unittest.mock import patch, MagicMock
from langchain_core.messages import AIMessage
from langchain_core.documents import Document
from src.nodes.retrieve import retrieve_node
from src.nodes.grade_documents import grade_documents_node, DocumentRelevance
from src.nodes.rewrite_query import rewrite_query_node
from src.nodes.generate import generate_node
from src.nodes.direct_chat import direct_chat_node


@patch("src.nodes.retrieve.vector_store.similarity_search")
def test_retrieve_node_formats_chunks(mock_similarity_search, base_state):
  """Retrieve node should search Chroma and format chunks with metadata."""
  mock_similarity_search.return_value = [
    Document(page_content="LangGraph is great", metadata={"filename": "doc.pdf", "chunk_index": 0}),
  ]
  
  result = retrieve_node(base_state)

  assert len(result["documents"]) == 1
  assert "[Source: doc.pdf (chunk 0)]" in result["documents"][0]
  assert "LangGraph is great" in result["documents"][0]


@patch("src.nodes.grade_documents.get_model")
def test_grade_documents_filters_unwanted_chunks(mock_get_model, state_with_docs):
  """Grader should keep only the indices identified as relevant."""
  mock_grader = MagicMock()

  mock_grader.invoke.return_value = DocumentRelevance(relevant_indices=[1])

  mock_get_model.return_value.with_structured_output.return_value = mock_grader

  result = grade_documents_node(state_with_docs)

  assert len(result["documents"]) == 1
  assert "Python, TypeScript" in result["documents"][0]


@patch("src.nodes.grade_documents.get_model")
def test_grade_documents_fallback_on_error(mock_get_model, state_with_docs):
  """If structured output fails, grader should safely keep all documents as fallback."""
  mock_grader = MagicMock()

  mock_grader.invoke.side_effect = Exception("Ollama JSON parse error")

  mock_get_model.return_value.with_structured_output.return_value = mock_grader

  result = grade_documents_node(state_with_docs)

  assert len(result["documents"]) == 2


@patch("src.nodes.rewrite_query.get_model")
def test_rewrite_query_increments_step(mock_get_model, base_state):
  """Rewrite query must increment loop_step by 1 and return refined question."""
  mock_resp = MagicMock()

  mock_resp.content = "optimized semantic search query"

  mock_get_model.return_value.invoke.return_value = mock_resp

  base_state["question"] = "bad query"
  base_state["loop_step"] = 0

  result = rewrite_query_node(base_state)

  assert result["question"] == "optimized semantic search query"
  assert result["loop_step"] == 1


@patch("src.nodes.generate.get_model")
def test_generate_node_resets_loop_step_and_docs(mock_get_model, state_with_docs):
  """Generate node must synthesize answer and reset loop_step and documents for the next turn."""
  mock_resp = MagicMock()
  mock_resp.content = "MohamedAmine is skilled in Python and LangGraph."

  mock_get_model.return_value.invoke.return_value = mock_resp
  state_with_docs["loop_step"] = 1
  result = generate_node(state_with_docs)

  assert result["generation"] == "MohamedAmine is skilled in Python and LangGraph."
  assert len(result["messages"]) == 1
  assert isinstance(result["messages"][0], AIMessage)
  assert result["loop_step"] == 0
  assert result["documents"] == []


@patch("src.nodes.direct_chat.get_model")
def test_direct_chat_node_resets_state(mock_get_model, base_state):
  """Direct chat node must output conversational message and reset loop_step."""
  mock_resp = MagicMock()
  mock_resp.content = "Hello! How can I help you today?"

  mock_get_model.return_value.invoke.return_value = mock_resp
  result = direct_chat_node(base_state)

  assert result["generation"] == "Hello! How can I help you today?"
  assert len(result["messages"]) == 1
  assert isinstance(result["messages"][0], AIMessage)
  assert result["loop_step"] == 0


#Integration tests
@pytest.mark.integration
def test_real_llm_grade_documents():
  """Verify your REAL model keeps the relevant chunk and discards noise."""
  state = {
    "question": "What machine learning frameworks does he use?",
    "documents": [
      "[Chunk 1]: MohamedAmine built a transformer from scratch using PyTorch and trained XGBoost models.",
      "[Chunk 2]: The recipe requires 200g dark chocolate, 3 eggs, and 100g sugar.",  # Noise
    ],
  }
  result = grade_documents_node(state)
  assert len(result["documents"]) == 1
  assert "PyTorch" in result["documents"][0]