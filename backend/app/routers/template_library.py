# app/routers/template_library.py - ADAPTED for simplified database

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.db.supabase_client import supabase
import uuid

router = APIRouter(
    prefix="/template-library",
    tags=["template-library"]
)

# Test user - same as your other endpoints
TEST_USER = {"id": "test-user-esra"}

# Pydantic Models (same as before)
class TemplateCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: str
    category: str = "general"
    tags: Optional[List[str]] = []
    is_public: bool = False
    is_featured: bool = False

class TemplateUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None
    is_featured: Optional[bool] = None

# SIMPLIFIED BACKEND FUNCTIONS (adapted for simple database)

async def create_template_simple(template_data):
    """Create a new template - adapted for your column names"""
    db_data = {
        "name": template_data.get("title"),
        "template_text": template_data.get("content"),
        "description": template_data.get("description"),
        "category": template_data.get("category", "general"),
        "tags": template_data.get("tags", []),
        "created_by": template_data.get("creator_id"),
        "creator_name": template_data.get("creator_name"),
        "is_public": template_data.get("is_public", False),
        "is_featured": template_data.get("is_featured", False),
        "usage_count": 0,
        "rating": 0.0,
        "review_count": 0,
        "version": "1.0"
    }

    result = supabase.table("prompt_templates").insert(db_data).execute()
    if result.data:
        template = result.data[0]
        # Map column names for frontend
        template["title"] = template.get("name")
        template["content"] = template.get("template_text")
        template["creator_id"] = template.get("created_by")
        return template
    return None

async def get_template_simple(template_id, user_id=None):
    """Get a template by ID - simplified"""
    query = supabase.table("prompt_templates").select("*")

    if user_id:
        query = query.or_(f"is_public.eq.true,created_by.eq.{user_id}")
    else:
        query = query.eq("is_public", True)

    result = query.eq("id", template_id).execute()

    if result.data:
        template = result.data[0]
        # Map column names for frontend
        template["title"] = template.get("name")
        template["content"] = template.get("template_text")
        template["creator_id"] = template.get("created_by")
        return template
    return None

async def get_templates_simple(
    limit=20,
    offset=0,
    category=None,
    search=None,
    sort_by="popular",
    is_featured=None,
    user_id=None
):
    """Get templates with filtering - simplified"""
    query = supabase.table("prompt_templates").select("*", count="exact")

    # Filter by public or user's own templates
    if user_id:
        query = query.or_(f"is_public.eq.true,created_by.eq.{user_id}")
    else:
        query = query.eq("is_public", True)

    # Category filter
    if category and category != "All":
        query = query.eq("category", category)

    # Featured filter
    if is_featured is not None:
        query = query.eq("is_featured", is_featured)

    # Search filter
    if search:
        query = query.or_(
            f"name.ilike.%{search}%,"
            f"description.ilike.%{search}%,"
            f"template_text.ilike.%{search}%"
        )

    # Sorting
    sort_mapping = {
        "popular": ("usage_count", True),
        "recent": ("created_at", True),
        "rating": ("rating", True),
        "alphabetical": ("name", False)
    }

    sort_column, desc = sort_mapping.get(sort_by, ("usage_count", True))
    query = query.order(sort_column, desc=desc)

    # Pagination
    query = query.range(offset, offset + limit - 1)

    result = query.execute()

    # Map column names for all templates
    templates = []
    for template in result.data:
        mapped_template = {
            **template,
            "title": template.get("name"),
            "content": template.get("template_text"),
            "creator_id": template.get("created_by")
        }
        templates.append(mapped_template)

    return {
        "data": templates,
        "count": result.count
    }

async def update_template_simple(template_id, template_data, user_id):
    """Update a template - simplified"""
    # Map to your column names
    db_data = {}
    if "title" in template_data:
        db_data["name"] = template_data["title"]
    if "content" in template_data:
        db_data["template_text"] = template_data["content"]
    if "description" in template_data:
        db_data["description"] = template_data["description"]
    if "category" in template_data:
        db_data["category"] = template_data["category"]
    if "tags" in template_data:
        db_data["tags"] = template_data["tags"]
    if "is_public" in template_data:
        db_data["is_public"] = template_data["is_public"]
    if "is_featured" in template_data:
        db_data["is_featured"] = template_data["is_featured"]

    result = supabase.table("prompt_templates")\
        .update(db_data)\
        .eq("id", template_id)\
        .eq("created_by", user_id)\
        .execute()

    if result.data:
        template = result.data[0]
        template["title"] = template.get("name")
        template["content"] = template.get("template_text")
        template["creator_id"] = template.get("created_by")
        return template
    return None

async def log_template_usage_simple(template_id, user_id):
    """Log template usage - simplified"""
    usage_data = {
        "template_id": template_id,
        "user_id": user_id
    }
    supabase.table("prompt_template_usage").insert(usage_data).execute()

    # Manually update usage count since we don't have auto-triggers
    current_count = supabase.table("prompt_template_usage")\
        .select("id", count="exact")\
        .eq("template_id", template_id)\
        .execute()

    supabase.table("prompt_templates")\
        .update({"usage_count": current_count.count})\
        .eq("id", template_id)\
        .execute()

async def get_categories_simple():
    """Get categories - simplified"""
    result = supabase.table("prompt_categories").select("*").execute()
    return result.data

# API ENDPOINTS (adapted to use simplified functions)

@router.post("/templates", response_model=Dict[str, Any])
async def create_new_template(template_data: TemplateCreate):
    """Create a new template"""
    try:
        user = TEST_USER

        # Prepare data
        data = {
            "title": template_data.title,
            "content": template_data.content,
            "description": template_data.description,
            "category": template_data.category,
            "tags": template_data.tags or [],
            "creator_id": user["id"],
            "creator_name": user.get("email", "Test User"),
            "is_public": template_data.is_public,
            "is_featured": template_data.is_featured
        }

        result = await create_template_simple(data)

        if not result:
            raise HTTPException(status_code=500, detail="Failed to create template")

        return {
            "success": True,
            "data": result,
            "message": "Template created successfully"
        }

    except Exception as e:
        print(f"Error creating template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating template: {str(e)}")

@router.get("/templates", response_model=Dict[str, Any])
async def get_template_library(
    limit: int = 20,
    offset: int = 0,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "popular",
    is_featured: Optional[bool] = None
):
    """Get templates with filtering and pagination"""
    try:
        user = TEST_USER

        result = await get_templates_simple(
            limit=limit,
            offset=offset,
            category=category,
            search=search,
            sort_by=sort_by,
            is_featured=is_featured,
            user_id=user["id"]
        )

        return {
            "success": True,
            "data": result["data"],
            "total": result["count"],
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        print(f"Error fetching templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching templates: {str(e)}")

@router.get("/templates/featured", response_model=Dict[str, Any])
async def get_featured_templates(limit: int = 8):
    """Get featured templates"""
    try:
        user = TEST_USER

        result = await get_templates_simple(
            limit=limit,
            offset=0,
            is_featured=True,
            sort_by="popular",
            user_id=user["id"]
        )

        return {
            "success": True,
            "data": result["data"]
        }

    except Exception as e:
        print(f"Error fetching featured templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching featured templates: {str(e)}")

@router.get("/templates/{template_id}", response_model=Dict[str, Any])
async def get_single_template(template_id: str):
    """Get a specific template by ID"""
    try:
        user = TEST_USER

        result = await get_template_simple(template_id, user["id"])

        if not result:
            raise HTTPException(status_code=404, detail="Template not found")

        return {
            "success": True,
            "data": result
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching template: {str(e)}")

@router.put("/templates/{template_id}", response_model=Dict[str, Any])
async def update_existing_template(template_id: str, template_data: TemplateUpdate):
    """Update an existing template"""
    try:
        user = TEST_USER

        # Convert to dict, excluding None values
        update_data = {k: v for k, v in template_data.dict().items() if v is not None}

        result = await update_template_simple(template_id, update_data, user["id"])

        if not result:
            raise HTTPException(status_code=404, detail="Template not found or access denied")

        return {
            "success": True,
            "data": result,
            "message": "Template updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating template: {str(e)}")

@router.post("/templates/{template_id}/use")
async def use_template(template_id: str):
    """Use a template and log usage"""
    try:
        user = TEST_USER

        # Get template
        template = await get_template_simple(template_id, user["id"])
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")

        # Log usage
        await log_template_usage_simple(template_id, user["id"])

        return {
            "success": True,
            "data": template,
            "message": "Template usage logged"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error using template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error using template: {str(e)}")

@router.get("/categories")
async def get_template_categories():
    """Get all template categories"""
    try:
        result = await get_categories_simple()

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        print(f"Error fetching categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/dashboard")
async def get_dashboard_stats():
    """Get basic dashboard statistics"""
    try:
        user = TEST_USER

        # Simple stats without complex queries
        total_templates = supabase.table("prompt_templates")\
            .select("id", count="exact")\
            .eq("is_public", True)\
            .execute()

        categories = await get_categories_simple()

        user_created = supabase.table("prompt_templates")\
            .select("id", count="exact")\
            .eq("created_by", user["id"])\
            .execute()

        return {
            "success": True,
            "data": {
                "total_templates": total_templates.count or 0,
                "categories": categories,
                "user_stats": {
                    "created": user_created.count or 0,
                    "saved": 0,  # Can implement later
                    "total_uses": 0  # Can implement later
                }
            }
        }

    except Exception as e:
        print(f"Error fetching dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")

@router.delete("/templates/{template_id}", response_model=Dict[str, Any])
async def delete_template(template_id: str):
    """Delete a template and all related data permanently"""
    try:
        user = TEST_USER

        # Check if template exists and belongs to user
        existing_template = await get_template_simple(template_id, user["id"])
        if not existing_template:
            raise HTTPException(status_code=404, detail="Template not found or access denied")

        # Delete related data first (to avoid foreign key constraints)
        try:
            # Delete usage logs
            supabase.table("prompt_template_usage")\
                .delete()\
                .eq("template_id", template_id)\
                .execute()

            # Delete version history
            supabase.table("prompt_template_versions")\
                .delete()\
                .eq("template_id", template_id)\
                .execute()

            # Remove from user saved templates
            supabase.table("user_saved_templates")\
                .delete()\
                .eq("template_id", template_id)\
                .execute()

            print(f"✅ Cleaned up related data for template {template_id}")
        except Exception as cleanup_error:
            print(f"⚠️ Warning: Could not clean up all related data: {cleanup_error}")

        # Delete the main template record
        result = supabase.table("prompt_templates")\
            .delete()\
            .eq("id", template_id)\
            .eq("created_by", user["id"])\
            .execute()

        if result.data:
            return {
                "success": True,
                "message": "Template permanently deleted",
                "data": result.data[0]
            }
        else:
            raise HTTPException(status_code=404, detail="Template not found")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting template: {str(e)}")


@router.get("/health")
async def template_library_health():
    """Health check"""
    return {
        "status": "healthy",
        "service": "template-library",
        "version": "1.0.0"
    }
