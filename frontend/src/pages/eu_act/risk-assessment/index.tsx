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

type RiskLevel = 'all' | 'high' | 'limited' | 'minimal' | 'unacceptable';

const RiskAssessmentPage: React.FC = () => {
    const router = useRouter();
    const [systems, setSystems] = useState<AISystemWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<RiskLevel>('all');

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

            const response = await aiSystemsApi.createAISystem({
                name: 'New AI System',
                description: '',
                development_stage: 'planning'
            });

            if (response.success && response.data?.ai_system) {
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

    const getSystemDetails = (system: AISystemWithDetails) => {
        const assessment = system.ai_system_assessments?.[0];
        const classification = system.ai_system_classification_results?.[0];

        if (classification) {
            return {
                riskLevel: classification.risk_level,
                progress: 100,
                status: 'Completed',
                statusDetail: 'Assessment complete',
                color: getRiskColor(classification.risk_level),
                category: getCategoryFromRisk(classification.risk_level)
            };
        }

        if (assessment) {
            const progress = (assessment.completed_steps / 4) * 100;
            return {
                riskLevel: 'in-progress',
                progress,
                status: `Step ${assessment.current_step}/4`,
                statusDetail: getStatusDetail(assessment.current_step, progress),
                color: '#6030c9',
                category: 'Assessment in progress'
            };
        }

        return {
            riskLevel: 'not-started',
            progress: 0,
            status: 'Not Started',
            statusDetail: 'Assessment needed',
            color: '#666',
            category: 'Pending'
        };
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'unacceptable': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'limited': return '#ffc107';
            case 'minimal': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getCategoryFromRisk = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high': return 'High Risk';
            case 'limited': return 'Limited Risk';
            case 'minimal': return 'Minimal Risk';
            case 'unacceptable': return 'Prohibited';
            default: return 'Unknown';
        }
    };

    const getStatusDetail = (currentStep: number, progress: number) => {
        if (progress < 25) return 'Basic information needed';
        if (progress < 50) return 'Purpose analysis needed';
        if (progress < 75) return 'Risk assessment needed';
        return 'Final review needed';
    };

    const getDeadline = (system: AISystemWithDetails) => {
        // Mock deadline calculation - in real app, this would be based on system type and compliance requirements
        const baseDate = new Date(system.created_at);
        const deadline = new Date(baseDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days from creation
        const now = new Date();
        const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        return {
            date: deadline.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            daysRemaining: Math.max(0, daysRemaining)
        };
    };

    const filterSystemsByRisk = (systems: AISystemWithDetails[], riskFilter: RiskLevel) => {
        if (riskFilter === 'all') return systems;

        return systems.filter(system => {
            const details = getSystemDetails(system);
            return details.riskLevel === riskFilter;
        });
    };

    const getRiskCounts = (systems: AISystemWithDetails[]) => {
        const counts = {
            all: systems.length,
            high: 0,
            limited: 0,
            minimal: 0,
            unacceptable: 0
        };

        systems.forEach(system => {
            const details = getSystemDetails(system);
            if (details.riskLevel in counts) {
                counts[details.riskLevel as keyof typeof counts]++;
            }
        });

        return counts;
    };

    const filteredSystems = filterSystemsByRisk(systems, activeTab);
    const riskCounts = getRiskCounts(systems);

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
            <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px'
                }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#1e252e',
                        margin: 0
                    }}>
                        AI Systems Registry
                    </h1>

                    <button
                        onClick={handleCreateSystem}
                        disabled={creating}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#4285f4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: creating ? 'not-allowed' : 'pointer',
                            opacity: creating ? 0.7 : 1,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>+</span>
                        {creating ? 'Creating...' : 'Add New AI System'}
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

                {/* Tab Navigation */}
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e5e7eb' }}>
                        {[
                            { key: 'all', label: 'All Systems', count: riskCounts.all },
                            { key: 'high', label: 'High Risk', count: riskCounts.high },
                            { key: 'limited', label: 'Limited Risk', count: riskCounts.limited },
                            { key: 'minimal', label: 'Minimal Risk', count: riskCounts.minimal }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as RiskLevel)}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: activeTab === tab.key ? '#4285f4' : '#666',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === tab.key ? '2px solid #4285f4' : '2px solid transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Systems Grid */}
                {filteredSystems.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 40px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#333' }}>
                            {activeTab === 'all' ? 'No AI systems yet' : `No ${activeTab} risk systems`}
                        </h3>
                        <p style={{ color: '#666' }}>
                            {activeTab === 'all'
                                ? 'Click "Add New AI System" to start your first EU AI Act assessment'
                                : `Switch to "All Systems" to see your complete inventory`
                            }
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {filteredSystems.map((system) => {
                            const details = getSystemDetails(system);
                            const deadline = getDeadline(system);

                            return (
                                <div
                                    key={system.id}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        borderLeft: `4px solid ${details.color}`,
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    {/* Header Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: '20px',
                                                fontWeight: '600',
                                                color: '#333',
                                                marginBottom: '8px'
                                            }}>
                                                {system.name}
                                            </h3>
                                            <p style={{
                                                color: '#666',
                                                fontSize: '14px',
                                                margin: 0
                                            }}>
                                                {details.category} • {system.development_stage}
                                            </p>
                                        </div>

                                        <div style={{
                                            backgroundColor: getRiskColor(details.riskLevel),
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {details.riskLevel === 'in-progress' ? 'IN PROGRESS' :
                                                details.riskLevel === 'not-started' ? 'PENDING' :
                                                    details.category.toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Deadline Row */}
                                    {details.riskLevel !== 'not-started' && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '16px',
                                            color: deadline.daysRemaining <= 7 ? '#dc3545' : '#666',
                                            fontSize: '14px'
                                        }}>
                                            <span>📅</span>
                                            <span>
                                                Deadline: {deadline.date}
                                                {deadline.daysRemaining > 0 && (
                                                    <span> ({deadline.daysRemaining} days remaining)</span>
                                                )}
                                                {deadline.daysRemaining <= 0 && (
                                                    <span style={{ color: '#dc3545', fontWeight: '600' }}> (Overdue)</span>
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {/* Progress Row */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        }}>
                                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                                                {Math.round(details.progress)}% Complete
                                            </span>
                                            <span style={{ fontSize: '14px', color: '#666' }}>
                                                {details.statusDetail}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${details.progress}%`,
                                                height: '100%',
                                                backgroundColor: details.color,
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => router.push(`/eu_act/risk-assessment/${system.id}`)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                color: '#666',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = '#4285f4';
                                                e.currentTarget.style.color = '#4285f4';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = '#ddd';
                                                e.currentTarget.style.color = '#666';
                                            }}
                                        >
                                            👁 View Details
                                        </button>

                                        <button
                                            onClick={() => router.push(`/eu_act/risk-assessment/${system.id}`)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#4285f4',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: 'white',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#3367d6';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#4285f4';
                                            }}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default RiskAssessmentPage;
