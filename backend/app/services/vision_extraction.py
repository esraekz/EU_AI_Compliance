# zoku/backend/app/services/vision_extraction.py

from typing import List, Optional
from app.schemas.invoice import ExtractionField
from app.config.settings import get_settings
from openai import OpenAI
import os
import json
import base64
import re

settings = get_settings()

# Set OpenAI API key
client = OpenAI(api_key=settings.openai_api_key)
UPLOAD_FOLDER = "uploaded_files"  # or wherever you save the invoices

def extract_invoice_fields_with_ai(file_path: Optional[str] = None) -> List[ExtractionField]:
    # Default to demo-invoice.png
    if file_path is None:
        # project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
        UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploaded_files")
        file_path = os.path.abspath(os.path.join(UPLOAD_DIR, "demo-invoice.png"))


        # file_path = os.path.join(project_root, "uploaded_files", "demo-invoice.png")

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"No file found at {file_path}")

    # Encode the image
    with open(file_path, "rb") as f:
        encoded_image = base64.b64encode(f.read()).decode("utf-8")

    image_url = f"data:image/png;base64,{encoded_image}"

    prompt = """
    You are an invoice parsing assistant. Extract the following fields from the image:
    - Supplier
    - Invoice Number
    - PO Number
    - Amount
    - Date

    Respond in this JSON format:

    [
      { "id": "1", "name": "Supplier", "value": "Acme Corp", "confidence": 0.98 },
      ...
    ]
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # or updated model name
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1024
        )

        content = response.choices[0].message.content
        print("🔎 Raw content from OpenAI:\n", content)

        # Strip markdown code block if present
        cleaned = re.sub(r"```(?:json)?\n(.+?)```", r"\1", content, flags=re.DOTALL).strip()

        parsed = json.loads(cleaned)

        return [ExtractionField(**field) for field in parsed]

    except Exception as e:
        raise RuntimeError(f"Vision API failed: {str(e)}")

def extract_invoice_fields_with_ai2(file_path: str) -> List[ExtractionField]:
    # This is a mock return. Replace this later with OpenAI Vision logic.
    return [
        ExtractionField(id="1", name="Supplier", value="Acme Corp", confidence=0.98),
        ExtractionField(id="2", name="Invoice Number", value="INV-2025-001", confidence=0.95),
        ExtractionField(id="3", name="PO Number", value="PO-12345", confidence=0.90),
        ExtractionField(id="4", name="Amount", value="4200€", confidence=0.92),
        ExtractionField(id="5", name="Date", value="2025-04-12", confidence=0.89),
    ]
