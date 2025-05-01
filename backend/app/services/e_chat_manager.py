import logging
import json
import uuid
import datetime
from app.db.supabase_client import supabase
from app.services.e_document_processor import generate_embeddings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def store_chat_message(user_id, query, response, document_ids=None):
    """
    Store a chat message in the database.

    Args:
        user_id (str): User ID
        query (str): User's question
        response (str): System's response
        document_ids (list, optional): IDs of relevant documents

    Returns:
        dict: Result of the operation
    """
    try:
        message_id = str(uuid.uuid4())

        # Generate embeddings for the query (for future similarity search)
        query_embedding = await generate_embeddings(query)

        # Store the chat message
        embedding_list = query_embedding.tolist() if hasattr(query_embedding, 'tolist') else query_embedding
        result = supabase.table("zokuai_chat_history").insert({
            "id": message_id,
            "user_id": user_id,
            "query": query,
            "query_embedding": embedding_list,
            "response": response,
            "document_ids": json.dumps(document_ids) if document_ids else None,
            "timestamp": str(datetime.datetime.now())
        }).execute()

        logger.info(f"Stored chat message {message_id}")
        return {"status": "success", "message_id": message_id}
    except Exception as e:
        logger.error(f"Error storing chat message: {str(e)}")
        return {"status": "error", "message": str(e)}

async def get_chat_history(user_id, limit=10):
    """
    Get chat history for a user.

    Args:
        user_id (str): User ID
        limit (int): Maximum number of messages to return

    Returns:
        list: Chat history
    """
    try:
        result = supabase.table("zokuai_chat_history") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("timestamp", desc=True) \
            .limit(limit) \
            .execute()

        logger.info(f"Retrieved {len(result.data)} chat messages for user {user_id}")
        return result.data
    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}")
        return []

async def search_similar_questions(query_text, user_id=None, limit=5):
    """
    Search for similar previous questions in the chat history.

    Args:
        query_text (str): The query text to search for
        user_id (str, optional): If provided, search only this user's history
        limit (int): Maximum number of results to return

    Returns:
        list: Similar questions with their answers
    """
    try:
        # Generate embeddings for the query text
        query_embedding = await generate_embeddings(query_text)
        embedding_list = query_embedding.tolist() if hasattr(query_embedding, 'tolist') else query_embedding

        # Prepare the RPC call parameters
        params = {
            "query_embedding": embedding_list,
            "match_threshold": 0.7,  # Higher threshold for questions
            "match_count": limit
        }

        # Add user_id parameter if provided
        if user_id:
            params["p_user_id"] = user_id

            # Call the function with user_id filter
            result = supabase.rpc("zokuai_similar_questions", params).execute()
        else:
            # Call the function without user_id filter
            result = supabase.rpc("zokuai_similar_questions_all", params).execute()

        logger.info(f"Found {len(result.data)} similar questions")
        return result.data
    except Exception as e:
        logger.error(f"Error searching similar questions: {str(e)}")
        return []


