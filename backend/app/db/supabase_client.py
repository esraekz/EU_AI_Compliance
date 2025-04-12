# zoku/backend/app/db/supabase_client.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Load Supabase credentials from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in environment variables")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# Helper functions for invoice table operations
async def create_invoice(invoice_data):
    """Create a new invoice record in Supabase"""
    result = supabase.table("invoices").insert(invoice_data).execute()
    return result.data[0] if result.data else None


async def get_invoice(invoice_id):
    """Get an invoice by ID"""
    result = supabase.table("invoices").select("*").eq("id", invoice_id).execute()
    return result.data[0] if result.data else None


async def get_invoices(limit=10, offset=0, sort_by="upload_date", sort_dir="desc", search=None, user_id=None):
    """Get invoices with pagination, sorting and filtering"""
    query = supabase.table("invoices").select("*", count="exact")

    # Filter by user_id if provided
    if user_id:
        query = query.eq("user_id", user_id)

    # Add search filter if provided
    if search:
        query = query.or_(f"filename.ilike.%{search}%,supplier.ilike.%{search}%")

    # Add sorting
    sort_order = "desc" if sort_dir.lower() == "desc" else "asc"
    query = query.order(sort_by, sort_order)

    # Add pagination
    query = query.range(offset, offset + limit - 1)

    # Execute query
    result = query.execute()

    return {
        "data": result.data,
        "count": result.count
    }


async def update_invoice(invoice_id, invoice_data):
    """Update an invoice record"""
    result = supabase.table("invoices").update(invoice_data).eq("id", invoice_id).execute()
    return result.data[0] if result.data else None


async def delete_invoice(invoice_id):
    """Delete an invoice record"""
    result = supabase.table("invoices").delete().eq("id", invoice_id).execute()
    return result.data[0] if result.data else None


# Functions for working with Supabase Storage
def get_file_url(bucket_name, file_path):
    """Get a public URL for a file in Supabase Storage"""
    return supabase.storage.from_(bucket_name).get_public_url(file_path)


async def upload_file_to_storage(bucket_name, file_path, file_content):
    """Upload a file to Supabase Storage"""
    result = supabase.storage.from_(bucket_name).upload(file_path, file_content)
    return result


async def delete_file_from_storage(bucket_name, file_path):
    """Delete a file from Supabase Storage"""
    result = supabase.storage.from_(bucket_name).remove([file_path])
    return result


# Functions for vector embeddings
async def store_document_embedding(document_data):
    """Store document embedding in the documents table"""
    result = supabase.table("document_embeddings").insert(document_data).execute()
    return result.data[0] if result.data else None


async def search_document_embeddings(query_embedding, match_threshold=0.7, limit=5):
    """Search for similar document embeddings using vector similarity"""
    # Using Supabase's vector similarity search with pgvector
    # This requires that the embedding column is of type vector in the database
    result = supabase.rpc(
        "match_documents",  # A stored procedure in Supabase
        {
            "query_embedding": query_embedding,
            "match_threshold": match_threshold,
            "match_count": limit
        }
    ).execute()

    return result.data
