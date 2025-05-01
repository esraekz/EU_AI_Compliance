import asyncio
import os
from app.services.e_document_processor import process_document
from app.services.e_qa_system import answer_question

async def test_rag_functionality():
    # Path to your test PNG file
    test_png_path = "uploaded_files/demo_invoice.png"

    # 1. Process the document manually
    print("Processing document...")
    process_result = await process_document(
        png_path=test_png_path,
        user_id="test-user-123",
        document_type="invoice"
    )

    if process_result["status"] != "success":
        print(f"Error processing document: {process_result['message']}")
        return

    document_id = process_result["document_id"]
    print(f"Document processed successfully with ID: {document_id}")

    # 2. Ask a question about the document
    print("\nAsking question about the document...")
    test_question = "What is the total amount on this invoice?"

    answer_result = await answer_question(
        query=test_question,
        user_id="test-user-123"
    )

    print(f"\nQuestion: {test_question}")
    print(f"Answer: {answer_result['answer']}")
    print(f"Sources: {answer_result['sources']}")

if __name__ == "__main__":
    asyncio.run(test_rag_functionality())
