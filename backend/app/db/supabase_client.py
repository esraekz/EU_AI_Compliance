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
    result = supabase.table("zokuai_invoices").insert(invoice_data).execute()
    return result.data[0] if result.data else None


async def get_invoice(invoice_id):
    """Get an invoice by ID"""
    result = supabase.table("zokuai_invoices").select("*").eq("id", invoice_id).execute()
    return result.data[0] if result.data else None


async def get_invoices(limit=10, offset=0, sort_by="upload_date", sort_dir="desc", search=None, user_id=None):
    """Get invoices with pagination, sorting and filtering"""
    query = supabase.table("zokuai_invoices").select("*", count="exact")

    # Filter by user_id if provided
    if user_id:
        query = query.eq("user_id", user_id)

    # Add search filter if provided
    if search:
        query = query.or_(f"filename.ilike.%{search}%,supplier.ilike.%{search}%")

    # Add sorting - using simple single parameter
    query = query.order(sort_by, desc=(sort_dir.lower() == "desc"))

    # Add pagination
    query = query.range(offset, offset + limit - 1)

    # Execute query
    result = query.execute()

    return {
        "data": result.data,
        "count": result.count
    }


async def update_invoice(invoice_id, invoice_data):
    """Update an invoice by ID"""
    try:
        # Filter out fields that don't exist in the database table
        allowed_fields = ["status", "supplier", "file_url", "storage_path"]
        filtered_data = {k: v for k, v in invoice_data.items() if k in allowed_fields}

        # Only attempt update if there are valid fields to update
        if filtered_data:
            result = supabase.table("zokuai_invoices").update(filtered_data).eq("id", invoice_id).execute()
            return result.data[0] if result.data else None
        else:
            # If no valid fields to update, just return the current invoice
            return await get_invoice(invoice_id)
    except Exception as e:
        print(f"Error updating invoice: {str(e)}")
        raise e


async def delete_invoice(invoice_id):
    """Delete an invoice record"""
    result = supabase.table("zokuai_invoices").delete().eq("id", invoice_id).execute()
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

# Prompt Optimizer Database Operations

async def create_prompt(prompt_data):
    """Create a new prompt record"""
    result = supabase.table("prompt_optimizer_prompts").insert(prompt_data).execute()
    return result.data[0] if result.data else None

async def get_prompt(prompt_id, user_id):
    """Get a prompt by ID for specific user"""
    result = supabase.table("prompt_optimizer_prompts")\
        .select("*")\
        .eq("id", prompt_id)\
        .eq("user_id", user_id)\
        .execute()
    return result.data[0] if result.data else None

async def get_user_prompts(user_id, limit=20, offset=0, search=None):
    """Get prompts for a user with pagination and search"""
    query = supabase.table("prompt_optimizer_prompts")\
        .select("*", count="exact")\
        .eq("user_id", user_id)

    # Add search filter if provided
    if search:
        query = query.or_(f"title.ilike.%{search}%,original_prompt.ilike.%{search}%")

    # Add sorting and pagination
    query = query.order("updated_at", desc=True)\
        .range(offset, offset + limit - 1)

    result = query.execute()
    return {
        "data": result.data,
        "count": result.count
    }

async def update_prompt(prompt_id, user_id, prompt_data):
    """Update a prompt by ID"""
    # Add updated_at timestamp
    prompt_data["updated_at"] = "now()"

    result = supabase.table("prompt_optimizer_prompts")\
        .update(prompt_data)\
        .eq("id", prompt_id)\
        .eq("user_id", user_id)\
        .execute()
    return result.data[0] if result.data else None

async def delete_prompt(prompt_id, user_id):
    """Delete a prompt by ID"""
    result = supabase.table("prompt_optimizer_prompts")\
        .delete()\
        .eq("id", prompt_id)\
        .eq("user_id", user_id)\
        .execute()
    return result.data[0] if result.data else None

# Optimization Results Operations
async def store_optimization_results(optimization_data):
    """Store optimization analysis results"""
    result = supabase.table("prompt_optimization_results").insert(optimization_data).execute()
    return result.data[0] if result.data else None

async def get_optimization_results(prompt_id):
    """Get all optimization results for a prompt"""
    result = supabase.table("prompt_optimization_results")\
        .select("*")\
        .eq("prompt_id", prompt_id)\
        .order("created_at", desc=True)\
        .execute()
    return result.data

# Version History Operations
async def create_prompt_version(version_data):
    """Create a new version of a prompt"""
    result = supabase.table("prompt_versions").insert(version_data).execute()
    return result.data[0] if result.data else None

async def get_prompt_versions(prompt_id):
    """Get version history for a prompt"""
    result = supabase.table("prompt_versions")\
        .select("*")\
        .eq("prompt_id", prompt_id)\
        .order("version_number", desc=True)\
        .execute()
    return result.data

# Template Operations (for future use)
async def get_prompt_templates(category=None, is_public=True):
    """Get prompt templates"""
    query = supabase.table("prompt_templates").select("*")

    if is_public:
        query = query.eq("is_public", True)

    if category:
        query = query.eq("category", category)

    result = query.order("usage_count", desc=True).execute()
    return result.data

async def create_prompt_template(template_data):
    """Create a new prompt template"""
    result = supabase.table("prompt_templates").insert(template_data).execute()
    return result.data[0] if result.data else None
