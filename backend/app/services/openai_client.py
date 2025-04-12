# zoku/backend/app/services/openai_client.py
import os
import base64
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Load API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found in environment variables")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)


def encode_image_to_base64(image_path: str) -> str:
    """Convert an image file to base64 encoding for OpenAI API"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


async def extract_invoice_data(
    image_path: str,
    fields: List[Dict[str, str]]
) -> List[Dict[str, Any]]:
    """
    Extract specified fields from an invoice image using OpenAI's Vision API

    Args:
        image_path: Path to the invoice image/PDF
        fields: List of field objects with 'id' and 'name' to extract

    Returns:
        List of extraction results with field id, name, value, and confidence
    """
    try:
        # Convert image to base64
        base64_image = encode_image_to_base64(image_path)

        # Create a prompt that instructs the model to extract specific fields
        field_names = [field["name"] for field in fields]
        prompt = f"""
        You are an AI assistant specializing in invoice data extraction.
        Analyze this invoice image and extract the following fields:
        {', '.join(field_names)}

        For each field, provide:
        1. The extracted value
        2. A confidence score between 0 and 1

        Format your response as a JSON object with the field names as keys,
        and each value being an object with 'value' and 'confidence' properties.
        """

        # Call the OpenAI Vision API
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000,
            response_format={"type": "json_object"}
        )

        # Parse the response
        extraction_result = json.loads(response.choices[0].message.content)

        # Map the results back to the original field structure
        result = []
        for field in fields:
            field_name = field["name"]
            if field_name in extraction_result:
                field_data = extraction_result[field_name]
                result.append({
                    "id": field["id"],
                    "name": field_name,
                    "value": field_data.get("value", ""),
                    "confidence": field_data.get("confidence", 0.0)
                })
            else:
                # Field wasn't found in the response
                result.append({
                    "id": field["id"],
                    "name": field_name,
                    "value": "",
                    "confidence": 0.0
                })

        return result

    except Exception as e:
        print(f"Error extracting invoice data: {str(e)}")
        # Return empty results with zero confidence on error
        return [
            {
                "id": field["id"],
                "name": field["name"],
                "value": "",
                "confidence": 0.0
            } for field in fields
        ]


async def create_document_embedding(text: str) -> List[float]:
    """
    Create an embedding vector for document text using OpenAI's embedding API

    Args:
        text: The document text to embed

    Returns:
        List of floats representing the embedding vector
    """
    try:
        response = client.embeddings.create(
            input=text,
            model="text-embedding-ada-002"
        )

        # Extract the embedding vector from the response
        embedding = response.data[0].embedding
        return embedding

    except Exception as e:
        print(f"Error creating document embedding: {str(e)}")
        raise
