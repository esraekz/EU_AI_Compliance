import os
import shutil
import tempfile
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Path, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
import uuid
from datetime import datetime
import xml.dom.minidom
import json
from pydantic import parse_obj_as

from ..models.invoice import (
    Invoice,
    InvoiceCreate,
    InvoiceResponse,
    InvoicesResponse,
    ExtractionField,
    ExtractionFieldRequest,
    ExtractionRequest,
    ExtractionResponse,
    ExportRequest
)
from ..db.supabase_client import (
    create_invoice,
    get_invoice,
    get_invoices,
    update_invoice,
    delete_invoice,
    get_file_url,
    upload_file_to_storage,
    delete_file_from_storage,
    supabase,  # Import supabase client
)
from ..services.openai_client import extract_invoice_data, create_document_embedding
from ..auth.auth_handler import get_current_user
# Import the new function for PDF to PNG conversion
from ..services.e_file_conversion import convert_pdf_to_png

router = APIRouter(
    prefix="/invoices",
    tags=["invoices"]
)

# Constants
STORAGE_BUCKET = "zokuinvoices"
ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}


def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@router.post("", response_model=InvoiceResponse)
async def upload_invoice(
    background_tasks: BackgroundTasks,  # Move this to the front
    file: UploadFile = File(...),
    user=None
):

    if user is None:
        user = {"id": "test-user-esra"}

    """
    Upload a new invoice file
    """
    try:
        if not file:
            return InvoiceResponse(success=False, message="No file provided")

        # Check file type
        if not allowed_file(file.filename):
            return InvoiceResponse(
                success=False,
                message=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        storage_path = f"{user['id']}/{file_id}{file_ext}"

        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        # Upload to Supabase Storage
        with open(temp_file_path, "rb") as f:
            await upload_file_to_storage(STORAGE_BUCKET, storage_path, f)
        # Get public URL
        file_url = get_file_url(STORAGE_BUCKET, storage_path)

        # Create invoice record
        invoice_data = {
            "id": file_id,
            "filename": file.filename,
            "upload_date": datetime.now().isoformat(),
            "supplier": None,  # Will be populated after extraction
            "status": "Uploaded",  # Changed from "Pending" to "Uploaded"
            "file_url": file_url,
            "user_id": user['id'],
            "storage_path": storage_path
        }

        # Store in database
        invoice = await create_invoice(invoice_data)

        if not invoice:
            # Clean up temp file
            os.unlink(temp_file_path)
            raise HTTPException(status_code=500, detail="Failed to create invoice record")

        # If it's a PDF file, add the conversion task
        if file_ext.lower() == '.pdf':
            # Add the background task for PDF to PNG conversion
            background_tasks.add_task(
                convert_pdf_to_png,
                temp_file_path,
                file_id,
                storage_path,
                user['id']
            )
        else:
            # For non-PDF files (like PNGs), mark as processed right away
            await update_invoice(file_id, {"status": "Processed"})
            # Clean up temp file
            os.unlink(temp_file_path)

        return InvoiceResponse(
            success=True,
            data=parse_obj_as(Invoice, invoice)
        )

    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        return InvoiceResponse(success=False, message=f"Error uploading invoice: {str(e)}")


@router.get("", response_model=InvoicesResponse)
async def list_invoices(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("upload_date"),
    sort_dir: str = Query("desc"),
    search: Optional[str] = Query(None),
    user=None
):

    if user is None:
        user = {"id": "test-user-esra"}
    """
    Get a list of invoices with pagination and filtering
    """
    try:
        # Calculate offset from page and limit
        offset = (page - 1) * limit

        # Get invoices from database
        result = await get_invoices(
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_dir=sort_dir,
            search=search,
            user_id=user['id']
        )

        invoices = result["data"]
        total = result["count"]

        # Convert to model
        invoice_models = [parse_obj_as(Invoice, invoice) for invoice in invoices]

        return InvoicesResponse(
            success=True,
            data={
                "invoices": invoice_models,
                "total": total,
                "page": page,
                "limit": limit
            }
        )

    except Exception as e:
        return InvoicesResponse(success=False, message=f"Error fetching invoices: {str(e)}")

@router.get("/test-pdf2image")
async def test_pdf2image():
    """Test that pdf2image is working properly"""
    try:
        # Create a simple test PDF
        import tempfile
        from reportlab.pdfgen import canvas

        # Create a test PDF
        pdf_path = tempfile.mktemp(suffix=".pdf")
        c = canvas.Canvas(pdf_path)
        c.drawString(100, 100, "Test PDF")
        c.save()

        print(f"Created test PDF at {pdf_path}")

        # Try to convert it
        print("Attempting to convert PDF to image...")
        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path)

        print(f"Successfully converted PDF to {len(images)} images")

        # Try to save the image
        png_path = tempfile.mktemp(suffix=".png")
        images[0].save(png_path, format="PNG")

        print(f"Successfully saved PNG to {png_path}")

        # Clean up
        import os
        os.unlink(pdf_path)
        os.unlink(png_path)

        return {"success": True, "message": "PDF2Image is working correctly"}

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return {
            "success": False,
            "message": f"PDF2Image test failed: {str(e)}",
            "details": error_details
        }

