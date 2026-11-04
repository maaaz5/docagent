from langgraph.graph import StateGraph, START, END
from src.state import GraphState
from src.nodes.retrieve import retrieve_node
from src.nodes.grade_documents import grade_documents_node
from src.nodes.rewrite_query import rewrite_query_node
from src.nodes.generate import generate_node
from src.nodes.direct_chat import direct_chat_node
from src.edges import decide_to_generate, route_question

workflow = StateGraph(GraphState)

workflow.add_node("retrieve", retrieve_node)
workflow.add_node("grade_documents", grade_documents_node)
workflow.add_node("rewrite_query", rewrite_query_node)
workflow.add_node("generate", generate_node)
workflow.add_node("direct_chat", direct_chat_node)

workflow.add_conditional_edges(
    START,
    route_question,
    {
        "vectorstore": "retrieve",
        "general_chat": "direct_chat",
    },
)

workflow.add_edge("retrieve", "grade_documents")

workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "generate": "generate",
        "rewrite_query": "rewrite_query",
    },
)

workflow.add_edge("rewrite_query", "retrieve")
workflow.add_edge("generate", END)

workflow.add_edge("direct_chat", END)

graph = workflow.compile()
