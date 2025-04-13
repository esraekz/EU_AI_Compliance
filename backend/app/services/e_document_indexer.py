# app/services/document_indexer.py

import logging
from typing import Optional

from app.db.supabase_client import get_invoice, supabase
from app.services.e_text_extraction import extract_text_from_file, get_file_extension
from app.services.openai_client import create_document_embedding

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
STORAGE_BUCKET = "invoices"

async def process_invoice(invoice_id: str, user_id: Optional[str] = None) -> bool:
    """
    Process an invoice for chat functionality:
    1. Extract text from the invoice
    2. Generate embedding for the extracted text
    3. Store both text and embedding for retrieval during chat

    Args:
        invoice_id: The ID of the invoice to process
        user_id: Optional user ID to verify ownership

    Returns:
        bool: True if processing was successful, False otherwise
    """
    try:
        # Get invoice details from database
        invoice = await get_invoice(invoice_id)

        if not invoice:
            logger.error(f"Invoice not found: {invoice_id}")
            return False

        # If user_id is provided, verify this invoice belongs to the user
        if user_id and invoice["user_id"] != user_id:
            logger.error(f"Access denied: Invoice {invoice_id} does not belong to user {user_id}")
            return False

        # Check if this invoice has already been processed
        existing_vector = supabase.table("zokuai_document_vectors").select("id") \
            .eq("invoice_id", invoice_id).execute()

        if existing_vector.data:
            logger.info(f"Invoice {invoice_id} already processed")
            return True

        # Download file from Supabase storage
        logger.info(f"Downloading invoice {invoice_id} from storage")
        storage_path = invoice["storage_path"]
        file_data = supabase.storage.from_(STORAGE_BUCKET).download(storage_path)

        # Extract text using your existing extraction service
        logger.info(f"Extracting text from invoice {invoice_id}")
        file_extension = get_file_extension(invoice["filename"])
        text_content = extract_text_from_file(file_data, file_extension)

        if not text_content:
            logger.warning(f"No text extracted from invoice {invoice_id}")
            return False

        # Generate embedding
        logger.info(f"Generating embedding for invoice {invoice_id}")
        embedding = await create_document_embedding(text_content)

        # Store in database
        logger.info(f"Storing document vector for invoice {invoice_id}")
        result = supabase.table("zokuai_document_vectors").insert({
            "invoice_id": invoice_id,
            "user_id": invoice["user_id"],
            "text_content": text_content,
            "embedding": embedding
        }).execute()

        if not result.data:
            logger.error(f"Failed to store document vector for invoice {invoice_id}")
            return False

        logger.info(f"Successfully processed invoice {invoice_id}")
        return True

    except Exception as e:
        logger.error(f"Error processing invoice {invoice_id}: {str(e)}")
        return False
