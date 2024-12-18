import os
from fastapi import UploadFile
from datetime import datetime

UPLOAD_DIR = "uploaded_files/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    """
    Save the uploaded file to the designated directory with a timestamp to prevent overwriting.
    Returns the file path where the file is saved.
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_extension = os.path.splitext(upload_file.filename)[1]
    safe_filename = f"{os.path.splitext(upload_file.filename)[0]}_{timestamp}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:

