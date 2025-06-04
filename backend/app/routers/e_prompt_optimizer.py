# app/routers/e_prompt_optimizer.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.db.supabase_client import (
    create_prompt,
    get_prompt,
    get_user_prompts,
    update_prompt,
    delete_prompt,
    store_optimization_results,
    get_optimization_results,
    create_prompt_version,
    get_prompt_versions
)
from app.services.e_prompt_analyzer import prompt_analyzer
import uuid

router = APIRouter(
    prefix="/prompt-optimizer",
    tags=["prompt-optimizer"]
)

# Test user - same as your other endpoints
TEST_USER = {"id": "test-user-esra"}

# Pydantic Models
class PromptCreate(BaseModel):
    title: Optional[str] = None
    original_prompt: str
    tags: Optional[List[str]] = None

class PromptUpdate(BaseModel):
    title: Optional[str] = None
    original_prompt: Optional[str] = None
    optimized_prompt: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None

class PromptOptimizeRequest(BaseModel):
    prompt_id: str

class PromptAnalyzeRequest(BaseModel):
    prompt_text: str

class PromptResponse(BaseModel):
    id: str
    user_id: str
    title: Optional[str]
    original_prompt: str
    optimized_prompt: Optional[str]
    status: str
    tags: Optional[List[str]]
    created_at: str
    updated_at: str

class OptimizationAnalysisResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    token_count_original: int
    token_count_optimized: int
    analyses: Dict[str, Any]
    overall_score: float

# API Endpoints
@router.post("/prompts", response_model=Dict[str, Any])
async def create_new_prompt(prompt_data: PromptCreate):
    """Create a new prompt"""
    try:
        user = TEST_USER

        # Prepare data for database
        db_data = {
            "user_id": user["id"],
            "title": prompt_data.title or "Untitled Prompt",
            "original_prompt": prompt_data.original_prompt,
            "tags": prompt_data.tags or [],
            "status": "draft"
        }

        # Create prompt in database
        result = await create_prompt(db_data)

        if not result:
            raise HTTPException(status_code=500, detail="Failed to create prompt")

        return {
            "success": True,
            "data": result,
            "message": "Prompt created successfully"
        }

    except Exception as e:
        print(f"Error creating prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating prompt: {str(e)}")

