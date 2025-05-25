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

async def get_original_filename(invoice_id):
    """
    Helper function to get the original filename from the invoice record
    """
    try:
        result = supabase.table("zokuai_invoices").select("filename").eq("id", invoice_id).execute()

        if result.data and len(result.data) > 0:
            original_filename = result.data[0].get('filename', 'Unknown Document')
            print(f"Found original filename for {invoice_id}: {original_filename}")
            return original_filename
        else:
            fallback_name = f"Document {invoice_id[:8]}..."
            print(f"No filename found for {invoice_id}, using fallback: {fallback_name}")
            return fallback_name

    except Exception as e:
        print(f"Error fetching original filename for {invoice_id}: {str(e)}")
        fallback_name = f"Document {invoice_id[:8]}..."
        print(f"Using fallback name: {fallback_name}")
        return fallback_name

# Fix 3: Update the Q&A system backend to better handle multiple documents
# In e_qa_system.py, update the retrieve_context_from_embeddings function:

# Fix 1: Update retrieve_context_from_embeddings to get original filenames
# In e_qa_system.py, modify the document processing part:

async def retrieve_context_from_embeddings(query, user_id=None, document_ids=None, max_results=3):
    """
    Retrieve relevant context using vector embeddings - WITH USER-FRIENDLY NAMES
    """
    try:
        print(f"=== USING VECTOR SEARCH (MULTI-DOC) ===")
        print(f"Query: {query}")
        print(f"Document IDs filter: {document_ids}")
        print(f"Number of document IDs: {len(document_ids) if document_ids else 0}")

        # Generate embeddings for the query
        query_embedding = await generate_embeddings(query)
        embedding_list = query_embedding.tolist() if hasattr(query_embedding, 'tolist') else query_embedding

        # If specific document IDs are provided, filter by them
        if document_ids and len(document_ids) > 0:
            print(f"Filtering by specific document IDs: {document_ids}")

            # Get all documents from database
            try:
                result = supabase.table("zokuai_documents").select("*").execute()
                print(f"Retrieved {len(result.data)} total documents from database")

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

                        # GET ORIGINAL FILENAME FROM INVOICE TABLE
                        original_filename = "Unknown Document"
                        try:
                            # Fetch the original invoice record to get the user-friendly filename
                            invoice_result = await get_invoice(doc_invoice_id)
                            if invoice_result:
                                original_filename = invoice_result.get('filename', 'Unknown Document')
                                print(f"Found original filename: {original_filename}")
                            else:
                                print(f"No invoice record found for ID: {doc_invoice_id}")
                        except Exception as invoice_error:
                            print(f"Error fetching invoice record: {str(invoice_error)}")
                            # Fallback: clean up the metadata source name
                            source_name = metadata.get('source', 'Unknown')
                            if source_name.endswith('.png') and len(source_name) > 40:  # Likely a UUID-based name
                                original_filename = f"Document {doc_invoice_id[:8]}..."  # Use first 8 chars of ID
                            else:
                                original_filename = source_name

                        invoice_contents.append({
                            'id': doc_invoice_id,
                            'document_db_id': doc['id'],
                            'content': doc['content'],
                            'filename': original_filename,  # Use original filename instead of processed PNG name
                            'processed_filename': metadata.get('source', 'Unknown'),  # Keep processed name for debugging
                            'supplier': metadata.get('supplier', 'Unknown'),
                            'upload_date': metadata.get('timestamp', 'Unknown')
                        })
                    else:
                        print(f"✗ Document doesn't match criteria (user: {doc_user_id}, invoice: {doc_invoice_id})")

                except Exception as parse_error:
                    print(f"Error parsing document metadata: {str(parse_error)}")
                    continue

            print(f"Matched {len(invoice_contents)} documents for invoice IDs: {document_ids}")

        else:
            print("No specific document IDs provided, using general similarity search")
            # Handle general similarity search case
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

# Fix 4: Update the answer_question function to handle multiple documents better
# In e_qa_system.py, update the answer_question function:

# Fix 2: Update the answer_question function to use user-friendly names in prompts
# In e_qa_system.py, update the answer_question function:

