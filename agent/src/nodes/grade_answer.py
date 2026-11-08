from langchain_core import documents
from pydantic import BaseModel, Field
from src.state import GraphState
from src.model import get_model

class GradeHallucination(BaseModel):
  """Binary score for hallucination check in generation."""
  binary_score: str = Field(description="Answer is grounded in the facts, 'yes' or 'no'") 

class GradeAnswer(BaseModel):
  """Binary score to assess answer addresses question."""
  binary_score: str = Field(description="Answer addresses the question, 'yes' or 'no'")

def grade_generation_node(state: GraphState):
  """
  Evaluates whether the generation is grounded and answers the question.
  """
  question = state['question']
  documents = state.get('documents', [])
  generation = state.get('generation', "")

  print("--- [NODE: GRADE ANSWER] Checking hallucination & relevance ---") 

  model = get_model(temperature=0.0)

  context = "\n\n".join(documents)

  hallucination_grader = model.with_structured_output(GradeHallucination)

  h_prompt = f"""Facts:
    {context}
    Student Answer:
    {generation}
    Is the student answer grounded in the facts? Answer 'yes' or 'no'.""" 
  
  try:
    h_grade = hallucination_grader.invoke(h_prompt).binary_score.strip().lower()
  except Exception:
    h_grade = "yes"
  
  answer_grader = model.with_structured_output(GradeAnswer)

  a_prompt = f"""Question:
    {question}
    Student Answer:
    {generation}
    Does the student answer address the question? Answer 'yes' or 'no'."""

  try:
    a_grade = answer_grader.invoke(a_prompt).binary_score.strip().lower()
  except Exception:
    a_grade = "yes"

  is_grounded = (h_grade == "yes")
  
  addresses_question = (a_grade == "yes")

  print(f"--- [GRADE RESULTS] Grounded: {is_grounded}, Answers Question: {addresses_question} ---")

  loop_step = state.get("loop_step", 0)

  # If generation is a direct strict-mode fallback message, finish immediately
  if "could not find any relevant information in the uploaded documents" in generation.lower():
    print("--- [DECISION] Strict Mode no-docs answer -> END ---")
    return "useful"

  if is_grounded and addresses_question:
    print("--- [DECISION] Grounded and addresses question -> END ---")
    return "useful"

  if loop_step >= 2:
    print("--- [DECISION] Max retries reached -> END ---")
    return "useful"

  if not is_grounded:
    print("--- [DECISION] Hallucination detected -> REGENERATE ---")
    return "not_grounded"

  print("--- [DECISION] Does not address question -> REWRITE QUERY ---")
  return "not_useful"
  
  # return {"generation": generation}

