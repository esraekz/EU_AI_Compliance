# backend/app/routers/ai_systems.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.auth.auth_handler import get_current_user
from app.db.supabase_client import supabase
from pydantic import BaseModel
from datetime import datetime
import json

TEST_USER = {"id": "60f7ebaf-ec62-4348-bb85-cd73be255c6a"}

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
    step_4_completed: bool
    step_5_completed: bool
    system_name: Optional[str]
    system_description: Optional[str]
    development_stage: Optional[str]
    primary_purpose: Optional[str]
    purpose_details: Optional[str]
    prohibited_practices: Optional[dict]
    annex_iii_categories: Optional[dict]
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
                    step_3_completed,
                    step_4_completed,
                    step_5_completed
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
                "development_stage": data.get("development_stage"),
                "system_version": data.get("system_version"),
                "planned_deployment_timeline": data.get("planned_deployment_timeline")
            })
        elif step == 2:
            update_data.update({
                "step_2_completed": True,
                "business_domain": data.get("business_domain"),
                "primary_purpose": data.get("primary_purpose"),
                "target_users": json.dumps(data.get("target_users", [])),
                "use_case_description": data.get("typical_use_case"),
                "geographic_scope": json.dumps(data.get("deployment_location", [])),
                "automated_decisions_legal_effects": data.get("automated_decisions_legal_effects")
            })
        elif step == 3:
            update_data.update({
                "step_3_completed": True,
                "ai_model_type": data.get("ai_model_type"),
                "model_architecture": data.get("model_architecture"),
                "data_processing_type": data.get("data_processing"),
                "input_data_types": json.dumps(data.get("input_data_types", [])),
                "output_types": json.dumps(data.get("output_types", [])),
                "decision_autonomy": data.get("decision_autonomy")
            })
        elif step == 4:
            update_data.update({
                "step_4_completed": True,
                "subliminal_manipulation": data.get("subliminal_manipulation"),
                "vulnerable_groups_exploitation": data.get("vulnerable_groups_exploitation"),
                "social_scoring_public": data.get("social_scoring_public"),
                "realtime_biometric_public": data.get("realtime_biometric_public")
            })
        elif step == 5:
            update_data.update({
                "step_5_completed": True,
                "biometric_categorization": data.get("biometric_categorization") == "yes",
                "critical_infrastructure": data.get("critical_infrastructure") == "yes",
                "education_training": data.get("education_vocational") == "yes",
                "employment_recruitment": data.get("employment_hr") == "yes",
                "essential_services": data.get("essential_services") == "yes",
                "law_enforcement": data.get("law_enforcement") == "yes",
                "migration_asylum": data.get("migration_asylum") == "yes",
                "justice_democracy": data.get("justice_democracy") == "yes",
                "involves_profiling": data.get("profiling_individuals") == "yes",
                "preparatory_task_only": data.get("preparatory_only") == "yes"
            })
        elif step == 6:
            update_data.update({
                "step_6_completed": True,
                "safety_component": data.get("ai_regulated_product"),
                "safety_component_sector": data.get("safety_sector"),
                "third_party_conformity": data.get("third_party_conformity") == "yes",
                "ce_marking_required": data.get("ce_marking_required") == "yes",
                "eu_legislation_applicable": json.dumps(data.get("applicable_legislation", []))
            })

            # Add this elif block to the update_assessment_step function around line 200
        elif step == 7:
            update_data.update({
                "step_7_completed": True,
                "affected_individuals_count": data.get("affected_individuals_count"),
                "vulnerable_groups_affected": data.get("vulnerable_groups_affected") == "yes",
                "vulnerable_groups_details": data.get("vulnerable_groups_details"),
                "impact_level": data.get("impact_level"),
                "impact_details": data.get("impact_details"),
                "human_oversight_level": data.get("human_oversight_level"),
                "oversight_mechanisms": data.get("oversight_mechanisms"),
                "override_capabilities": data.get("override_capabilities") == "yes",
                "human_review_process": data.get("human_review_process")
            })

           # Add this elif block to the update_assessment_step function after step 7
        elif step == 8:
            update_data.update({
                "step_8_completed": True,
                "data_sources": json.dumps(data.get("data_sources", [])),
                "personal_data_processing": data.get("personal_data_processing") != "no",
                "data_quality_measures": data.get("data_quality_measures"),
                "bias_mitigation_measures": data.get("bias_mitigation_measures"),
                "data_governance_framework": data.get("data_governance_framework"),
                "gdpr_compliance_status": data.get("gdpr_compliance_status")
            })
            # Add this elif block to the update_assessment_step function after step 8
        # Add this elif block to the update_assessment_step function after step 8
        elif step == 9:
            update_data.update({
                "step_9_completed": True,
                "transparency_level": data.get("transparency_level"),
                "user_notification_mechanism": data.get("user_notification_mechanism"),
                "explainability_features": data.get("explainability_features"),
                "decision_explanation_capability": data.get("decision_explanation_capability") in ["yes", "partially"]
            })

            # Add this elif block to the update_assessment_step function after step 9
        elif step == 10:
            update_data.update({
                "step_10_completed": True,
                "existing_governance_framework": data.get("existing_governance_framework") == "yes",
                "governance_details": data.get("governance_details"),
                "documentation_status": data.get("documentation_status"),
                "risk_management_system": data.get("risk_management_system") == "yes",
                "conformity_assessment_ready": data.get("conformity_assessment_ready") == "yes"
            })

    # Note: ai_compliance_officer field doesn't exist in current schema
    # If you want to add it, you'll need to add it to the database first
    # "ai_compliance_officer": data.get("ai_compliance_officer") == "yes"

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
    #current_user: dict = Depends(get_current_user)
):
    """Perform risk classification based on assessment data"""
    try:
        current_user = TEST_USER  # Your test user
        print(f"🎯 Starting classification for system {system_id}")

        # Get assessment data
        result = supabase.table("ai_system_assessments")\
            .select("*")\
            .eq("ai_system_id", system_id)\
            .eq("user_id", current_user["id"])\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Assessment not found")

        assessment = result.data[0]
        print(f"📊 Assessment data loaded: {assessment.get('completed_steps', 0)} steps completed")

        # Enhanced classification logic
        risk_level = "minimal"
        primary_reason = "No high-risk criteria detected"
        confidence_level = "high"

        # Initialize flags
        has_prohibited = False
        has_annex_iii = False
        has_exceptions = False

        # Step 1: Check for prohibited practices (Article 5) - Unacceptable Risk
        print("🔍 Checking Article 5 prohibited practices...")
        prohibited_checks = [
            assessment.get("subliminal_manipulation") == "yes",
            assessment.get("vulnerable_groups_exploitation") == "yes",
            assessment.get("social_scoring_public") == "yes",
            assessment.get("realtime_biometric_public") == "yes"
        ]

        has_prohibited = any(prohibited_checks)
        print(f"❌ Article 5 violations: {has_prohibited}")

        if has_prohibited:
            risk_level = "unacceptable"
            primary_reason = "Article 5 - Prohibited AI practices detected"
            print(f"🚫 UNACCEPTABLE RISK: {primary_reason}")

        # Step 2: Check for high-risk use cases (Annex III) if not prohibited
        elif not has_prohibited:
            print("🔍 Checking Annex III high-risk categories...")

            # Check Annex III categories from Step 5
            annex_iii_checks = [
                assessment.get("biometric_categorization", False),
                assessment.get("critical_infrastructure", False),
                assessment.get("education_training", False),
                assessment.get("employment_recruitment", False),
                assessment.get("essential_services", False),
                assessment.get("law_enforcement", False),
                assessment.get("migration_asylum", False),
                assessment.get("justice_democracy", False)
            ]

            has_annex_iii = any(annex_iii_checks)
            print(f"⚠️ Annex III matches: {has_annex_iii}")

            # Check for exceptions that might reduce risk
            exception_checks = [
                assessment.get("preparatory_task_only", False),
                assessment.get("deviation_detection_only", False)
            ]

            has_exceptions = any(exception_checks)
            print(f"📝 Has exceptions: {has_exceptions}")

            # Determine risk level based on Annex III and exceptions
            if has_annex_iii and not has_exceptions:
                risk_level = "high"
                primary_reason = "Annex III - High-risk use case detected"
                print(f"🔴 HIGH RISK: {primary_reason}")

            elif has_annex_iii and has_exceptions:
                risk_level = "limited"
                primary_reason = "Annex III category with exception criteria"
                print(f"🟡 LIMITED RISK: {primary_reason}")

            # Check for limited risk scenarios
            elif assessment.get("involves_profiling", False):
                risk_level = "limited"
                primary_reason = "Profiling of natural persons detected"
                print(f"🟡 LIMITED RISK: {primary_reason}")

            # Check transparency requirements
            elif assessment.get("user_notification_mechanism") == "no":
                risk_level = "limited"
                primary_reason = "Transparency obligations required"
                print(f"🟡 LIMITED RISK: {primary_reason}")

            else:
                risk_level = "minimal"
                primary_reason = "No high-risk criteria detected"
                print(f"🟢 MINIMAL RISK: {primary_reason}")

        # Additional risk factors based on impact and data processing
        if risk_level == "minimal":
            # Check impact level from Step 7
            if assessment.get("impact_level") == "high":
                risk_level = "limited"
                primary_reason = "High impact level detected"
                print(f"🟡 UPGRADED TO LIMITED RISK: {primary_reason}")

            # Check sensitive data processing from Step 8
            elif assessment.get("personal_data_processing") and assessment.get("gdpr_compliance_status") == "not_compliant":
                risk_level = "limited"
                primary_reason = "Non-compliant personal data processing"
                print(f"🟡 UPGRADED TO LIMITED RISK: {primary_reason}")

        print(f"🎯 Final classification: {risk_level.upper()} - {primary_reason}")

        # Store classification result
        classification_data = {
            "ai_system_id": system_id,
            "assessment_id": assessment["id"],
            "user_id": current_user["id"],
            "risk_level": risk_level,
            "primary_reason": primary_reason,
            "confidence_level": confidence_level,
            "article_5_violation": has_prohibited,
            "annex_iii_match": has_annex_iii,
            "has_exceptions": has_exceptions,
            "compliance_requirements": json.dumps([])  # Will be populated based on risk level
        }

        print(f"💾 Storing classification result...")
        classification_result = supabase.table("ai_system_classification_results")\
            .insert(classification_data)\
            .execute()

        if not classification_result.data:
            raise HTTPException(status_code=400, detail="Failed to store classification result")

        # Update AI system status
        supabase.table("ai_systems")\
            .update({"status": "completed", "updated_at": "now()"})\
            .eq("id", system_id)\
            .execute()

        print(f"✅ Classification completed successfully")
        return {
            "success": True,
            "data": classification_result.data[0],
            "message": "Classification completed successfully"
        }

    except Exception as e:
        print(f"❌ Error classifying AI system: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")





