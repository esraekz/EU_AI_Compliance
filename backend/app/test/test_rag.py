import asyncio
import os
import json
import logging
from app.services.e_document_processor import process_document
from app.services.e_qa_system import answer_question
from app.db.supabase_client import supabase

async def test_rag_functionality():
    print("Starting RAG functionality test...")

    # Path to your test PNG file
    test_png_path = "uploaded_files/Rechnung.png"
    print(f"Test file: {test_png_path}")
    print(f"File exists: {os.path.exists(test_png_path)}")

    # Check if we've stored this document before
    cache_file = "document_cache.json"
    document_id = None

    try:
        if os.path.exists(cache_file):
            with open(cache_file, 'r') as f:
                cache = json.load(f)
                if test_png_path in cache:
                    document_id = cache[test_png_path]
                    print(f"Using existing document with ID: {document_id}")
    except Exception as e:
        print(f"Error reading cache: {str(e)}")

    # Process the document only if we don't have an ID yet
    if not document_id:
        print("Processing document...")
        try:
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

            # Save the ID for future runs
            try:
                cache = {}
                if os.path.exists(cache_file):
                    with open(cache_file, 'r') as f:
                        cache = json.load(f)

                cache[test_png_path] = document_id

                with open(cache_file, 'w') as f:
                    json.dump(cache, f)
                    print(f"Saved document ID to cache: {cache_file}")
            except Exception as e:
                print(f"Error saving cache: {str(e)}")
        except Exception as e:
            print(f"Error during document processing: {str(e)}")
            return

    # Ask a question about the document
    print("\nAsking question about the document...")
    test_question = "What is the total of tax?"

    try:
        answer_result = await answer_question(
            query=test_question,
            user_id="test-user-123",
            document_ids=[document_id]
        )

        doc_result = supabase.table("zokuai_documents").select("content").eq("id", document_id).execute()
        print(f"Document content: {doc_result.data[0]['content']}")

        print(f"\nQuestion: {test_question}")
        print(f"Answer: {answer_result['answer']}")
        print(f"Sources: {answer_result['sources']}")
    except Exception as e:
        print(f"Error during question answering: {str(e)}")

# Make sure this part is at the end of your script and properly indented
if __name__ == "__main__":
    print("Executing test_rag_functionality...")
    asyncio.run(test_rag_functionality())
    print("Test completed.")
