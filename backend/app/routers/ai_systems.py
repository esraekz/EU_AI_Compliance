# backend/app/routers/ai_systems.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.auth.auth_handler import get_current_user
from app.db.supabase_client import supabase
from pydantic import BaseModel
from datetime import datetime
import json

TEST_USER = {"id": "12345678-1234-5678-9012-123456789012"}

router = APIRouter(prefix="/ai-systems", tags=["AI Systems"])

# Pydantic models for request/response
class AISystemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    development_stage: Optional[str] = "planning"

class AISystemResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    development_stage: Optional[str]
    status: str
    created_at: str
    updated_at: str

class AssessmentStepUpdate(BaseModel):
    step: int
    data: dict

class AssessmentResponse(BaseModel):
    id: str
    ai_system_id: str
    current_step: int
    completed_steps: int
    step_1_completed: bool
    step_2_completed: bool
    step_3_completed: bool
    system_name: Optional[str]
    system_description: Optional[str]
    development_stage: Optional[str]
    primary_purpose: Optional[str]
    purpose_details: Optional[str]
    prohibited_practices: Optional[dict]
    safety_component: Optional[str]
    impact_level: Optional[str]

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "AI Systems API is running"}

@router.post("/", response_model=dict)
async def create_ai_system(
    system_data: AISystemCreate,
    #current_user: dict = Depends(get_current_user)#
):
    """Create a new AI system and initialize assessment"""
    try:
        # Create AI system
        current_user = TEST_USER  # ← Add this line
        ai_system_data = {
            "user_id": current_user["id"],
            "name": system_data.name,
            "description": system_data.description,
            "development_stage": system_data.development_stage,
            "status": "draft"
        }

        result = supabase.table("ai_systems").insert(ai_system_data).execute()

        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create AI system")

        ai_system = result.data[0]

        # Create initial assessment
        assessment_data = {
            "ai_system_id": ai_system["id"],
            "user_id": current_user["id"],
            "current_step": 1,
            "completed_steps": 0
        }

        assessment_result = supabase.table("ai_system_assessments").insert(assessment_data).execute()

        if not assessment_result.data:
            # Cleanup created system if assessment creation fails
            supabase.table("ai_systems").delete().eq("id", ai_system["id"]).execute()
            raise HTTPException(status_code=400, detail="Failed to create assessment")

        return {
            "success": True,
            "data": {
                "ai_system": ai_system,
                "assessment": assessment_result.data[0]
            },
            "message": "AI system and assessment created successfully"
        }

    except Exception as e:
        print(f"Error creating AI system: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=dict)
async def get_ai_systems(
    limit: int = 20,
    offset: int = 0,
    #current_user: dict = Depends(get_current_user)#
):
    """Get all AI systems for the current user"""
    try:
        current_user = TEST_USER  # ← Add this line
        # Get AI systems with their assessment status
        query = supabase.table("ai_systems")\
            .select("""
                *,
                ai_system_assessments(
                    id,
                    current_step,
                    completed_steps,
                    step_1_completed,
                    step_2_completed,
                    step_3_completed
                ),
                ai_system_classification_results(
                    risk_level,
                    confidence_level,
                    created_at
                )
            """)\
            .eq("user_id", current_user["id"])\
            .order("updated_at", desc=True)\
            .range(offset, offset + limit - 1)

        result = query.execute()

        return {
            "success": True,
            "data": result.data,
            "total": len(result.data),
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        print(f"Error fetching AI systems: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{system_id}", response_model=dict)
async def get_ai_system(
    system_id: str,
    #current_user: dict = Depends(get_current_user)#
):
    """Get a specific AI system with its assessment"""
    try:
        current_user = TEST_USER  # ← Add this line
        # Get AI system
        result = supabase.table("ai_systems")\
            .select("*")\
            .eq("id", system_id)\
            .eq("user_id", current_user["id"])\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="AI system not found")

        ai_system = result.data[0]

        # Get current assessment
        assessment_result = supabase.table("ai_system_assessments")\
            .select("*")\
            .eq("ai_system_id", system_id)\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()

        assessment = assessment_result.data[0] if assessment_result.data else None

        # Get classification result if exists
        classification_result = supabase.table("ai_system_classification_results")\
            .select("*")\
            .eq("ai_system_id", system_id)\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()

        classification = classification_result.data[0] if classification_result.data else None

        return {
            "success": True,
            "data": {
                "ai_system": ai_system,
                "assessment": assessment,
                "classification": classification
            }
        }

    except Exception as e:
        print(f"Error fetching AI system {system_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{system_id}/assessment", response_model=dict)
async def update_assessment_step(
    system_id: str,
    step_update: AssessmentStepUpdate,
    #current_user: dict = Depends(get_current_user)#
):
    """Update assessment step data"""
    try:
        current_user = TEST_USER  # ← Add this line
        # Get current assessment
        result = supabase.table("ai_system_assessments")\
            .select("*")\
            .eq("ai_system_id", system_id)\
            .eq("user_id", current_user["id"])\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Assessment not found")

        assessment = result.data[0]
        step = step_update.step
        data = step_update.data

        # Prepare update data based on step
        update_data = {"updated_at": "now()"}

        if step == 1:
            update_data.update({
                "step_1_completed": True,
                "system_name": data.get("system_name"),
                "system_description": data.get("system_description"),
                "development_stage": data.get("development_stage")
            })
        elif step == 2:
            update_data.update({
                "step_2_completed": True,
                "primary_purpose": data.get("primary_purpose"),
                "purpose_details": data.get("purpose_details")
            })
        elif step == 3:
            update_data.update({
                "step_3_completed": True,
                "prohibited_practices": json.dumps(data.get("prohibited_practices", [])),
                "safety_component": data.get("safety_component"),
                "impact_level": data.get("impact_level")
            })

        # Update current step and completed steps
        update_data["current_step"] = max(step + 1, assessment["current_step"])
        update_data["completed_steps"] = max(step, assessment["completed_steps"])

        # Update assessment
        update_result = supabase.table("ai_system_assessments")\
            .update(update_data)\
            .eq("id", assessment["id"])\
            .execute()

        if not update_result.data:
            raise HTTPException(status_code=400, detail="Failed to update assessment")

        return {
            "success": True,
            "data": update_result.data[0],
            "message": f"Step {step} completed successfully"
        }

    except Exception as e:
        print(f"Error updating assessment step: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/{system_id}/classify", response_model=dict)
async def classify_ai_system(
    system_id: str,
    #current_user: dict = Depends(get_current_user)#
):
    """Perform risk classification based on assessment data"""
    try:
        current_user = TEST_USER  # ← Add this line
        # Get assessment data
        result = supabase.table("ai_system_assessments")\
            .select("*")\
            .eq("ai_system_id", system_id)\
            .eq("user_id", current_user["id"])\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Assessment not found")

        assessment = result.data[0]

        # Simple classification logic (will be expanded)
        risk_level = "minimal"
        primary_reason = "No high-risk criteria detected"
        confidence_level = "high"

        # Check for prohibited practices (Article 5)
        prohibited_practices = json.loads(assessment.get("prohibited_practices", "[]"))
        if prohibited_practices:
            risk_level = "unacceptable"
            primary_reason = "Article 5 - Prohibited AI practices detected"

        # Check for high-risk use cases (Annex III)
        elif assessment.get("primary_purpose") in ["employment", "biometric", "education", "healthcare", "infrastructure"]:
            risk_level = "high"
            primary_reason = f"Annex III - {assessment.get('primary_purpose')} use case"

        # Check for limited risk (transparency requirements)
        elif assessment.get("primary_purpose") == "customer":
            risk_level = "limited"
            primary_reason = "Transparency obligations required"

        # Store classification result
        classification_data = {
            "ai_system_id": system_id,
            "assessment_id": assessment["id"],
            "user_id": current_user["id"],
            "risk_level": risk_level,
            "primary_reason": primary_reason,
            "confidence_level": confidence_level,
            "article_5_violation": len(prohibited_practices) > 0,
            "annex_iii_match": assessment.get("primary_purpose") in ["employment", "biometric", "education", "healthcare", "infrastructure"],
            "compliance_requirements": json.dumps([])  # Will be populated based on risk level
        }

        classification_result = supabase.table("ai_system_classification_results")\
            .insert(classification_data)\
            .execute()

        # Update AI system status
        supabase.table("ai_systems")\
            .update({"status": "completed", "updated_at": "now()"})\
            .eq("id", system_id)\
            .execute()

        return {
            "success": True,
            "data": classification_result.data[0],
            "message": "Classification completed successfully"
        }

    except Exception as e:
        print(f"Error classifying AI system: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
