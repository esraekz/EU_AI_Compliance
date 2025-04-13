# app/test/e_test_extraction.py
import os
import sys

# Add the parent directory to the path so we can import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.services.e_text_extraction import extract_text_from_file, get_file_extension

def test_extraction():
    # Path to a sample invoice file in your uploaded_files folder
    test_file_path = "uploaded_files/demo-invoice.png"  # or use any PDF file you have

    if not os.path.exists(test_file_path):
        print(f"Test file not found: {test_file_path}")
        return

    # Read the file
    with open(test_file_path, "rb") as f:
        file_content = f.read()

    # Get file extension
    file_extension = get_file_extension(test_file_path)

    # Extract text
    print(f"Extracting text from {test_file_path}...")
    extracted_text = extract_text_from_file(file_content, file_extension)

    # Print the result
    print("\nExtracted Text:")
    print("-" * 50)
    print(extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text)
    print("-" * 50)
    print(f"Total characters extracted: {len(extracted_text)}")

if __name__ == "__main__":
    test_extraction()
