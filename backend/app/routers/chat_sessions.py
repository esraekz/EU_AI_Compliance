# 4. CREATE NEW API ROUTES FILE: app/routers/chat_sessions.py

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from ..services.e_chat_manager import (
    create_chat_session,
    get_chat_sessions,
    get_chat_session_with_messages,
    update_chat_session,
    delete_chat_session,
    generate_session_title
)
from ..auth.auth_handler import get_current_user

router = APIRouter(
    prefix="/chat-sessions",
    tags=["chat-sessions"]
)

# Pydantic models
class ChatSessionCreate(BaseModel):
    title: Optional[str] = None
    selected_documents: Optional[List[str]] = []
    document_names: Optional[List[str]] = []

class ChatSessionUpdate(BaseModel):
    title: Optional[str] = None
    selected_documents: Optional[List[str]] = None
    document_names: Optional[List[str]] = None

class ChatSessionResponse(BaseModel):
    status: str
    session_id: Optional[str] = None
    data: Optional[dict] = None
    message: Optional[str] = None

class ChatSessionsListResponse(BaseModel):
    status: str
    sessions: Optional[List[dict]] = None
    message: Optional[str] = None

class ChatSessionWithMessages(BaseModel):
    status: str
    session: Optional[dict] = None
    message: Optional[str] = None


@router.post("", response_model=ChatSessionResponse)
async def create_new_chat_session(
    session_data: ChatSessionCreate,
    user=None
):
    """Create a new chat session"""

    # For testing - replace with actual auth
    if user is None:
        user = {"id": "test-user-esra"}

    try:
        # Generate title if not provided
        title = session_data.title or "New Chat Session"

        result = await create_chat_session(
            user_id=user['id'],
            title=title,
            selected_documents=session_data.selected_documents,
            document_names=session_data.document_names
        )

        if result["status"] == "success":
            return ChatSessionResponse(
                status="success",
                session_id=result["session_id"],
                data=result["data"]
            )
        else:
            raise HTTPException(status_code=500, detail=result["message"])

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")


@router.get("", response_model=ChatSessionsListResponse)
async def list_chat_sessions(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user=None
):
    """Get user's chat sessions"""

    # For testing - replace with actual auth
    if user is None:
        user = {"id": "test-user-esra"}

    try:
        result = await get_chat_sessions(
            user_id=user['id'],
            limit=limit,
            offset=offset
        )

        if result["status"] == "success":
            return ChatSessionsListResponse(
                status="success",
                sessions=result["sessions"]
            )
        else:
            raise HTTPException(status_code=500, detail=result["message"])

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sessions: {str(e)}")


@router.get("/{session_id}", response_model=ChatSessionWithMessages)
async def get_chat_session(
    session_id: str,
    user=None
):
    """Get a specific chat session with all messages"""

    # For testing - replace with actual auth
    if user is None:
        user = {"id": "test-user-esra"}

    try:
        result = await get_chat_session_with_messages(
            session_id=session_id,
            user_id=user['id']
        )

        if result["status"] == "success":
            return ChatSessionWithMessages(
                status="success",
                session=result["session"]
            )
        else:
            raise HTTPException(status_code=404, detail=result["message"])

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching session: {str(e)}")


@router.put("/{session_id}", response_model=ChatSessionResponse)
async def update_session(
    session_id: str,
    session_data: ChatSessionUpdate,
    user=None
):
    """Update a chat session"""

    # For testing - replace with actual auth
    if user is None:
        user = {"id": "test-user-esra"}

    try:
        # Build update dict from non-None values
        updates = {}
        if session_data.title is not None:
            updates["title"] = session_data.title
        if session_data.selected_documents is not None:
            updates["selected_documents"] = session_data.selected_documents
        if session_data.document_names is not None:
            updates["document_names"] = session_data.document_names

        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")

        result = await update_chat_session(
            session_id=session_id,
            user_id=user['id'],
            **updates
        )

        if result["status"] == "success":
            return ChatSessionResponse(
                status="success",
                data=result["data"]
            )
        else:
            raise HTTPException(status_code=404, detail=result["message"])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating session: {str(e)}")


@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    user=None
):
    """Delete a chat session"""

    # For testing - replace with actual auth
    if user is None:
        user = {"id": "test-user-esra"}

    try:
        result = await delete_chat_session(
            session_id=session_id,
            user_id=user['id']
        )

        if result["status"] == "success":
            return {"status": "success", "message": "Session deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail=result["message"])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")


# 5. UPDATE main.py to include the new router:

# Add this import to your main.py:
# from app.routers.chat_sessions import router as chat_sessions_router

# Add this line with your other router includes:
# app.include_router(chat_sessions_router)
