# endpoints.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from app.services.file_management import save_upload_file
from app.services.vision_extraction import extract_invoice_fields_with_ai
from typing import List
import os

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = await save_upload_file(file)
        return {"status": "success", "file_path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while uploading the file: {str(e)}")

@router.post("/invoices/{invoice_id}/extract-ai")
async def extract_invoice_with_ai(invoice_id: str, request: Request):
    try:
        print(f"🔍 Extracting invoice {invoice_id}")

        body = await request.json()
        print(f"🧾 Fields from frontend: {body}")

        # Build a dummy file path (this needs to match your actual file storage logic)
        # 🔧 Construct correct file path using invoice_id
        base_dir = os.path.dirname(os.path.abspath(__file__))  # e.g., /backend/app/api
        root_dir = os.path.abspath(os.path.join(base_dir, "..", ".."))  # back to /backend
        file_path = os.path.join(root_dir, "uploaded_files", f"{invoice_id}.pdf")

        # Mock result (replace with your actual function)
        result =  extract_invoice_fields_with_ai()

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        print(f"❌ AI extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")
