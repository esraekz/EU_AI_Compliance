// src/pages/eu_act/risk-assessment/[systemId].tsx - Refined Elegant Style
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { aiSystemsApi } from '../../../services/api';
import Step1BasicInfo from '../WizardSteps/Step1BasicInfo';
import Step2PurposeAnalysis from '../WizardSteps/Step2PurposeAnalysis';
import Step3TechnicalCharacteristics from '../WizardSteps/Step3TechnicalCharacteristics';
import Step4ProhibitedPractices from '../WizardSteps/Step4ProhibitedPractices';

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
                                    development_stage: assessment.development_stage || 'planning'
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
                                    primary_purpose: assessment.primary_purpose || '',
                                    purpose_details: assessment.purpose_details || ''
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
                                    data_processing_type: assessment.data_processing_type || '',
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
                                    manipulation_techniques: assessment.manipulation_techniques || false,
                                    manipulation_details: assessment.manipulation_details || '',
                                    vulnerability_exploitation: assessment.vulnerability_exploitation || false,
                                    vulnerability_details: assessment.vulnerability_details || '',
                                    social_scoring: assessment.social_scoring || false,
                                    social_scoring_details: assessment.social_scoring_details || '',
                                    biometric_identification: assessment.biometric_identification || false,
                                    biometric_details: assessment.biometric_details || '',
                                    prohibited_practices: assessment.prohibited_practices
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

                        {/* Steps 5-10: Placeholder for remaining steps */}
                        {currentStep >= 5 && currentStep <= 10 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#718096' }}>
                                <div style={{ fontSize: '32px', marginBottom: '16px' }}>
                                    {getStepIcon(currentStep)}
                                </div>
                                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#2d3748', fontWeight: '600' }}>
                                    Step {currentStep}: {getStepTitle(currentStep)}
                                </h3>
                                <p style={{ fontSize: '14px', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
                                    {getStepDescription(currentStep)}
                                </p>
                                <p style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '24px' }}>
                                    This step component will be implemented next.
                                </p>

                                {/* Navigation buttons */}
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#edf2f7',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            color: '#4a5568',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Previous
                                    </button>

                                    {currentStep < 10 && (
                                        <button
                                            onClick={() => setCurrentStep(currentStep + 1)}
                                            style={{
                                                padding: '8px 20px',
                                                backgroundColor: '#4299e1',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: 'white',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Continue Assessment
                                        </button>
                                    )}
                                </div>
                            </div>
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
