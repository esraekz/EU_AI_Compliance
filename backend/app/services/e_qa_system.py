import logging
import json
from app.db.supabase_client import supabase
from app.services.openai_client import get_completion
from app.services.e_document_processor import generate_embeddings
from app.services.e_chat_manager import store_chat_message, search_similar_questions

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def retrieve_context(query, user_id=None, max_document_results=3, max_chat_results=2):
    """
    Retrieve relevant context for a query from both documents and chat history.

    Args:
        query (str): User's question
        user_id (str, optional): User ID for personalized results
        max_document_results (int): Maximum number of document contexts to retrieve
        max_chat_results (int): Maximum number of chat history items to retrieve

    Returns:
        dict: Retrieved context information
    """
    try:
        # Generate embeddings for the query
        query_embedding = await generate_embeddings(query)

        # Search for relevant documents
        doc_results = supabase.rpc(
            "zokuai_similarity_search",
            {
                "query_embedding": query_embedding.tolist(),
                "match_threshold": 0.5,
                "match_count": max_document_results
            }
        ).execute()

        # Find similar previous questions if user_id is provided
        chat_results = []
        if user_id:
            chat_results = await search_similar_questions(
                query,
                user_id=user_id,
                limit=max_chat_results
            )

        # Compile the context
        context = {
            "documents": doc_results.data if hasattr(doc_results, 'data') else [],
            "chat_history": chat_results,
            "document_count": len(doc_results.data) if hasattr(doc_results, 'data') else 0,
            "chat_count": len(chat_results)
        }

        return context

    except Exception as e:
        logger.error(f"Error retrieving context: {str(e)}")
        return {"documents": [], "chat_history": [], "document_count": 0, "chat_count": 0}

def format_context_for_llm(context):
    """
    Format the retrieved context into a prompt for the LLM.

    Args:
        context (dict): Retrieved context

    Returns:
        str: Formatted context string
    """
    formatted_context = "CONTEXT INFORMATION:\n\n"

    # Add document contexts
    if context["document_count"] > 0:
        formatted_context += "DOCUMENT CONTENT:\n"
        for i, doc in enumerate(context["documents"]):
            formatted_context += f"[Document {i+1}]: {doc['content'][:1000]}...\n\n"

    # Add chat history
    if context["chat_count"] > 0:
        formatted_context += "PREVIOUS CONVERSATIONS:\n"
        for i, chat in enumerate(context["chat_history"]):
            formatted_context += f"[Previous Q{i+1}]: {chat['query']}\n"
            formatted_context += f"[Previous A{i+1}]: {chat['response']}\n\n"

    return formatted_context

async def answer_question(query, user_id=None):
    """
    Answer a user's question using RAG approach.

    Args:
        query (str): User's question
        user_id (str, optional): User ID for personalized results

    Returns:
        dict: Answer and related information
    """
    try:
        # Retrieve relevant context
        context = await retrieve_context(query, user_id)

        # If no context was found, generate a response without context
        if context["document_count"] == 0 and context["chat_count"] == 0:
            prompt = f"""You are a helpful assistant that answers questions about invoice documents.

            USER QUESTION: {query}

            Please note that I don't have any specific document context for this question.
            If the question seems to be about specific invoice details that would require document context,
            please explain that you don't have that specific information.
            """
        else:
            # Format context for the LLM
            formatted_context = format_context_for_llm(context)

            # Create the prompt
            prompt = f"""You are a helpful assistant that answers questions about invoice documents.
            Use the following context information to answer the user's question.
            If the answer cannot be found in the context, acknowledge that you don't have enough information.

            {formatted_context}

            USER QUESTION: {query}

            Answer:"""

        # Get the response from LLM
        response = await get_completion(prompt)

        # Store the interaction in chat history if user_id is provided
        if user_id:
            document_ids = [doc['id'] for doc in context["documents"]] if context["documents"] else None
            await store_chat_message(user_id, query, response, document_ids)

        return {
            "answer": response,
            "sources": {
                "document_count": context["document_count"],
                "chat_count": context["chat_count"]
            }
        }

    except Exception as e:
        logger.error(f"Error answering question: {str(e)}")
        return {
            "answer": "I'm sorry, but I encountered an error while processing your question. Please try again.",
            "error": str(e)
        }
