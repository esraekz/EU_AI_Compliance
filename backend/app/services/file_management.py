import os
from datetime import datetime
from fastapi import UploadFile

UPLOAD_DIR = "uploaded_files/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    """
    Save the uploaded file to the designated directory with a timestamp to prevent overwriting.
    Returns the file path where the file is saved.
    """
    # Generate a unique filename with a timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_extension = os.path.splitext(upload_file.filename)[1]
    safe_filename = f"{os.path.splitext(upload_file.filename)[0]}_{timestamp}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    # Save the file
    with open(file_path, "wb") as buffer:
        buffer.write(await upload_file.read())  # <-- Ensure this line is indented

    return file_path  # <-- Ensure this line is at the same indentation level as `with`
