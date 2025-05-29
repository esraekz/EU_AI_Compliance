# UPDATE YOUR EXISTING e_chat_manager.py
# Since you have both zokuai_chat_history and zokuai_chat_messages tables

import uuid
import json
from datetime import datetime
from app.db.supabase_client import supabase
from app.services.e_document_processor import generate_embeddings

# EXTEND EXISTING FUNCTIONS - ADD THESE TO YOUR e_chat_manager.py:

async def create_chat_session(user_id: str, title: str, selected_documents: list = None, document_names: list = None):
    """
    Create a new chat session using your existing table structure
    """
    try:
        session_id = str(uuid.uuid4())

        session_data = {
            "id": session_id,
            "user_id": user_id,
            "title": title,
            "selected_documents": selected_documents or [],
            "document_names": document_names or [],
            "message_count": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": True
        }

        result = supabase.table("zokuai_chat_sessions").insert(session_data).execute()

        if result.data:
            print(f"✅ Created chat session: {session_id}")
            return {"status": "success", "session_id": session_id, "data": result.data[0]}
        else:
            return {"status": "error", "message": "Failed to create session"}

    except Exception as e:
        print(f"❌ Error creating chat session: {str(e)}")
        return {"status": "error", "message": str(e)}


async def get_chat_sessions(user_id: str, limit: int = 50, offset: int = 0):
    """
    Get user's chat sessions with message counts from both tables
    """
    try:
        # Use the view we created, or query directly with JOIN
        result = supabase.table("zokuai_chat_sessions") \
            .select("*, zokuai_chat_history(count)") \
            .eq("user_id", user_id) \
            .eq("is_active", True) \
            .order("updated_at", desc=True) \
            .range(offset, offset + limit - 1) \
            .execute()

        # Enhanced: Add actual message counts
        sessions = []
        for session in result.data:
            # Count messages in both tables for this session
            history_count = 0
            messages_count = 0

            try:
                # Count from zokuai_chat_history (your main backend table)
                history_result = supabase.table("zokuai_chat_history") \
                    .select("id", count="exact") \
                    .eq("session_id", session["id"]) \
                    .execute()
                history_count = history_result.count or 0

                # Count from zokuai_chat_messages
                messages_result = supabase.table("zokuai_chat_messages") \
                    .select("id", count="exact") \
                    .eq("session_id", session["id"]) \
                    .execute()
                messages_count = messages_result.count or 0

            except Exception as count_error:
                print(f"Warning: Could not count messages for session {session['id']}: {count_error}")

            # Add counts to session data
            session["history_message_count"] = history_count
            session["chat_message_count"] = messages_count
            session["total_message_count"] = history_count + messages_count

            sessions.append(session)

        print(f"📚 Retrieved {len(sessions)} chat sessions for user {user_id}")
        return {"status": "success", "sessions": sessions}

    except Exception as e:
        print(f"❌ Error retrieving chat sessions: {str(e)}")
        return {"status": "error", "message": str(e)}


async def get_chat_session_with_messages(session_id: str, user_id: str):
    """
    Get a specific session with messages from BOTH tables
    """
    try:
        # Get session details
        session_result = supabase.table("zokuai_chat_sessions") \
            .select("*") \
            .eq("id", session_id) \
            .eq("user_id", user_id) \
            .eq("is_active", True) \
            .execute()

        if not session_result.data:
            return {"status": "error", "message": "Session not found"}

        session = session_result.data[0]

        # Get messages from zokuai_chat_history (main backend table with embeddings)
        history_result = supabase.table("zokuai_chat_history") \
            .select("*") \
            .eq("session_id", session_id) \
            .order("timestamp", desc=False) \
            .execute()

        # Get messages from zokuai_chat_messages (if any)
        messages_result = supabase.table("zokuai_chat_messages") \
            .select("*") \
            .eq("session_id", session_id) \
            .order("created_at", desc=False) \
            .execute()

        # Combine and format messages
        all_messages = []

        # Add history messages (these have query/response pairs)
        for msg in history_result.data:
            all_messages.append({
                "id": msg["id"],
                "type": "user",
                "text": msg["query"],
                "timestamp": msg["timestamp"],
                "source": "history"
            })
            all_messages.append({
                "id": f"{msg['id']}_response",
                "type": "system",
                "text": msg["response"],
                "timestamp": msg["timestamp"],
                "source": "history"
            })

        # Add chat messages (these are individual messages)
        for msg in messages_result.data:
            all_messages.append({
                "id": msg["id"],
                "type": msg.get("role", "system"),
                "text": msg["content"],
                "timestamp": msg["created_at"],
                "source": "messages"
            })

        # Sort all messages by timestamp
        all_messages.sort(key=lambda x: x["timestamp"])

        session["messages"] = all_messages
        session["history_messages"] = history_result.data
        session["chat_messages"] = messages_result.data

        print(f"📖 Retrieved session {session_id} with {len(all_messages)} total messages")
        return {"status": "success", "session": session}

    except Exception as e:
        print(f"❌ Error retrieving session with messages: {str(e)}")
        return {"status": "error", "message": str(e)}