# Also add the Poppler check endpoint
@router.get("/check-poppler")
async def check_poppler():
    """Check if poppler is installed and accessible"""
    import subprocess
    import shutil

    results = {}

    # Check if pdftoppm is in PATH
    pdftoppm_path = shutil.which("pdftoppm")
    results["pdftoppm_in_path"] = pdftoppm_path is not None
    results["pdftoppm_path"] = pdftoppm_path

    # Try running pdftoppm -v
    try:
        process = subprocess.run(["pdftoppm", "-v"], capture_output=True, text=True)
        results["pdftoppm_version"] = process.stderr.strip()
        results["pdftoppm_available"] = True
    except Exception as e:
        results["pdftoppm_available"] = False
        results["pdftoppm_error"] = str(e)

    return results


@router.get("/check-schema")
async def check_schema():
    """Check the database schema"""
    try:
        # Try to get information about the table structure
        result = supabase.table("zokuai_invoices").select("*").limit(1).execute()

        # Get a sample record
        sample = result.data[0] if result.data else {}

        # Extract column names
        columns = list(sample.keys()) if sample else []

        return {
            "table_name": "zokuai_invoices",
            "columns": columns,
            "sample_record": sample
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice_by_id(
    invoice_id: str = Path(...),
    user=None
):

    if user is None:
        user = {"id": "test-user-esra"}
    """
    Get an invoice by ID
    """
    try:
        invoice = await get_invoice(invoice_id)

        if not invoice:
            return InvoiceResponse(success=False, message="Invoice not found")

        # Check if user has access to this invoice
        if invoice["user_id"] != user['id']:
            return InvoiceResponse(success=False, message="Access denied")

        return InvoiceResponse(
            success=True,
            data=parse_obj_as(Invoice, invoice)
        )

    except Exception as e:
        return InvoiceResponse(success=False, message=f"Error fetching invoice: {str(e)}")


@router.post("/{invoice_id}/extract", response_model=ExtractionResponse)
async def extract_data(
    invoice_id: str,
    extraction_request: ExtractionRequest,
    user=None
):

    if user is None:
        user = {"id": "test-user-esra"}
    """
    Extract data from an invoice using OpenAI Vision API
    """
    try:
        # Get invoice from database
        invoice = await get_invoice(invoice_id)

        if not invoice:
            return ExtractionResponse(success=False, message="Invoice not found")

        # Check if user has access to this invoice
        if invoice["user_id"] != user['id']:
            return ExtractionResponse(success=False, message="Access denied")

        # Download the file from Supabase Storage to process it
        storage_path = invoice["storage_path"]

        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            # Download file to temp location - using supabase directly
            file_data = supabase.storage.from_(STORAGE_BUCKET).download(storage_path)
            temp_file.write(file_data)
            temp_file_path = temp_file.name

        # Process the invoice with OpenAI Vision API
        extraction_results = await extract_invoice_data(
            temp_file_path,
            [field.dict() for field in extraction_request.fields]
        )

        # Clean up temp file
        os.unlink(temp_file_path)

        # If extraction found a supplier, update the invoice record
        for field in extraction_results:
            if field["name"] == "Supplier" and field["value"] and field["confidence"] > 0.7:
                await update_invoice(invoice_id, {"supplier": field["value"], "status": "Processed"})
                break

        return ExtractionResponse(
            success=True,
            data=parse_obj_as(List[ExtractionField], extraction_results)
        )

    except Exception as e:
        return ExtractionResponse(success=False, message=f"Error extracting data: {str(e)}")


@router.post("/{invoice_id}/export/json")
async def export_json(
    invoice_id: str,
    export_request: ExportRequest,
    user=None
):

    if user is None:
        user = {"id": "test-user-esra"}
    """
    Export extracted data as JSON
    """
    try:
        # Get invoice from database
        invoice = await get_invoice(invoice_id)

        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        # Check if user has access to this invoice
        if invoice["user_id"] != user['id']:
            raise HTTPException(status_code=403, detail="Access denied")

        # Create export data
        export_data = {
            "invoiceId": invoice_id,
            "exportDate": datetime.now().isoformat(),
            "data": {}
        }

        # Structure the data by field name
        for field in export_request.fields:
            export_data["data"][field.name] = {
                "value": field.value,
                "confidence": field.confidence
            }

        # Create temp file
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as temp_file:
            json.dump(export_data, temp_file, indent=2)
            temp_file_path = temp_file.name

        # Return file as attachment
        response = FileResponse(
            temp_file_path,
            media_type="application/json",
            filename=f"invoice-{invoice_id}-data.json"
        )

        # Set callback to remove the temp file after response is sent
        response.background = lambda: os.unlink(temp_file_path)

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")


@router.post("/{invoice_id}/export/xml")
async def export_xml(
    invoice_id: str,
    export_request: ExportRequest,
    user=None
):

    if user is None:
        user = {"id": "test-user-esra"}
    """
    Export extracted data as XML
    """
    try:
        # Get invoice from database
        invoice = await get_invoice(invoice_id)

        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        # Check if user has access to this invoice
        if invoice["user_id"] != user['id']:
            raise HTTPException(status_code=403, detail="Access denied")

        # Create XML document
        doc = xml.dom.minidom.getDOMImplementation().createDocument(None, "InvoiceData", None)
        root = doc.documentElement

        # Add metadata
        metadata = doc.createElement("MetaData")

        invoice_id_elem = doc.createElement("InvoiceId")
        invoice_id_elem.appendChild(doc.createTextNode(invoice_id))
        metadata.appendChild(invoice_id_elem)

        export_date = doc.createElement("ExportDate")
        export_date.appendChild(doc.createTextNode(datetime.now().isoformat()))
        metadata.appendChild(export_date)

        root.appendChild(metadata)

        # Add fields
        fields_elem = doc.createElement("Fields")

        for field in export_request.fields:
            field_elem = doc.createElement("Field")
            field_elem.setAttribute("name", field.name)

            value_elem = doc.createElement("Value")
            value_elem.appendChild(doc.createTextNode(field.value))
            field_elem.appendChild(value_elem)

            confidence_elem = doc.createElement("Confidence")
            confidence_elem.appendChild(doc.createTextNode(str(field.confidence)))
            field_elem.appendChild(confidence_elem)

            fields_elem.appendChild(field_elem)

        root.appendChild(fields_elem)

        # Create temp file
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".xml") as temp_file:
            temp_file.write(doc.toprettyxml(indent="  "))
            temp_file_path = temp_file.name

        # Return file as attachment
        response = FileResponse(
            temp_file_path,
            media_type="application/xml",
            filename=f"invoice-{invoice_id}-data.xml"
        )

        # Set callback to remove the temp file after response is sent
        response.background = lambda: os.unlink(temp_file_path)

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")

