// src/pages/eu_act/risk-assessment/[systemId].tsx
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { aiSystemsApi } from '../../../services/api';

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
                    {/* This is where we'll add the step components */}
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <h3>Step {currentStep}: {getStepTitle(currentStep)}</h3>
                        <p style={{ marginTop: '16px' }}>
                            Assessment wizard components will be implemented here.
                        </p>
                        <p style={{ marginTop: '8px', fontSize: '14px' }}>
                            Current assessment data: {JSON.stringify(assessment, null, 2)}
                        </p>
                    </div>
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
