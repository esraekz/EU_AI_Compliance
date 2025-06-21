// src/pages/eu_act/risk-assessment/index.tsx
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout/Layout';
import { AISystem, aiSystemsApi } from '../../../services/api';

interface AISystemWithDetails extends AISystem {
    ai_system_assessments?: Array<{
        current_step: number;
        completed_steps: number;
        step_1_completed: boolean;
        step_2_completed: boolean;
        step_3_completed: boolean;
    }>;
    ai_system_classification_results?: Array<{
        risk_level: string;
        confidence_level: string;
        created_at: string;
    }>;
}

const RiskAssessmentPage: React.FC = () => {
    const router = useRouter();
    const [systems, setSystems] = useState<AISystemWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load AI systems on component mount
    useEffect(() => {
        loadAISystems();
    }, []);

    const loadAISystems = async () => {
        try {
            setLoading(true);
            const response = await aiSystemsApi.getAISystems({ limit: 50 });
            if (response.success) {
                setSystems(response.data || []);
            } else {
                setError('Failed to load AI systems');
            }
        } catch (err) {
            console.error('Error loading AI systems:', err);
            setError('Failed to load AI systems');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSystem = async () => {
        try {
            setCreating(true);
            setError(null);

            // Create new system with default values
            const response = await aiSystemsApi.createAISystem({
                name: 'New AI System',
                description: '',
                development_stage: 'planning'
            });

            if (response.success && response.data?.ai_system) {
                // Navigate to the assessment wizard
                const systemId = response.data.ai_system.id;
                router.push(`/eu_act/risk-assessment/${systemId}`);
            } else {
                setError('Failed to create AI system');
            }
        } catch (err) {
            console.error('Error creating AI system:', err);
            setError('Failed to create AI system');
        } finally {
            setCreating(false);
        }
    };

    const getSystemStatus = (system: AISystemWithDetails) => {
        const assessment = system.ai_system_assessments?.[0];
        const classification = system.ai_system_classification_results?.[0];

        if (classification) {
            return {
                text: `Completed (${classification.risk_level})`,
                color: getRiskLevelColor(classification.risk_level),
                progress: 100
            };
        }

        if (assessment) {
            const progress = (assessment.completed_steps / 4) * 100;
            return {
                text: `Step ${assessment.current_step}/4`,
                color: '#6030c9',
                progress
            };
        }

        return {
            text: 'Not Started',
            color: '#666',
            progress: 0
        };
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'unacceptable': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'limited': return '#ffc107';
            case 'minimal': return '#28a745';
            default: return '#6c757d';
        }
    };

    const handleSystemClick = (systemId: string) => {
        router.push(`/eu_act/risk-assessment/${systemId}`);
    };

    if (loading) {
        return (
            <Layout>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div>Loading AI systems...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e252e', marginBottom: '10px' }}>
                        AI Risk Assessment
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
                        Assess your AI systems for EU AI Act compliance. Determine risk levels and required obligations.
                    </p>

                    <button
                        onClick={handleCreateSystem}
                        disabled={creating}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6030c9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: creating ? 'not-allowed' : 'pointer',
                            opacity: creating ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {creating ? 'Creating...' : '+ Add New System'}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        borderRadius: '8px',
                        color: '#721c24',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Systems List */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                        Your AI Systems ({systems.length})
                    </h2>

                    {systems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No AI systems yet</h3>
                            <p>Click "Add New System" to start your first EU AI Act assessment</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {systems.map((system) => {
                                const status = getSystemStatus(system);

                                return (
                                    <div
                                        key={system.id}
                                        onClick={() => handleSystemClick(system.id)}
                                        style={{
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: '#fafafa'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#6030c9';
                                            e.currentTarget.style.backgroundColor = '#f8f7ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.backgroundColor = '#fafafa';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                                    {system.name}
                                                </h3>
                                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                                                    {system.description || 'No description provided'}
                                                </p>
                                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
                                                    <span>Stage: {system.development_stage}</span>
                                                    <span>Created: {new Date(system.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                                <div style={{
                                                    color: status.color,
                                                    fontWeight: '600',
                                                    fontSize: '14px',
                                                    marginBottom: '8px'
                                                }}>
                                                    {status.text}
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{
                                                    width: '100px',
                                                    height: '6px',
                                                    backgroundColor: '#e5e7eb',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${status.progress}%`,
                                                        height: '100%',
                                                        backgroundColor: status.color,
                                                        transition: 'width 0.3s ease'
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default RiskAssessmentPage;
