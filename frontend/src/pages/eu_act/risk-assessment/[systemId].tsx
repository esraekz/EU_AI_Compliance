// src/pages/eu_act/risk-assessment/[systemId].tsx - Updated with Step 5
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { aiSystemsApi } from '../../../services/api';
import Step10ComplianceResults from '../WizardSteps/Step10ComplianceResults';
import Step1BasicInfo from '../WizardSteps/Step1BasicInfo';
import Step2PurposeAnalysis from '../WizardSteps/Step2PurposeAnalysis';
import Step3TechnicalCharacteristics from '../WizardSteps/Step3TechnicalCharacteristics';
import Step4ProhibitedPractices from '../WizardSteps/Step4ProhibitedPractices';
import Step5AnnexIIIAssessment from '../WizardSteps/Step5AnnexIIIAssessment';
import Step6SafetyComponents from '../WizardSteps/Step6SafetyComponents';
import Step7ImpactOversight from '../WizardSteps/Step7ImpactOversight';
import Step8DataGovernance from '../WizardSteps/Step8DataGovernance';
import Step9Transparency from '../WizardSteps/Step9Transparency';



const AssessmentWizardPage: React.FC = () => {
    const router = useRouter();
    const { systemId } = router.query;
    const [loading, setLoading] = useState(true);
    const [system, setSystem] = useState<any>(null);
    const [assessment, setAssessment] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (systemId && typeof systemId === 'string') {
            loadSystemData(systemId);
        }
    }, [systemId]);

    const loadSystemData = async (id: string) => {
        try {
            setLoading(true);
            const response = await aiSystemsApi.getAISystem(id);

            if (response.success) {
                setSystem(response.data.ai_system);
                setAssessment(response.data.assessment);
                setCurrentStep(response.data.assessment?.current_step || 1);
            } else {
                console.error('Failed to load system data');
                router.push('/eu_act/risk-assessment');
            }
        } catch (error) {
            console.error('Error loading system:', error);
            router.push('/eu_act/risk-assessment');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ fontSize: '14px', color: '#718096' }}>Loading assessment...</div>
                </div>
            </Layout>
        );
    }

    if (!system) {
        return (
            <Layout>
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ fontSize: '14px', color: '#718096' }}>System not found</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px 0'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            onClick={() => router.push('/eu_act/risk-assessment')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '12px',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            ← Back to AI Systems
                        </button>

                        <div style={{
                            textAlign: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '12px',
                            padding: '20px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h1 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: 'white',
                                marginBottom: '6px',
                                margin: 0
                            }}>
                                AI System Risk Classifier
                            </h1>
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '14px',
                                margin: 0
                            }}>
                                Determine the risk level of your AI system
                            </p>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(10, 1fr)',
                            gap: '6px',
                            marginBottom: '8px'
                        }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
                                <div
                                    key={step}
                                    style={{
                                        height: '6px',
                                        backgroundColor: step <= currentStep ? '#4299e1' : 'rgba(255, 255, 255, 0.3)',
                                        borderRadius: '3px',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            textAlign: 'center',
                            fontSize: '12px'
                        }}>
                            Step {currentStep} of 10: {getStepTitle(currentStep)}
                        </div>
                    </div>

                    {/* Wizard Content */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '30px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <Step1BasicInfo
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    system_name: assessment.system_name || '',
                                    system_description: assessment.system_description || '',
                                    development_stage: assessment.development_stage || 'planning',
                                    system_version: assessment.system_version || '',
                                    planned_deployment_timeline: assessment.planned_deployment_timeline || ''
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 1 completed with data:', data);
                                    setCurrentStep(2);
                                    loadSystemData(systemId as string);
                                }}
                                onBack={() => router.push('/eu_act/risk-assessment')}
                                loading={loading}
                            />
                        )}

                        {/* Step 2: Purpose Analysis */}
                        {currentStep === 2 && (
                            <Step2PurposeAnalysis
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    business_domain: assessment.business_domain || '',
                                    primary_purpose: assessment.primary_purpose || '',
                                    target_users: assessment.target_users,
                                    typical_use_case: assessment.use_case_description || '',
                                    deployment_location: assessment.geographic_scope,
                                    automated_decisions_legal_effects: assessment.automated_decisions_legal_effects || ''
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 2 completed with data:', data);
                                    setCurrentStep(3);
                                    loadSystemData(systemId as string);
                                }}
                                onBack={() => setCurrentStep(1)}
                                loading={loading}
                            />
                        )}

                        {/* Step 3: Technical Characteristics */}
                        {currentStep === 3 && (
                            <Step3TechnicalCharacteristics
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    ai_model_type: assessment.ai_model_type || '',
                                    model_architecture: assessment.model_architecture || '',
                                    data_processing: assessment.data_processing_type || '',
                                    input_data_types: assessment.input_data_types,
                                    output_types: assessment.output_types,
                                    decision_autonomy: assessment.decision_autonomy || ''
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 3 completed with data:', data);
                                    setCurrentStep(4);
                                    loadSystemData(systemId as string);
                                }}
                                onBack={() => setCurrentStep(2)}
                                loading={loading}
                            />
                        )}

                        {/* Step 4: Article 5 Prohibited Practices */}
                        {currentStep === 4 && (
                            <Step4ProhibitedPractices
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    subliminal_manipulation: assessment.subliminal_manipulation || '',
                                    vulnerable_groups_exploitation: assessment.vulnerable_groups_exploitation || '',
                                    social_scoring_public: assessment.social_scoring_public || '',
                                    realtime_biometric_public: assessment.realtime_biometric_public || ''
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 4 completed with data:', data);
                                    setCurrentStep(5);
                                    loadSystemData(systemId as string);
                                }}
                                onBack={() => setCurrentStep(3)}
                                loading={loading}
                            />
                        )}

                        {/* Step 5: Annex III High-Risk Assessment */}
                        {currentStep === 5 && (
                            <Step5AnnexIIIAssessment
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    biometric_categorization: assessment.biometric_categorization ? 'yes' : assessment.biometric_categorization === false ? 'no' : '',
                                    critical_infrastructure: assessment.critical_infrastructure ? 'yes' : assessment.critical_infrastructure === false ? 'no' : '',
                                    education_vocational: assessment.education_training ? 'yes' : assessment.education_training === false ? 'no' : '',
                                    employment_hr: assessment.employment_recruitment ? 'yes' : assessment.employment_recruitment === false ? 'no' : '',
                                    essential_services: assessment.essential_services ? 'yes' : assessment.essential_services === false ? 'no' : '',
                                    law_enforcement: assessment.law_enforcement ? 'yes' : assessment.law_enforcement === false ? 'no' : '',
                                    migration_asylum: assessment.migration_asylum ? 'yes' : assessment.migration_asylum === false ? 'no' : '',
                                    justice_democracy: assessment.justice_democracy ? 'yes' : assessment.justice_democracy === false ? 'no' : '',
                                    profiling_individuals: assessment.involves_profiling ? 'yes' : assessment.involves_profiling === false ? 'no' : '',
                                    preparatory_only: assessment.preparatory_task_only ? 'yes' : assessment.preparatory_task_only === false ? 'no' : ''
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 5 completed with data:', data);
                                    setCurrentStep(6);
                                    loadSystemData(systemId as string);
                                }}
                                onBack={() => setCurrentStep(4)}
                                loading={loading}
                            />
                        )}

                        {/* Step 6: Article 6 Safety Components */}
                        {currentStep === 6 && (
                            <Step6SafetyComponents
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    ai_regulated_product: assessment.safety_component || '',
                                    safety_sector: assessment.safety_component_sector || '',
                                    third_party_conformity: assessment.third_party_conformity ? 'yes' : assessment.third_party_conformity === false ? 'no' : '',
                                    ce_marking_required: assessment.ce_marking_required ? 'yes' : assessment.ce_marking_required === false ? 'no' : '',
                                    applicable_legislation: assessment.eu_legislation_applicable
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 6 completed with data:', data);
                                    setCurrentStep(7);
                                    loadSystemData(systemId as string);
                                }}
                                onBack={() => setCurrentStep(5)}
                                loading={loading}
                            />
                        )}

                        {/* Step 7: Impact and Human Oversight */}
                        {currentStep === 7 && (
                            <Step7ImpactOversight
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    affected_individuals_count: assessment.affected_individuals_count || '',
                                    vulnerable_groups_affected: assessment.vulnerable_groups_affected,
                                    vulnerable_groups_details: assessment.vulnerable_groups_details || '',
                                    impact_level: assessment.impact_level || '',
                                    impact_details: assessment.impact_details || '',
                                    human_oversight_level: assessment.human_oversight_level || '',
                                    oversight_mechanisms: assessment.oversight_mechanisms || '',
                                    override_capabilities: assessment.override_capabilities,
                                    human_review_process: assessment.human_review_process || ''
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 7 completed with data:', data);
                                    setCurrentStep(8);
                                    loadSystemData(systemId as string);
                                }}
                                onBack={() => setCurrentStep(6)}
                                loading={loading}
                            />
                        )}

                        // 2. Replace the placeholder Step 8 section with:
                        {/* Step 8: Data Governance */}
                        {currentStep === 8 && (
                            <Step8DataGovernance
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    data_sources: assessment.data_sources,
                                    personal_data_processing: assessment.personal_data_processing,
                                    data_quality_measures: assessment.data_quality_measures || '',
                                    bias_mitigation_measures: assessment.bias_mitigation_measures || '',
                                    data_governance_framework: assessment.data_governance_framework || '',
                                    gdpr_compliance_status: assessment.gdpr_compliance_status || ''
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 8 completed with data:', data);
                                    setCurrentStep(9);
                                    loadSystemData(systemId as string);
                                }}
                                onBack={() => setCurrentStep(7)}
                                loading={loading}
                            />
                        )}

                        // 2. Replace the placeholder Step 9 section with:
                        {/* Step 9: Transparency and Explainability */}
                        {currentStep === 9 && (
                            <Step9Transparency
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    user_notification_mechanism: assessment.user_notification_mechanism || '',
                                    transparency_level: assessment.transparency_level || '',
                                    decision_explanation_capability: assessment.decision_explanation_capability,
                                    explainability_features: assessment.explainability_features || '',
                                    user_documentation: [], // Fresh form data
                                    transparency_adapted_to_risk: '' // Fresh form data
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 9 completed with data:', data);
                                    setCurrentStep(10);
                                    loadSystemData(systemId as string);
                                }}
                                onBack={() => setCurrentStep(8)}
                                loading={loading}
                            />
                        )}

                        // 2. Replace the placeholder Step 10 section with:
                        {/* Step 10: Compliance Readiness and Results */}
                        {currentStep === 10 && (
                            <Step10ComplianceResults
                                systemId={systemId as string}
                                initialData={assessment ? {
                                    existing_governance_framework: assessment.existing_governance_framework,
                                    governance_details: assessment.governance_details || '',
                                    documentation_status: assessment.documentation_status || '',
                                    risk_management_system: assessment.risk_management_system,
                                    conformity_assessment_ready: assessment.conformity_assessment_ready,
                                    ai_compliance_officer: '' // This field might not exist in your current schema
                                } : undefined}
                                onNext={(data) => {
                                    console.log('Step 10 completed with data:', data);
                                    // Assessment is complete - redirect to results or dashboard
                                    router.push('/eu_act/risk-assessment');
                                }}
                                onBack={() => setCurrentStep(9)}
                                loading={loading}
                            />
                        )}

                    </div>
                </div>
            </div>
        </Layout>
    );
};

