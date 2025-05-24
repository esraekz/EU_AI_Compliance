import os
import pytesseract
from PIL import Image
import logging
import json
import uuid
import datetime
import numpy as np
from app.db.supabase_client import supabase
from app.services.e_openai_client import get_embeddings  # FIXED: Use correct function name

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
        logger.info(f"Extracted text length: {len(text)} characters")
        logger.info(f"First 200 chars: {text[:200]}")
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
        embeddings = await get_embeddings(text)  # FIXED: Use correct function name

        logger.info(f"Successfully generated embeddings for text ({len(text)} chars)")
        return embeddings
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise

async def process_document(png_path, user_id=None, document_type="invoice", skip_storage=False, invoice_id=None):
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
        invoice_id (str, optional): Invoice ID to link back to original invoice

    Returns:
        dict: Result of the processing
    """
    try:
        print(f"=== DOCUMENT PROCESSING START ===")
        print(f"PNG Path: {png_path}")
        print(f"User ID: {user_id}")
        print(f"Invoice ID: {invoice_id}")
        print(f"Document Type: {document_type}")
        print(f"Skip Storage: {skip_storage}")

        # Check if file exists
        if not os.path.exists(png_path):
            error_msg = f"PNG file does not exist at path: {png_path}"
            print(f"ERROR: {error_msg}")
            return {"status": "error", "message": error_msg}

        print(f"✓ PNG file exists, size: {os.path.getsize(png_path)} bytes")

        # Extract text using OCR
        print("Starting text extraction...")
        extracted_text = extract_text_from_png(png_path)

        if not extracted_text or len(extracted_text.strip()) == 0:
            error_msg = "No text extracted from image"
            print(f"ERROR: {error_msg}")
            return {"status": "error", "message": error_msg}

        print(f"✓ Text extracted successfully: {len(extracted_text)} characters")
        print(f"First 200 characters: {extracted_text[:200]}")

        # Generate embeddings for the text
        print("Starting embedding generation...")
        embeddings = await generate_embeddings(extracted_text)
        print(f"✓ Embeddings generated successfully")

        # Generate a document ID
        doc_id = str(uuid.uuid4())
        print(f"✓ Generated document ID: {doc_id}")

        # Create document metadata
        metadata = {
            "source": os.path.basename(png_path),
            "user_id": user_id,
            "type": document_type,
            "timestamp": str(datetime.datetime.now()),
            "invoice_id": invoice_id
        }
        print(f"✓ Created metadata: {metadata}")

        # Store in Supabase if not skipped
        if not skip_storage:
            print("Storing document in database...")
            try:
                # Convert embeddings to list format for storage
                if hasattr(embeddings, 'tolist'):
                    embedding_list = embeddings.tolist()
                elif isinstance(embeddings, list):
                    embedding_list = embeddings
                else:
                    embedding_list = list(embeddings)

                print(f"Embedding converted to list, length: {len(embedding_list)}")

                # Store both text and embeddings
                insert_data = {
                    "id": doc_id,
                    "content": extracted_text,
                    "embedding": embedding_list,
                    "metadata": json.dumps(metadata),
                }

                print(f"Inserting data into zokuai_documents table...")
                result = supabase.table("zokuai_documents").insert(insert_data).execute()

                print(f"✓ Successfully stored in database")
                print(f"Database result: {result}")

            except Exception as storage_error:
                error_msg = f"Failed to store in database: {str(storage_error)}"
                print(f"ERROR: {error_msg}")
                import traceback
                traceback.print_exc()
                return {"status": "error", "message": error_msg}
        else:
            print("Skipping database storage as requested")

        print(f"=== DOCUMENT PROCESSING SUCCESS ===")
        logger.info(f"Successfully processed document {doc_id}")
        return {
            "status": "success",
            "document_id": doc_id,
            "extracted_text": extracted_text,
            "text_length": len(extracted_text),
            "embedding_length": len(embedding_list) if not skip_storage else 0,
            "metadata": metadata
        }

    except Exception as e:
        error_msg = f"Error processing document: {str(e)}"
        print(f"=== DOCUMENT PROCESSING FAILED ===")
        print(f"ERROR: {error_msg}")
        import traceback
        traceback.print_exc()
        logger.error(error_msg)
        return {"status": "error", "message": error_msg}