@router.get("/prompts", response_model=Dict[str, Any])
async def get_prompts(
    limit: int = 20,
    offset: int = 0,
    search: Optional[str] = None
):
    """Get user's prompts with pagination and search"""
    try:
        user = TEST_USER

        result = await get_user_prompts(
            user_id=user["id"],
            limit=limit,
            offset=offset,
            search=search
        )

        return {
            "success": True,
            "data": result["data"],
            "total": result["count"],
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        print(f"Error fetching prompts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching prompts: {str(e)}")

@router.get("/prompts/{prompt_id}", response_model=Dict[str, Any])
async def get_single_prompt(prompt_id: str):
    """Get a specific prompt by ID"""
    try:
        user = TEST_USER

        result = await get_prompt(prompt_id, user["id"])

        if not result:
            raise HTTPException(status_code=404, detail="Prompt not found")

        # Also get optimization results if they exist
        optimization_results = await get_optimization_results(prompt_id)

        return {
            "success": True,
            "data": {
                **result,
                "optimization_results": optimization_results
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching prompt: {str(e)}")

@router.put("/prompts/{prompt_id}", response_model=Dict[str, Any])
async def update_existing_prompt(prompt_id: str, prompt_data: PromptUpdate):
    """Update an existing prompt"""
    try:
        user = TEST_USER

        # Convert Pydantic model to dict, excluding None values
        update_data = {k: v for k, v in prompt_data.dict().items() if v is not None}

        result = await update_prompt(prompt_id, user["id"], update_data)

        if not result:
            raise HTTPException(status_code=404, detail="Prompt not found")

        return {
            "success": True,
            "data": result,
            "message": "Prompt updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating prompt: {str(e)}")

@router.delete("/prompts/{prompt_id}")
async def delete_existing_prompt(prompt_id: str):
    """Delete a prompt"""
    try:
        user = TEST_USER

        result = await delete_prompt(prompt_id, user["id"])

        if not result:
            raise HTTPException(status_code=404, detail="Prompt not found")

        return {
            "success": True,
            "message": "Prompt deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting prompt: {str(e)}")

@router.post("/prompts/{prompt_id}/optimize", response_model=Dict[str, Any])
async def optimize_prompt(prompt_id: str):
    """Optimize a prompt using AI analysis"""
    try:
        user = TEST_USER

        # Get the prompt first
        prompt_record = await get_prompt(prompt_id, user["id"])

        if not prompt_record:
            raise HTTPException(status_code=404, detail="Prompt not found")

        # Run comprehensive analysis
        analysis_result = await prompt_analyzer.analyze_prompt_comprehensive(
            prompt_record["original_prompt"]
        )

        # Store individual analysis results
        analyses = analysis_result["analyses"]
        for analysis_type, analysis_data in analyses.items():
            optimization_data = {
                "prompt_id": prompt_id,
                "analysis_type": analysis_type,
                "score": analysis_data.get("score", 0.0),
                "suggestions": analysis_data.get("suggestions", analysis_data.get("improvements", analysis_data.get("recommendations", []))),
                "issues_found": analysis_data.get("issues", analysis_data.get("vulnerabilities", analysis_data.get("structure_issues", []))),
                "token_count_original": analysis_result["token_count_original"],
                "token_count_optimized": analysis_result["token_count_optimized"]
            }
            await store_optimization_results(optimization_data)

        # Update the prompt with optimized version
        await update_prompt(prompt_id, user["id"], {
            "optimized_prompt": analysis_result["optimized_prompt"],
            "status": "optimized"
        })

        # Create version history
        version_data = {
            "prompt_id": prompt_id,
            "version_number": 1,  # You might want to increment this based on existing versions
            "prompt_text": analysis_result["optimized_prompt"],
            "optimization_notes": f"AI optimization - Overall score: {analysis_result['overall_score']:.2f}"
        }
        await create_prompt_version(version_data)

        return {
            "success": True,
            "data": {
                "original_prompt": analysis_result["original_prompt"],
                "optimized_prompt": analysis_result["optimized_prompt"],
                "token_count_original": analysis_result["token_count_original"],
                "token_count_optimized": analysis_result["token_count_optimized"],
                "overall_score": analysis_result["overall_score"],
                "analyses": analyses,
                "token_savings": analysis_result["token_count_original"] - analysis_result["token_count_optimized"]
            },
            "message": "Prompt optimized successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error optimizing prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error optimizing prompt: {str(e)}")

@router.get("/prompts/{prompt_id}/versions", response_model=Dict[str, Any])
async def get_prompt_version_history(prompt_id: str):
    """Get version history for a prompt"""
    try:
        user = TEST_USER

        # Verify user owns the prompt
        prompt_record = await get_prompt(prompt_id, user["id"])
        if not prompt_record:
            raise HTTPException(status_code=404, detail="Prompt not found")

        versions = await get_prompt_versions(prompt_id)

        return {
            "success": True,
            "data": versions
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching version history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching version history: {str(e)}")

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_prompt_quick(request: PromptAnalyzeRequest):
    """Quick analysis of a prompt without saving to database"""
    try:
        analysis_result = await prompt_analyzer.analyze_prompt_comprehensive(request.prompt_text)

        return {
            "success": True,
            "data": analysis_result
        }

    except Exception as e:
        print(f"Error analyzing prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing prompt: {str(e)}")

# Health check endpoint for prompt optimizer
@router.get("/health")
async def prompt_optimizer_health():
    """Health check for prompt optimizer service"""
    return {
        "status": "healthy",
        "service": "prompt-optimizer",
        "version": "1.0.0"
    }