const getStepTitle = (step: number): string => {
    const titles = {
        1: 'Basic Information',
        2: 'Purpose and Domain',
        3: 'Technical Characteristics',
        4: 'Article 5 Prohibited Practices',
        5: 'Annex III High-Risk Assessment',
        6: 'Article 6 Safety Components',
        7: 'Impact and Oversight',
        8: 'Data Governance',
        9: 'Transparency and Explainability',
        10: 'Compliance Readiness'
    };
    return titles[step as keyof typeof titles] || 'Unknown Step';
};

const getStepIcon = (step: number): string => {
    const icons = {
        1: '📋',
        2: '🎯',
        3: '⚙️',
        4: '🚫',
        5: '⚠️',
        6: '🔒',
        7: '👥',
        8: '📊',
        9: '💡',
        10: '✅'
    };
    return icons[step as keyof typeof icons] || '❓';
};

const getStepDescription = (step: number): string => {
    const descriptions = {
        1: 'Basic system information and development details',
        2: 'System purpose, use cases, and target users',
        3: 'Technical architecture and AI model characteristics',
        4: 'Check for prohibited AI practices under Article 5',
        5: 'Assessment against Annex III high-risk categories',
        6: 'Safety component evaluation under Article 6',
        7: 'Impact assessment and human oversight requirements',
        8: 'Data sources, quality measures, and governance framework',
        9: 'Transparency obligations and explainability features',
        10: 'Overall compliance readiness and documentation status'
    };
    return descriptions[step as keyof typeof descriptions] || 'Assessment step';
};

export default AssessmentWizardPage;
