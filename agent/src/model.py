"""Centralized model factory for Ollama (Local & Cloud)."""

import os
from langchain_ollama import ChatOllama
from langchain_core.language_models.chat_models import BaseChatModel


def get_model(temperature: float = 0.0, **kwargs) -> BaseChatModel:
    """Builds and returns an Ollama ChatModel instance.
    
    Reads from environment variables:
    - Model: COPILOTKIT_AGENT_MODEL or OLLAMA_MODEL (default: 'qwen3:1.7b')
    - Host:  OLLAMA_BASE_URL or OLLAMA_HOST (default: 'http://localhost:11434')
    - Auth:  OLLAMA_API_KEY (optional, used when Ollama Cloud is behind an auth proxy)
    """
    # 1. Resolve model name (handles both 'ollama:qwen3:1.7b' and 'qwen3:1.7b')
    raw_model = (
        os.getenv("COPILOTKIT_AGENT_MODEL")
        or os.getenv("OLLAMA_MODEL")
        or "qwen3:1.7b"
    ).strip()
    model_name = raw_model.split(":", 1)[1] if raw_model.startswith("ollama:") else raw_model

    # 2. Resolve base URL (Local default vs Cloud endpoint)
    base_url = (
        os.getenv("OLLAMA_BASE_URL")
        or os.getenv("OLLAMA_HOST")
        or os.getenv("OPENAI_BASE_URL", "http://localhost:11434").replace("/v1", "")
    ).rstrip("/")

    # 3. Optional auth header for Cloud Ollama instances
    api_key = os.getenv("OLLAMA_API_KEY")
    client_kwargs = {}
    if api_key:
        client_kwargs["headers"] = {"Authorization": f"Bearer {api_key}"}

    return ChatOllama(
        model=model_name,
        base_url=base_url,
        temperature=temperature,
        client_kwargs=client_kwargs or None,
        **kwargs,
    )


def create_chat_model(default_spec: str = "qwen3:1.7b", **kwargs) -> BaseChatModel:
    """Backward-compatible wrapper for existing starter code."""
    return get_model(**kwargs)