# zoku/backend/app/routers/qa_router.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..services.e_qa_system import answer_question
from ..auth.auth_handler import get_current_user

router = APIRouter(
    prefix="/qa",
    tags=["qa"]
)

class QuestionRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None
    session_id: Optional[str] = None

class QuestionResponse(BaseModel):
    answer: str
    sources: dict
    session_id: Optional[str] = None

@router.post("", response_model=QuestionResponse)
async def ask_document_question(
    request: QuestionRequest,
    user=None
):
    # Add debugging
    print(f"=== QA REQUEST WITH SESSION DEBUG ===")
    print(f"Question: {request.question}")
    print(f"Document IDs received: {request.document_ids}")
    print(f"Session ID: {request.session_id}")  # NEW

    if user is None:
        user = {"id": "test-user-esra"}

    result = await answer_question(
        query=request.question,
        user_id=user['id'],
        document_ids=request.document_ids,
        session_id=request.session_id  # NEW: Pass session ID
    )

    print(f"=== QA RESPONSE DEBUG ===")
    print(f"Answer: {result.get('answer', 'No answer')[:100]}...")
    print(f"Session ID: {result.get('sources', {}).get('session_id')}")

    return result


