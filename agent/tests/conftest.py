import pytest
from langchain_core.messages import HumanMessage, AIMessage
from src.state import GraphState


@pytest.fixture
def base_state() -> GraphState:
    """A clean starting state with a user message."""
    return {
        "messages": [HumanMessage(content="What are the key technical skills?")],
        "question": "What are the key technical skills?",
        "documents": [],
        "generation": "",
        "loop_step": 0,
    }


@pytest.fixture
def state_with_docs(base_state) -> GraphState:
    """State containing retrieved document chunks."""
    return {
        **base_state,
        "documents": [
            "[Source: cv.pdf (chunk 0)]:\nPython, TypeScript, and Machine Learning expertise.",
            "[Source: cv.pdf (chunk 1)]:\nExperience building data pipelines with Redis and Docker.",
        ],
    }