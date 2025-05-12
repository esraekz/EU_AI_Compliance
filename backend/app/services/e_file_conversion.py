import os
import logging
import fitz  # PyMuPDF
from ..db.supabase_client import update_invoice

# Set up logging
logger = logging.getLogger(__name__)

# Constants
PROCESSED_FOLDER = "processed"

async def convert_pdf_to_png(pdf_path, invoice_id, storage_path, user_id):
    """
    Convert a PDF file to PNG using PyMuPDF, and update the invoice status
    """
    try:
        print(f"=== CONVERSION START: invoice_id={invoice_id} ===")
        print(f"PDF path: {pdf_path}")
        print(f"Storage path: {storage_path}")
        print(f"User ID: {user_id}")

        # Check if PDF file exists
        if not os.path.exists(pdf_path):
            print(f"ERROR: PDF file does not exist at path: {pdf_path}")
            await update_invoice(invoice_id, {"status": "Error", "error_message": "PDF file not found"})
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
                await update_invoice(invoice_id, {"status": "Error", "error_message": "PDF document has no pages"})
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
            await update_invoice(invoice_id, {"status": "Error", "error_message": f"PDF conversion error: {str(conv_error)}"})
            return None

        # Update invoice status
        print(f"Updating invoice {invoice_id} status to 'Processed'")
        await update_invoice(invoice_id, {
            "status": "Processed",

        })
        print(f"=== CONVERSION COMPLETE: invoice_id={invoice_id} ===")

        return local_png_path

    except Exception as e:
        print(f"=== CONVERSION FAILED: invoice_id={invoice_id} ===")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()


        await update_invoice(invoice_id, {
            "status": "Error"
            # Remove error_message since it doesn't exist in your table
        })
