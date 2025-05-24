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

class QuestionResponse(BaseModel):
    answer: str
    sources: dict

@router.post("", response_model=QuestionResponse)
async def ask_document_question(
    request: QuestionRequest,
    user=None
):
    """
    Answer a question about specific documents
    """
    # Add debugging
    print(f"=== QA REQUEST DEBUG ===")
    print(f"Question: {request.question}")
    print(f"Document IDs received: {request.document_ids}")
    print(f"Number of documents: {len(request.document_ids) if request.document_ids else 0}")

    # Add this check for testing
    if user is None:
        user = {"id": "test-user-esra"}

    result = await answer_question(
        query=request.question,
        user_id=user['id'],
        document_ids=request.document_ids
    )

    print(f"=== QA RESPONSE DEBUG ===")
    print(f"Answer: {result.get('answer', 'No answer')[:100]}...")
    print(f"Sources: {result.get('sources', {})}")

    return result
