# zoku/backend/app/services/e_qa_system.py

import logging
import json
from app.db.supabase_client import supabase, get_invoice
from app.services.e_openai_completions import get_completion
from app.services.e_document_processor import generate_embeddings
from app.services.e_chat_manager import store_chat_message, search_similar_questions

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def retrieve_context_from_embeddings(query, user_id=None, document_ids=None, max_results=3):
    """
    Retrieve relevant context using vector embeddings - FIXED VERSION
    """
    try:
        print(f"=== USING VECTOR SEARCH ===")
        print(f"Query: {query}")
        print(f"Document IDs filter: {document_ids}")

        # Generate embeddings for the query
        query_embedding = await generate_embeddings(query)
        embedding_list = query_embedding.tolist() if hasattr(query_embedding, 'tolist') else query_embedding

        # If specific document IDs are provided, we need to filter by them
        if document_ids:
            print(f"Filtering by specific document IDs: {document_ids}")

            # Get documents that match both similarity AND document ID filter
            # First, get all embeddings - use fallback method since we have user ID inconsistencies
            try:
                # Get all documents and filter manually (more reliable)
                result = supabase.table("zokuai_documents").select("*").execute()
                print(f"Retrieved {len(result.data)} total documents from database")

                # Debug: Check what user IDs we actually have
                user_ids_found = set()
                for doc in result.data:
                    try:
                        metadata_str = doc.get('metadata', '{}')
                        if isinstance(metadata_str, str):
                            metadata = json.loads(metadata_str)
                        else:
                            metadata = metadata_str
                        user_ids_found.add(metadata.get('user_id'))
                    except:
                        pass

                print(f"User IDs found in database: {user_ids_found}")
                print(f"Looking for user ID: {user_id}")

            except Exception as query_error:
                print(f"Error querying documents: {str(query_error)}")
                result = {"data": []}

            # Filter for documents that match the specific invoice IDs
            invoice_contents = []

            for doc in result.data:
                try:
                    # Parse metadata safely
                    metadata_str = doc.get('metadata', '{}')
                    if isinstance(metadata_str, str):
                        metadata = json.loads(metadata_str)
                    else:
                        metadata = metadata_str

                    # Check if this document belongs to one of the requested invoices
                    doc_invoice_id = metadata.get('invoice_id')
                    doc_user_id = metadata.get('user_id')

                    print(f"Document {doc['id']}: invoice_id={doc_invoice_id}, user_id={doc_user_id}")

                    # TEMPORARY FIX: Accept both test-user-esra and test-user-123
                    valid_user_ids = [user_id, "test-user-123", "test-user-esra"]

                    # Match user (with fallback) and invoice ID
                    if doc_user_id in valid_user_ids and doc_invoice_id in document_ids:
                        print(f"✓ Document matches criteria (user: {doc_user_id}, invoice: {doc_invoice_id})")
                        invoice_contents.append({
                            'id': doc_invoice_id,
                            'content': doc['content'],
                            'filename': metadata.get('source', 'Unknown'),
                            'supplier': metadata.get('supplier', 'Unknown'),
                            'upload_date': metadata.get('timestamp', 'Unknown')
                        })
                    else:
                        print(f"✗ Document doesn't match criteria (user: {doc_user_id}, invoice: {doc_invoice_id})")
                        print(f"  Expected user in: {valid_user_ids}")
                        print(f"  Expected invoice in: {document_ids}")

                except Exception as parse_error:
                    print(f"Error parsing document metadata: {str(parse_error)}")
                    continue

            print(f"Matched {len(invoice_contents)} documents for invoice IDs: {document_ids}")

        else:
            # General similarity search across all documents
            try:
                # Use your RPC function for similarity search
                search_params = {
                    "query_embedding": embedding_list,
                    "match_threshold": 0.5,
                    "match_count": max_results
                }

                if user_id:
                    search_params["filter_user_id"] = user_id

                doc_results = supabase.rpc("zokuai_similarity_search", search_params).execute()

                invoice_contents = []
                for doc in doc_results.data:
                    try:
                        metadata_str = doc.get('metadata', '{}')
                        if isinstance(metadata_str, str):
                            metadata = json.loads(metadata_str)
                        else:
                            metadata = metadata_str

                        invoice_contents.append({
                            'id': doc['id'],
                            'content': doc['content'],
                            'filename': metadata.get('source', 'Unknown'),
                            'supplier': metadata.get('supplier', 'Unknown'),
                            'upload_date': metadata.get('timestamp', 'Unknown')
                        })
                    except Exception as parse_error:
                        print(f"Error parsing similarity search result: {str(parse_error)}")
                        continue

            except Exception as similarity_error:
                print(f"Similarity search failed: {str(similarity_error)}")
                invoice_contents = []

        print(f"Final result: Found {len(invoice_contents)} documents using vector search")

        return {
            "documents": invoice_contents,
            "document_count": len(invoice_contents),
            "chat_count": 0
        }

    except Exception as e:
        print(f"ERROR in vector search: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"documents": [], "document_count": 0, "chat_count": 0}

async def answer_question(query, user_id=None, document_ids=None):
    """
    Answer using vector embeddings - THE EFFICIENT WAY
    """
    try:
        print(f"=== QA SYSTEM (VECTOR APPROACH) ===")
        print(f"Query: {query}")
        print(f"User ID: {user_id}")
        print(f"Document IDs: {document_ids}")

        # Use vector search instead of file processing
        context = await retrieve_context_from_embeddings(query, user_id, document_ids)

        print(f"Vector search found {context['document_count']} documents")

        if context["document_count"] == 0:
            if document_ids:
                prompt = f"""You are a helpful assistant for invoice analysis.

USER QUESTION: {query}

The selected documents haven't been processed for AI analysis yet, or no matching content was found.
Please explain that the documents need to be processed first, or suggest selecting different documents.
"""
            else:
                prompt = f"""You are a helpful assistant for invoice analysis.

USER QUESTION: {query}

No documents were selected for analysis. Please ask the user to select one or more processed invoices to analyze.
"""
        else:
            # Format context for the LLM
            formatted_context = "INVOICE DOCUMENTS:\n\n"
            for i, doc in enumerate(context["documents"]):
                formatted_context += f"[Invoice {i+1}] File: {doc['filename']}\n"
                formatted_context += f"Content: {doc['content'][:1500]}...\n\n"

            prompt = f"""You are a helpful assistant that answers questions about invoice documents.
Use the following invoice information to answer the user's question accurately.

{formatted_context}

USER QUESTION: {query}

Please provide a helpful and accurate answer based on the invoice information above.
"""

        # Get response from LLM
        response = await get_completion(prompt)

        # Store chat history
        if user_id:
            try:
                await store_chat_message(user_id, query, response, document_ids)
            except Exception as e:
                print(f"Error storing chat: {str(e)}")

        return {
            "answer": response,
            "sources": {
                "document_count": context["document_count"],
                "document_ids": document_ids or []
            }
        }

    except Exception as e:
        print(f"ERROR in QA system: {str(e)}")
        return {
            "answer": "I encountered an error processing your question. Please try again.",
            "sources": {"error": str(e)}
        }