async def answer_question(query, user_id=None, document_ids=None):
    """
    Answer using vector embeddings - WITH USER-FRIENDLY DOCUMENT NAMES
    """
    try:
        print(f"=== QA SYSTEM (MULTI-DOC VECTOR APPROACH) ===")
        print(f"Query: {query}")
        print(f"User ID: {user_id}")
        print(f"Document IDs: {document_ids}")
        print(f"Number of documents requested: {len(document_ids) if document_ids else 0}")

        # Use vector search to find relevant documents
        context = await retrieve_context_from_embeddings(query, user_id, document_ids)

        print(f"Vector search found {context['document_count']} documents")

        if context["document_count"] == 0:
            if document_ids and len(document_ids) > 0:
                prompt = f"""You are a helpful assistant for invoice analysis.

USER QUESTION: {query}

The selected documents ({len(document_ids)} documents) haven't been processed for AI analysis yet, or no matching content was found.

Please explain that these specific documents need to be processed first, or suggest selecting different documents that have been processed.
"""
            else:
                prompt = f"""You are a helpful assistant for invoice analysis.

USER QUESTION: {query}

No documents were selected for analysis. Please ask the user to select one or more processed invoices to analyze.
"""
        else:
            # Format context for the LLM - HANDLE MULTIPLE DOCUMENTS WITH USER-FRIENDLY NAMES
            if context["document_count"] == 1:
                doc = context["documents"][0]
                user_friendly_name = doc['filename']

                formatted_context = f"INVOICE DOCUMENT:\n\n"
                formatted_context += f"Document: {user_friendly_name}\n"
                formatted_context += f"Content: {doc['content'][:2000]}...\n\n"

                context_description = f'the invoice document "{user_friendly_name}"'
            else:
                formatted_context = f"MULTIPLE INVOICE DOCUMENTS ({context['document_count']} documents):\n\n"
                document_names = []

                for i, doc in enumerate(context["documents"]):
                    user_friendly_name = doc['filename']
                    document_names.append(user_friendly_name)

                    formatted_context += f"[Document {i+1}] {user_friendly_name}\n"
                    formatted_context += f"Content: {doc['content'][:1500]}...\n\n"

                context_description = f'the invoice documents: {", ".join(document_names)}'

            prompt = f"""You are a helpful assistant that answers questions about invoice documents.
Use the following invoice information to answer the user's question accurately.

{formatted_context}

USER QUESTION: {query}

Instructions:
- Analyze ALL the provided documents when answering
- When referencing documents, use their actual filenames (not processed filenames or IDs)
- If comparing or summarizing multiple documents, clearly distinguish between them by their filenames
- If extracting data (like totals, dates, vendors), provide information from ALL relevant documents
- If the question asks for specific data, format it clearly (e.g., use tables, lists, or clear sections)
- Be comprehensive but concise
- Always reference documents by their user-friendly names

Please provide a helpful and accurate answer based on {context_description}.
"""

        # Get response from LLM
        response = await get_completion(prompt)

        # Store chat history
        if user_id:
            try:
                await store_chat_message(user_id, query, response, document_ids)
            except Exception as e:
                print(f"Error storing chat: {str(e)}")

        # Return response with user-friendly document names
        processed_document_names = []
        for doc in context.get("documents", []):
            processed_document_names.append(doc.get('filename', f'Document {doc.get("id", "Unknown")[:8]}'))

        return {
            "answer": response,
            "sources": {
                "document_count": context["document_count"],
                "document_ids": document_ids or [],
                "documents_processed": processed_document_names  # Use user-friendly names
            }
        }

    except Exception as e:
        print(f"ERROR in QA system: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "answer": "I encountered an error processing your question. Please try again.",
            "sources": {"error": str(e)}
        }

async def get_original_filename(invoice_id):
    """
    Helper function to get the original filename from the invoice record
    """
    try:
        result = supabase.table("zokuai_invoices").select("filename").eq("id", invoice_id).execute()

        if result.data and len(result.data) > 0:
            return result.data[0].get('filename', 'Unknown Document')
        else:
            return f"Document {invoice_id[:8]}..."

    except Exception as e:
        print(f"Error fetching original filename for {invoice_id}: {str(e)}")
        return f"Document {invoice_id[:8]}..."
