# zoku/backend/app/services/e_file_conversion.py

import os
import logging
import fitz  # PyMuPDF
from ..db.supabase_client import update_invoice, upload_file_to_storage
from .e_document_processor import process_document

# Set up logging
logger = logging.getLogger(__name__)

# Constants
PROCESSED_FOLDER = "processed"
STORAGE_BUCKET = "zokuinvoices"  # Define it here instead of importing

async def convert_pdf_to_png(pdf_path, invoice_id, storage_path, user_id):
    """
    Convert a PDF file to PNG using PyMuPDF, upload PNG to storage, process for embeddings, and update the invoice status
    """
    try:
        print(f"=== CONVERSION START: invoice_id={invoice_id} ===")
        print(f"PDF path: {pdf_path}")
        print(f"Storage path: {storage_path}")
        print(f"User ID: {user_id}")

        # Check if PDF file exists
        if not os.path.exists(pdf_path):
            print(f"ERROR: PDF file does not exist at path: {pdf_path}")
            await update_invoice(invoice_id, {"status": "Error"})
            return None

        print(f"PDF file exists, size: {os.path.getsize(pdf_path)} bytes")

        # Create output directory
        local_output_dir = os.path.join(os.path.dirname(pdf_path), PROCESSED_FOLDER)
        os.makedirs(local_output_dir, exist_ok=True)
        print(f"Output directory created/verified: {local_output_dir}")

        # Set output path
        base_name = os.path.splitext(os.path.basename(storage_path))[0]
        local_png_path = os.path.join(local_output_dir, f"{base_name}.png")
        print(f"Output PNG path will be: {local_png_path}")

        # Convert PDF to PNG using PyMuPDF
        print("Starting PDF to PNG conversion with PyMuPDF...")
        try:
            # Open the PDF file
            doc = fitz.open(pdf_path)
            print(f"Opened PDF document with {len(doc)} pages")

            if len(doc) == 0:
                print("ERROR: PDF document has no pages")
                await update_invoice(invoice_id, {"status": "Error"})
                return None

            # Get the first page
            page = doc.load_page(0)
            print("Loaded first page successfully")

            # Render page to an image with higher resolution
            zoom_factor = 2.0  # Increase resolution
            mat = fitz.Matrix(zoom_factor, zoom_factor)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            print(f"Rendered page to pixmap, dimensions: {pix.width}x{pix.height}")

            # Save the image
            pix.save(local_png_path)
            print(f"Saved PNG to {local_png_path}")

            # Close the document
            doc.close()
            print("Closed PDF document")

        except Exception as conv_error:
            print(f"ERROR during PDF conversion: {str(conv_error)}")
            import traceback
            traceback.print_exc()
            await update_invoice(invoice_id, {"status": "Error"})
            return None

        # Verify PNG was created successfully
        if not os.path.exists(local_png_path):
            print(f"ERROR: PNG file was not created at {local_png_path}")
            await update_invoice(invoice_id, {"status": "Error"})
            return None

        print(f"✓ PNG file created successfully, size: {os.path.getsize(local_png_path)} bytes")

        # Upload PNG to Supabase Storage
        print(f"Uploading PNG to Supabase Storage...")
        try:
            # Create PNG storage path (replace .pdf with .png)
            png_storage_path = storage_path.replace('.pdf', '.png')
            print(f"PNG storage path: {png_storage_path}")

            # Upload PNG to Supabase Storage
            with open(local_png_path, "rb") as f:
                await upload_file_to_storage(STORAGE_BUCKET, png_storage_path, f)

            print(f"✓ Successfully uploaded PNG to Supabase Storage: {png_storage_path}")

            # Update the invoice record with new PNG storage path
            await update_invoice(invoice_id, {
                "storage_path": png_storage_path,  # Update to point to PNG instead of PDF
                "status": "Converting"  # Mark as converting before document processing
            })
            print(f"✓ Updated invoice status to 'Converting'")

        except Exception as upload_error:
            print(f"ERROR uploading PNG to Supabase: {str(upload_error)}")
            import traceback
            traceback.print_exc()
            # Still continue with document processing since PNG exists locally
            print("Continuing with document processing despite upload error...")

        # Process the document for Q&A system - THIS IS THE CRITICAL PART
        print(f"=== STARTING DOCUMENT PROCESSING ===")
        print(f"Processing document for Q&A system: {local_png_path}")
        print(f"Invoice ID: {invoice_id}")
        print(f"User ID: {user_id}")

        try:
            processing_result = await process_document(
                png_path=local_png_path,
                user_id=user_id,
                document_type="invoice",
                skip_storage=False,
                invoice_id=invoice_id  # Link back to invoice
            )

            print(f"=== DOCUMENT PROCESSING RESULT ===")
            print(f"Status: {processing_result.get('status')}")
            print(f"Message: {processing_result.get('message', 'No message')}")
            print(f"Document ID: {processing_result.get('document_id', 'No ID')}")

            if processing_result["status"] == "success":
                print(f"✓ Successfully processed document for Q&A: {processing_result['document_id']}")

                # Final status update - mark as fully processed
                await update_invoice(invoice_id, {"status": "Processed"})
                print(f"✓ Updated invoice status to 'Processed'")

            else:
                print(f"✗ Document processing failed: {processing_result['message']}")
                await update_invoice(invoice_id, {"status": "Error"})

        except Exception as proc_error:
            print(f"✗ ERROR during document processing: {str(proc_error)}")
            import traceback
            traceback.print_exc()
            await update_invoice(invoice_id, {"status": "Error"})

        # Clean up temp file
        try:
            os.unlink(pdf_path)
            print(f"✓ Cleaned up temp PDF file: {pdf_path}")
        except Exception as cleanup_error:
            print(f"Warning: Could not clean up temp file: {str(cleanup_error)}")

        print(f"=== CONVERSION COMPLETE: invoice_id={invoice_id} ===")
        return local_png_path

    except Exception as e:
        print(f"=== CONVERSION FAILED: invoice_id={invoice_id} ===")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

        await update_invoice(invoice_id, {"status": "Error"})

        # Clean up temp file
        try:
            os.unlink(pdf_path)
        except:
            pass
