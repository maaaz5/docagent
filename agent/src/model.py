"""Centralized model and embeddings factory for Ollama (Local & Cloud)."""

import os
import logging
from dataclasses import dataclass
from typing import Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_core.language_models.chat_models import BaseChatModel

logger = logging.getLogger("docagent.ollama")

ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"


@dataclass
class ModelEndpointConfig:
    mode: str
    base_url: str
    model_name: str
    api_key: Optional[str] = None

    @property
    def headers(self) -> Optional[Dict[str, str]]:
        if self.mode == "cloud" and self.api_key:
            return {"Authorization": f"Bearer {self.api_key}"}
        return None

    @property
    def client_kwargs(self) -> Optional[Dict[str, Any]]:
        headers = self.headers
        if headers:
            return {"headers": headers}
        return None


def _reload_env():
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH, override=True)


def get_chat_config() -> ModelEndpointConfig:
    """Resolves chat LLM configuration (Cloud or Local)."""
    _reload_env()
    is_docker = os.path.exists("/.dockerenv") or os.getenv("IS_DOCKER", "").lower() in ("true", "1")

    # Mode resolution: OLLAMA_CHAT_MODE or OLLAMA_MODE, default to 'cloud'
    raw_mode = (
        os.getenv("OLLAMA_CHAT_MODE")
        or os.getenv("OLLAMA_MODE")
        or "cloud"
    ).strip().lower()
    mode = "cloud" if raw_mode in ("cloud", "remote") else "local"

    if mode == "cloud":
        base_url = (
            os.getenv("OLLAMA_CLOUD_URL")
            or os.getenv("OLLAMA_BASE_URL")
            or "https://ollama.com"
        ).rstrip("/")
        api_key = os.getenv("OLLAMA_CLOUD_API_KEY") or os.getenv("OLLAMA_API_KEY")
        raw_model = (
            os.getenv("OLLAMA_CLOUD_MODEL")
            or os.getenv("COPILOTKIT_AGENT_MODEL")
            or os.getenv("OLLAMA_MODEL")
            or "gemma4:31b"
        ).strip()
        model_name = raw_model.split(":", 1)[1] if raw_model.startswith("ollama:") else raw_model

        return ModelEndpointConfig(
            mode=mode,
            base_url=base_url,
            model_name=model_name,
            api_key=api_key,
        )

    # Local mode for chat
    default_local_url = "http://host.docker.internal:11434" if is_docker else "http://localhost:11434"
    base_url = (
        os.getenv("OLLAMA_LOCAL_URL")
        or os.getenv("OLLAMA_HOST")
        or default_local_url
    ).rstrip("/")
    if is_docker and ("localhost" in base_url or "127.0.0.1" in base_url):
        base_url = base_url.replace("localhost", "host.docker.internal").replace("127.0.0.1", "host.docker.internal")

    raw_model = (
        os.getenv("OLLAMA_LOCAL_MODEL")
        or os.getenv("COPILOTKIT_AGENT_MODEL")
        or os.getenv("OLLAMA_MODEL")
        or "qwen3:1.7b"
    ).strip()
    model_name = raw_model.split(":", 1)[1] if raw_model.startswith("ollama:") else raw_model

    return ModelEndpointConfig(
        mode=mode,
        base_url=base_url,
        model_name=model_name,
        api_key=None,
    )


def get_embeddings_config() -> ModelEndpointConfig:
    """Resolves embeddings configuration (defaults to Local for Chroma vector search)."""
    _reload_env()
    is_docker = os.path.exists("/.dockerenv") or os.getenv("IS_DOCKER", "").lower() in ("true", "1")

    # Embeddings mode defaults to 'local'
    raw_mode = os.getenv("OLLAMA_EMBED_MODE", "local").strip().lower()
    mode = "cloud" if raw_mode in ("cloud", "remote") else "local"

    if mode == "cloud":
        base_url = (
            os.getenv("OLLAMA_CLOUD_URL")
            or os.getenv("OLLAMA_BASE_URL")
            or "https://ollama.com"
        ).rstrip("/")
        api_key = os.getenv("OLLAMA_CLOUD_API_KEY") or os.getenv("OLLAMA_API_KEY")
        model_name = (
            os.getenv("OLLAMA_CLOUD_EMBED_MODEL")
            or os.getenv("OLLAMA_EMBED_MODEL")
            or "qwen3-embedding:0.6b"
        ).strip()
        return ModelEndpointConfig(
            mode=mode,
            base_url=base_url,
            model_name=model_name,
            api_key=api_key,
        )

    # Local mode for embeddings
    default_local_url = "http://host.docker.internal:11434" if is_docker else "http://localhost:11434"
    base_url = (
        os.getenv("OLLAMA_EMBED_URL")
        or os.getenv("OLLAMA_LOCAL_URL")
        or os.getenv("OLLAMA_HOST")
        or default_local_url
    ).rstrip("/")
    if is_docker and ("localhost" in base_url or "127.0.0.1" in base_url):
        base_url = base_url.replace("localhost", "host.docker.internal").replace("127.0.0.1", "host.docker.internal")

    model_name = (
        os.getenv("OLLAMA_LOCAL_EMBED_MODEL")
        or os.getenv("OLLAMA_EMBED_MODEL")
        or "qwen3-embedding:0.6b"
    ).strip()

    return ModelEndpointConfig(
        mode=mode,
        base_url=base_url,
        model_name=model_name,
        api_key=None,
    )


def get_model(temperature: float = 0.0, **kwargs) -> BaseChatModel:
    """Builds and returns an Ollama ChatModel instance for reasoning/chat."""
    cfg = get_chat_config()
    return ChatOllama(
        model=cfg.model_name,
        base_url=cfg.base_url,
        temperature=temperature,
        client_kwargs=cfg.client_kwargs,
        **kwargs,
    )


def get_embeddings(**kwargs) -> OllamaEmbeddings:
    """Builds and returns an OllamaEmbeddings instance for ChromaDB vector store."""
    cfg = get_embeddings_config()
    return OllamaEmbeddings(
        model=cfg.model_name,
        base_url=cfg.base_url,
        client_kwargs=cfg.client_kwargs,
        **kwargs,
    )


def create_chat_model(default_spec: str = "qwen3:1.7b", **kwargs) -> BaseChatModel:
    """Backward-compatible wrapper for existing starter code."""
    return get_model(**kwargs)