async def update_chat_session(session_id: str, user_id: str, **updates):
    """
    Update session metadata
    """
    try:
        updates["updated_at"] = datetime.now().isoformat()

        result = supabase.table("zokuai_chat_sessions") \
            .update(updates) \
            .eq("id", session_id) \
            .eq("user_id", user_id) \
            .execute()

        if result.data:
            print(f"✅ Updated session {session_id}")
            return {"status": "success", "data": result.data[0]}
        else:
            return {"status": "error", "message": "Session not found or update failed"}

    except Exception as e:
        print(f"❌ Error updating session: {str(e)}")
        return {"status": "error", "message": str(e)}


async def delete_chat_session(session_id: str, user_id: str):
    """
    Soft delete a chat session (marks as inactive, keeps data)
    """
    try:
        result = supabase.table("zokuai_chat_sessions") \
            .update({"is_active": False, "updated_at": datetime.now().isoformat()}) \
            .eq("id", session_id) \
            .eq("user_id", user_id) \
            .execute()

        if result.data:
            print(f"🗑️ Soft deleted session {session_id}")
            return {"status": "success"}
        else:
            return {"status": "error", "message": "Session not found"}

    except Exception as e:
        print(f"❌ Error deleting session: {str(e)}")
        return {"status": "error", "message": str(e)}


# UPDATE YOUR EXISTING store_chat_message FUNCTION:
# Add session_id parameter and update session stats

async def store_chat_message(user_id, query, response, document_ids=None, session_id=None):
    """
    Store a chat message in zokuai_chat_history with session support
    """
    try:
        message_id = str(uuid.uuid4())

        # Generate embeddings for the query (for future similarity search)
        query_embedding = await generate_embeddings(query)

        # Store the chat message WITH session_id in your existing table
        embedding_list = query_embedding.tolist() if hasattr(query_embedding, 'tolist') else query_embedding

        message_data = {
            "id": message_id,
            "user_id": user_id,
            "query": query,
            "query_embedding": embedding_list,
            "response": response,
            "document_ids": document_ids,
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id  # NEW: Link to session
        }

        result = supabase.table("zokuai_chat_history").insert(message_data).execute()

        # Update session message count and timestamp
        if session_id:
            await update_session_stats(session_id, user_id)

        print(f"💬 Stored chat message {message_id} in session {session_id}")
        return {"status": "success", "message_id": message_id}

    except Exception as e:
        print(f"❌ Error storing chat message: {str(e)}")
        return {"status": "error", "message": str(e)}


async def update_session_stats(session_id: str, user_id: str):
    """
    Update session statistics (message count, last updated)
    """
    try:
        # Count messages in zokuai_chat_history for this session
        count_result = supabase.table("zokuai_chat_history") \
            .select("id", count="exact") \
            .eq("session_id", session_id) \
            .execute()

        message_count = count_result.count or 0

        # Update session
        await update_chat_session(
            session_id,
            user_id,
            message_count=message_count,
            updated_at=datetime.now().isoformat()
        )

        print(f"📊 Updated session {session_id} stats: {message_count} messages")

    except Exception as e:
        print(f"❌ Error updating session stats: {str(e)}")


def generate_session_title(first_message: str) -> str:
    """Generate a meaningful title from the first user message"""
    try:
        import re
        # Clean up the message and take first few words
        cleaned = re.sub(r'[^\w\s]', '', first_message)
        words = cleaned.split()[:6]  # First 6 words
        title = ' '.join(words)

        if len(title) < 3:
            return "New Chat Session"

        return title.title()  # Capitalize words

    except Exception:
        return "New Chat Session"

