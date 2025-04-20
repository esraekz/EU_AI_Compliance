import os
import pytesseract
from PIL import Image
import logging
import json
import uuid
import datetime
import numpy as np
from app.db.supabase_client import supabase
from app.services.e_openai_client import get_embeddings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_text_from_png(image_path):
    """
    Extract text from a PNG image using OCR.

    Args:
        image_path (str): Path to the PNG image

    Returns:
        str: Extracted text from the image
    """
    try:
        # Open the image
        image = Image.open(image_path)

        # Extract text using pytesseract
        text = pytesseract.image_to_string(image)

        logger.info(f"Successfully extracted text from {image_path}")
        return text
    except Exception as e:
        logger.error(f"Error extracting text from {image_path}: {str(e)}")
        return ""

async def generate_embeddings(text):
    """
    Generate vector embeddings for the given text.

    Args:
        text (str): Text to convert to embeddings

    Returns:
        numpy.ndarray: Vector embeddings
    """
    try:
        # Call your OpenAI client to get embeddings
        embeddings = await get_embeddings(text)

        logger.info(f"Successfully generated embeddings for text ({len(text)} chars)")
        return embeddings
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise

async def process_document(png_path, user_id=None, document_type="invoice", skip_storage=False):
    """
    Process a PNG document:
    1. Extract text using OCR
    2. Generate embeddings from the text
    3. Store both text and embeddings in database

    Args:
        png_path (str): Path to the PNG file
        user_id (str, optional): User ID associated with this document
        document_type (str): Type of document being processed
        skip_storage (bool): If True, skip storing in database

    Returns:
        dict: Result of the processing
    """
    try:
        # Extract text using OCR
        extracted_text = extract_text_from_png(png_path)

        if not extracted_text:
            return {"status": "error", "message": "No text extracted from image"}

        # Generate embeddings for the text
        embeddings = await generate_embeddings(extracted_text)

        # Generate a document ID
        doc_id = str(uuid.uuid4())

        # Create document metadata
        metadata = {
            "source": os.path.basename(png_path),
            "user_id": user_id,
            "type": document_type,
            "timestamp": str(datetime.datetime.now())
        }

        # Store in Supabase if not skipped
        if not skip_storage:
            # Store both text and embeddings
            result = supabase.table("zokuai_documents").insert({
                "id": doc_id,
                "content": extracted_text,
                "embedding": embeddings if isinstance(embeddings, list) else embeddings.tolist(),
                "metadata": json.dumps(metadata),
            }).execute()

        logger.info(f"Successfully processed document {doc_id}")
        return {
            "status": "success",
            "document_id": doc_id,
            "extracted_text": extracted_text,
            "metadata": metadata
        }

    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        return {"status": "error", "message": str(e)}
