import asyncio
import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.getcwd(), "backend")))

from app.services.e_document_processor import extract_text_from_png, generate_embeddings, process_document

async def test_document_processing():
    # Search for the PNG file in the correct location
    print("Searching for demo-invoice.png...")

    base_dir = os.getcwd()  # This is your repository root
    for root, dirs, files in os.walk(base_dir):
        if 'demo-invoice.png' in files:
            png_path = os.path.join(root, 'demo-invoice.png')
            print(f"Found file at: {png_path}")
            break
    else:
        print("Could not find demo-invoice.png file.")
        return

    # Test text extraction
    print("\n--- Testing text extraction ---")
    extracted_text = extract_text_from_png(png_path)
    print(f"Extracted text preview: {extracted_text[:200]}...")
    print(f"Total characters extracted: {len(extracted_text)}")

    # Test embedding generation and document processing
    print("\n--- Testing full document processing ---")
    try:
        result = await process_document(
            png_path,
            user_id="test_user",
            document_type="invoice",
            skip_storage=False  # Skip storage for initial testing
        )

        print(f"Status: {result['status']}")

        if result['status'] == 'success':
            print(f"Document ID: {result['document_id']}")
            print("Metadata:", result['metadata'])
        else:
            print(f"Error: {result['message']}")
    except Exception as e:
        print(f"Error in document processing: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_document_processing())
