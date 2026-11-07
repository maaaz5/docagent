"""
Thin wrapper to serve the LangGraph agent via AG-UI protocol.
Used in Docker where langgraph-cli dev (which needs Docker) is unavailable.
"""

import os
import sys

# Ensure agent directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.memory import MemorySaver

# Import the original graph from main.py
from main import graph

# The create_agent() graph may not have a checkpointer (it's normally
# provided by the LangGraph Platform server). Add one for standalone serving.
if not hasattr(graph, "checkpointer") or graph.checkpointer is None:
    graph = graph.copy()
    graph.checkpointer = MemorySaver()

# Use copilotkit's LangGraphAGUIAgent to serve via AG-UI
from copilotkit import LangGraphAGUIAgent
from ag_ui_langgraph import add_langgraph_fastapi_endpoint

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="sample_agent",
        description="LangGraph Python starter agent",
        graph=graph,
    ),
    path="/",
)

if __name__ == "__main__":
    port = int(os.getenv("AGENT_PORT", "8123"))
    uvicorn.run(app, host="0.0.0.0", port=port)

