// src/pages/eu_act/risk-assessment/[systemId].tsx
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { aiSystemsApi } from '../../../services/api';
import Step1BasicInfo from '../WizardSteps/Step1BasicInfo';
import Step2PurposeAnalysis from '../WizardSteps/Step2PurposeAnalysis';


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
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div>Loading assessment...</div>
                </div>
            </Layout>
        );
    }

    if (!system) {
        return (
            <Layout>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div>System not found</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '30px' }}>
                    <button
                        onClick={() => router.push('/eu_act/risk-assessment')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        ← Back to AI Systems
                    </button>

                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {system.name}
                    </h1>
                    <p style={{ color: '#666' }}>EU AI Act Risk Assessment</p>
                </div>

                {/* Progress Indicator */}
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    padding: '10px',
                                    backgroundColor: step <= currentStep ? '#6030c9' : '#f5f5f5',
                                    color: step <= currentStep ? 'white' : '#666',
                                    marginRight: step < 4 ? '8px' : '0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}
                            >
                                Step {step}
                            </div>
                        ))}
                    </div>
                    <div style={{ color: '#666', textAlign: 'center', fontSize: '14px' }}>
                        Step {currentStep} of 4: {getStepTitle(currentStep)}
                    </div>
                </div>

                {/* Wizard Content */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '40px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    // Update the wizard content section:
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

                    {currentStep > 2 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <h3>Step {currentStep}: {getStepTitle(currentStep)}</h3>
                            <p style={{ marginTop: '16px' }}>
                                Step 3 and beyond will be implemented next.
                            </p>
                            <button
                                onClick={() => setCurrentStep(2)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6030c9',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    marginTop: '16px'
                                }}
                            >
                                ← Back to Step 2
                            </button>
                        </div>
                    )}


                </div>


            </div>
        </Layout>
    );
};

const getStepTitle = (step: number): string => {
    const titles = {
        1: 'Basic Information',
        2: 'Purpose Analysis',
        3: 'Risk Assessment',
        4: 'Results & Classification'
    };
    return titles[step as keyof typeof titles] || 'Unknown Step';
};

export default AssessmentWizardPage;
