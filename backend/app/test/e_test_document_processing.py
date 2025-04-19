import asyncio
import os
import sys

# Add the parent directory to the Python path to find modules
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.insert(0, parent_dir)

from app.services.e_document_processor import extract_text_from_png, generate_embeddings, process_document

async def test_document_processing():
    # Path based on your directory structure
    png_path = os.path.join(parent_dir, "backend", "uploaded_files", "demo-invoice.png")

    print(f"Looking for image at: {png_path}")

    if not os.path.exists(png_path):
        print(f"Error: File not found at {png_path}")
        print(f"Current directory: {os.getcwd()}")
        print(f"Let's try finding the file...")

        # Try to find the correct path
        backend_dir = os.path.join(parent_dir, "backend")
        if os.path.exists(backend_dir):
            print(f"Backend directory exists at: {backend_dir}")
            for root, dirs, files in os.walk(backend_dir):
                if "demo-invoice.png" in files:
                    print(f"Found the file at: {os.path.join(root, 'demo-invoice.png')}")
                    png_path = os.path.join(root, "demo-invoice.png")
                    break
        else:
            print(f"Backend directory not found at {backend_dir}")

        if not os.path.exists(png_path):
            return

    # Test text extraction
    print("\n--- Testing text extraction ---")
    extracted_text = extract_text_from_png(png_path)
    print(f"Extracted text preview: {extracted_text[:200]}...")
    print(f"Total characters extracted: {len(extracted_text)}")

    # Test embedding generation
    print("\n--- Testing embedding generation ---")
    try:
        embeddings = await generate_embeddings(extracted_text)
        print(f"Generated embeddings with shape: {embeddings.shape if hasattr(embeddings, 'shape') else len(embeddings)}")
    except Exception as e:
        print(f"Error generating embeddings: {str(e)}")

    # Test full document processing
    print("\n--- Testing full document processing ---")
    try:
        result = await process_document(
            png_path,
            user_id="test_user",
            document_type="invoice",
            skip_storage=True  # Skip storage for initial testing
        )

        print(f"Status: {result['status']}")

        if result['status'] == 'success':
            print(f"Document ID: {result['document_id']}")
            print(f"Metadata: {result['metadata']}")
        else:
            print(f"Error: {result['message']}")
    except Exception as e:
        print(f"Error in document processing: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_document_processing())

