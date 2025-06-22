// src/pages/eu_act/WizardSteps/Step4ResultsClassification.tsx
import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface ClassificationResult {
    id: string;
    ai_system_id: string;
    risk_level: string;
    primary_reason: string;
    confidence_level: string;
    article_5_violation: boolean;
    annex_iii_match: boolean;
    compliance_requirements: any[];
    created_at: string;
}

interface Step4Props {
    systemId: string;
    onBack?: () => void;
    onComplete?: () => void;
    loading?: boolean;
}

const Step4ResultsClassification: React.FC<Step4Props> = ({
    systemId,
    onBack,
    onComplete,
    loading = false
}) => {
    const [classifying, setClassifying] = useState(false);
    const [classification, setClassification] = useState<ClassificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        // Auto-run classification when component loads
        runClassification();
    }, [systemId]);

    const runClassification = async () => {
        try {
            setClassifying(true);
            setError(null);

            const response = await aiSystemsApi.classifyAISystem(systemId);

            if (response.success && response.data) {
                setClassification(response.data);
            } else {
                setError('Failed to classify AI system. Please try again.');
            }
        } catch (err) {
            console.error('Classification error:', err);
            setError('Failed to classify AI system. Please check your assessment data and try again.');
        } finally {
            setClassifying(false);
        }
    };

    const getRiskLevelInfo = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'unacceptable':
                return {
                    color: '#dc3545',
                    backgroundColor: '#f8d7da',
                    borderColor: '#f5c6cb',
                    icon: '🚫',
                    title: 'Unacceptable Risk',
                    subtitle: 'Prohibited AI System',
                    description: 'This AI system is prohibited under Article 5 of the EU AI Act and cannot be deployed.'
                };
            case 'high':
                return {
                    color: '#fd7e14',
                    backgroundColor: '#fff3cd',
                    borderColor: '#ffeaa7',
                    icon: '⚠️',
                    title: 'High Risk',
                    subtitle: 'Strict Compliance Required',
                    description: 'This AI system requires comprehensive compliance measures including technical documentation, risk management, and conformity assessment.'
                };
            case 'limited':
                return {
                    color: '#ffc107',
                    backgroundColor: '#fff8e1',
                    borderColor: '#ffecb3',
                    icon: '⚡',
                    title: 'Limited Risk',
                    subtitle: 'Transparency Obligations',
                    description: 'This AI system must comply with transparency requirements and inform users they are interacting with an AI system.'
                };
            case 'minimal':
                return {
                    color: '#28a745',
                    backgroundColor: '#d4edda',
                    borderColor: '#c3e6cb',
                    icon: '✅',
                    title: 'Minimal Risk',
                    subtitle: 'Voluntary Best Practices',
                    description: 'This AI system has minimal compliance requirements. Voluntary adherence to AI ethics guidelines is recommended.'
                };
            default:
                return {
                    color: '#6c757d',
                    backgroundColor: '#f8f9fa',
                    borderColor: '#dee2e6',
                    icon: '❓',
                    title: 'Unknown Risk',
                    subtitle: 'Assessment Needed',
                    description: 'Unable to determine risk level. Please review your assessment data.'
                };
        }
    };

    const getComplianceRequirements = (riskLevel: string, articleViolation: boolean, annexMatch: boolean) => {
        if (articleViolation) {
            return [
                'Immediate cessation of development/deployment',
                'System cannot be placed on the EU market',
                'Review system design to eliminate prohibited practices',
                'Consider alternative approaches that comply with Article 5'
            ];
        }

        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return [
                    'Technical documentation (Article 11)',
                    'Risk management system (Article 9)',
                    'Data governance and management (Article 10)',
                    'Human oversight measures (Article 14)',
                    'Accuracy, robustness and cybersecurity (Article 15)',
                    'Conformity assessment procedure',
                    'CE marking and EU declaration of conformity',
                    'Registration in EU database',
                    'Quality management system',
                    'Post-market monitoring system'
                ];
            case 'limited':
                return [
                    'Transparency obligations - inform users about AI interaction',
                    'Design system to clearly indicate AI operation',
                    'Provide clear information about AI capabilities and limitations',
                    'Implement user notification mechanisms'
                ];
            case 'minimal':
                return [
                    'Voluntary codes of conduct (encouraged)',
                    'AI ethics guidelines compliance',
                    'Best practices for responsible AI development',
                    'Regular system monitoring and updates'
                ];
            default:
                return ['Assessment required to determine specific obligations'];
        }
    };

    const getTimelineInfo = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return {
                    title: 'Implementation Timeline',
                    deadline: 'August 2, 2026',
                    urgency: 'High',
                    description: 'High-risk AI systems must comply with all requirements by August 2026.'
                };
            case 'limited':
                return {
                    title: 'Implementation Timeline',
                    deadline: 'August 2, 2025',
                    urgency: 'Medium',
                    description: 'Transparency obligations must be implemented by August 2025.'
                };
            default:
                return {
                    title: 'Implementation Timeline',
                    deadline: 'No specific deadline',
                    urgency: 'Low',
                    description: 'Follow general AI Act provisions and best practices.'
                };
        }
    };

    const handleExportResults = async () => {
        if (!classification) return;

        try {
            setExporting(true);

            const exportData = {
                system_id: systemId,
                classification_date: new Date().toISOString(),
                risk_assessment_results: {
                    risk_level: classification.risk_level,
                    primary_reason: classification.primary_reason,
                    confidence_level: classification.confidence_level,
                    article_5_violation: classification.article_5_violation,
                    annex_iii_match: classification.annex_iii_match,
                    compliance_requirements: getComplianceRequirements(
                        classification.risk_level,
                        classification.article_5_violation,
                        classification.annex_iii_match
                    ),
                    timeline: getTimelineInfo(classification.risk_level)
                }
            };

            // Create and download JSON file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `eu-ai-act-assessment-${systemId}-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export results. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    if (loading || classifying) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
                <h3 style={{ marginBottom: '8px' }}>
                    {loading ? 'Loading assessment data...' : 'Running AI Act Classification...'}
                </h3>
                <p style={{ color: '#666' }}>
                    {classifying && 'Analyzing your responses against EU AI Act requirements...'}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '24px'
                }}>
                    <h3 style={{ color: '#721c24', marginBottom: '12px' }}>Classification Error</h3>
                    <p style={{ color: '#721c24', marginBottom: '16px' }}>{error}</p>
                    <button
                        onClick={runClassification}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
                {onBack && (
                    <button
                        onClick={onBack}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            color: '#666',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back to Risk Assessment
                    </button>
                )}
            </div>
        );
    }

    if (!classification) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>No classification results available.</div>
            </div>
        );
    }

    const riskInfo = getRiskLevelInfo(classification.risk_level);
    const requirements = getComplianceRequirements(
        classification.risk_level,
        classification.article_5_violation,
        classification.annex_iii_match
    );
    const timeline = getTimelineInfo(classification.risk_level);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e252e', marginBottom: '8px' }}>
                    EU AI Act Classification Results
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Based on your responses, here's your system's risk classification and compliance requirements
                </p>
            </div>

            {/* Risk Level Card */}
            <div style={{
                backgroundColor: riskInfo.backgroundColor,
                border: `2px solid ${riskInfo.borderColor}`,
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{riskInfo.icon}</div>
                <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: riskInfo.color,
                    marginBottom: '8px'
                }}>
                    {riskInfo.title}
                </h3>
                <p style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: riskInfo.color,
                    marginBottom: '12px'
                }}>
                    {riskInfo.subtitle}
                </p>
                <p style={{
                    fontSize: '16px',
                    color: '#333',
                    lineHeight: '1.5',
                    marginBottom: '20px'
                }}>
                    {riskInfo.description}
                </p>

                {/* Classification Details */}
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '20px'
                }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        <strong>Primary Reason:</strong> {classification.primary_reason}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        <strong>Confidence Level:</strong> {classification.confidence_level}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        <strong>Assessment Date:</strong> {new Date(classification.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Compliance Requirements */}
            <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h4 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    📋 Compliance Requirements
                </h4>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                }}>
                    {requirements.map((requirement, index) => (
                        <li key={index} style={{
                            padding: '12px 0',
                            borderBottom: index < requirements.length - 1 ? '1px solid #f0f0f0' : 'none',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px'
                        }}>
                            <span style={{
                                color: riskInfo.color,
                                fontWeight: '600',
                                minWidth: '20px'
                            }}>
                                {index + 1}.
                            </span>
                            <span style={{ color: '#333', lineHeight: '1.4' }}>
                                {requirement}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Timeline Information */}
            <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
            }}>
                <h4 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    ⏰ {timeline.title}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Compliance Deadline
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            {timeline.deadline}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Priority Level
                        </div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: timeline.urgency === 'High' ? '#dc3545' :
                                timeline.urgency === 'Medium' ? '#ffc107' : '#28a745'
                        }}>
                            {timeline.urgency}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Status
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            Assessment Complete
                        </div>
                    </div>
                </div>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '16px', marginBottom: 0 }}>
                    {timeline.description}
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
            }}>
                {/* Left side - Export */}
                <button
                    onClick={handleExportResults}
                    disabled={exporting}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#28a745',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: exporting ? 'not-allowed' : 'pointer',
                        opacity: exporting ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    📄 {exporting ? 'Exporting...' : 'Export Results'}
                </button>

                {/* Right side - Navigation */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                color: '#666',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            ← Back to Assessment
                        </button>
                    )}

                    <button
                        onClick={onComplete || (() => window.location.href = '/eu_act/risk-assessment')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6030c9',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Complete Assessment
                    </button>
                </div>
            </div>

            {/* Disclaimer */}
            <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '32px',
                fontSize: '12px',
                color: '#666',
                textAlign: 'center'
            }}>
                <strong>Disclaimer:</strong> This assessment is provided for informational purposes only and does not constitute legal advice.
                Please consult with qualified legal professionals for specific compliance guidance regarding the EU AI Act.
            </div>
        </div>
    );
};

export default Step4ResultsClassification;
