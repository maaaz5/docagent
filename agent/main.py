from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent
from src.model import create_chat_model
from src.rag import retrieve_documents, list_bucket_documents

model = create_chat_model(
    "ollama:qwen3:1.7b", model_kwargs={"parallel_tool_calls": False}
)

SYSTEM_PROMPT = """
You are an expert documentation assistant using Retrieval-Augmented Generation (RAG).
The user uploads reference files to their "Knowledge Bucket".
- When asked what files exist, call `list_bucket_documents`.
- When asked questions about facts or instructions, call `retrieve_documents` to get context from Chroma.
- Ground your answers strictly on the retrieved context and cite sources (e.g. `[Source: filename (chunk X)]`).
"""

agent = create_agent(
    model=model,
    tools=[retrieve_documents, list_bucket_documents],
    middleware=[CopilotKitMiddleware()],
    system_prompt=SYSTEM_PROMPT,
)

graph = agent
