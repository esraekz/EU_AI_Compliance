# zoku/backend/app/services/text_extraction.py

import os
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image
import io

def extract_text_from_pdf(file_content):
    """Extract text from PDF file bytes using OCR"""
    try:
        # Convert PDF to images
        images = convert_from_bytes(file_content)

        # Extract text from each page
        text = ""
        for image in images:
            text += pytesseract.image_to_string(image)
            text += "\n\n"  # Add separator between pages

        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return ""

def extract_text_from_image(file_content):
    """Extract text from image bytes using OCR"""
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(file_content))

        # Extract text
        text = pytesseract.image_to_string(image)

        return text
    except Exception as e:
        print(f"Error extracting text from image: {str(e)}")
        return ""

def extract_text_from_file(file_content, file_extension):
    """Extract text from file based on extension"""
    file_extension = file_extension.lower()

    if file_extension == '.pdf':
        return extract_text_from_pdf(file_content)
    elif file_extension in ['.jpg', '.jpeg', '.png']:
        return extract_text_from_image(file_content)
    else:
        return ""

def get_file_extension(filename):
    """Get file extension from filename"""
    return os.path.splitext(filename)[1]