# In your invoice.py or a similar file
@router.get("/{invoice_id}/extracted-text")
async def get_extracted_text(invoice_id: str, user=None):
    """Get the extracted text from a processed invoice"""
    try:
        # For testing with dummy user
        if user is None:
            user = {"id": "test-user-esra"}

        # Get the invoice
        invoice = await get_invoice(invoice_id)
        if not invoice:
            return {"success": False, "message": "Invoice not found"}

        # Get the processed PNG path
        pdf_path = None
        if invoice.get("file_url"):
            # Extract the path from the URL or storage_path
            storage_path = invoice.get("storage_path")
            if storage_path:
                # You might need to adjust this path construction
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                uploaded_dir = os.path.join(base_dir, "uploaded_files")
                pdf_path = os.path.join(uploaded_dir, storage_path)

                # If that doesn't exist, try temp location
                if not os.path.exists(pdf_path):
                    # This is a guess at where your temp files might be
                    temp_dir = tempfile.gettempdir()
                    file_name = os.path.basename(storage_path)
                    pdf_path = os.path.join(temp_dir, file_name)

        if not pdf_path or not os.path.exists(pdf_path):
            # Try to find the processed PNG
            base_name = os.path.splitext(os.path.basename(storage_path))[0]
            temp_dir = tempfile.gettempdir()
            processed_dir = os.path.join(temp_dir, "processed")
            png_path = os.path.join(processed_dir, f"{base_name}.png")

            if os.path.exists(png_path):
                # Use the PNG instead
                pdf_path = png_path

        if not pdf_path or not os.path.exists(pdf_path):
            return {
                "success": False,
                "message": "File not found",
                "tried_paths": [pdf_path, png_path if 'png_path' in locals() else None]
            }

        # Extract text from PDF or PNG
        from PIL import Image
        import pytesseract
        import fitz  # PyMuPDF

        extracted_text = ""

        # If it's a PDF
        if pdf_path.lower().endswith('.pdf'):
            try:
                doc = fitz.open(pdf_path)
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    extracted_text += page.get_text()
                doc.close()
            except Exception as pdf_err:
                return {"success": False, "message": f"PDF extraction error: {str(pdf_err)}"}

        # If it's an image
        elif pdf_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            try:
                img = Image.open(pdf_path)
                extracted_text = pytesseract.image_to_string(img)
            except Exception as img_err:
                return {"success": False, "message": f"Image extraction error: {str(img_err)}"}

        # Return the extracted text
        return {
            "success": True,
            "extracted_text": extracted_text,
            "text_length": len(extracted_text),
            "file_path": pdf_path
        }

    except Exception as e:
        import traceback
        return {
            "success": False,
            "message": f"Error: {str(e)}",
            "traceback": traceback.format_exc()
        }


@router.delete("/{invoice_id}", response_model=InvoiceResponse)
async def delete_invoice_by_id(
    invoice_id: str = Path(...),
    user=None
):

    if user is None:
        user = {"id": "test-user-esra"}
    """
    Delete an invoice by ID
    """
    try:
        # Get invoice from database
        invoice = await get_invoice(invoice_id)

        if not invoice:
            return InvoiceResponse(success=False, message="Invoice not found")

        # Check if user has access to this invoice
        if invoice["user_id"] != user['id']:
            return InvoiceResponse(success=False, message="Access denied")

        # Delete file from storage
        storage_path = invoice["storage_path"]
        await delete_file_from_storage(STORAGE_BUCKET, storage_path)

        # Delete from database
        await delete_invoice(invoice_id)

        return InvoiceResponse(
            success=True,
            message="Invoice deleted successfully"
        )

    except Exception as e:
        return InvoiceResponse(success=False, message=f"Error deleting invoice: {str(e)}")
