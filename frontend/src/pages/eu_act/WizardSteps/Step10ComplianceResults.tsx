import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step10Data {
    existing_governance_framework: string;
    governance_details: string;
    documentation_status: string;
    risk_management_system: string;
    conformity_assessment_ready: string;
    ai_compliance_officer: string;
}

interface ClassificationResult {
    risk_level: string;
    primary_reason: string;
    confidence_level: string;
    article_5_violation: boolean;
    annex_iii_match: boolean;
    has_exceptions: boolean;
}

interface Step10Props {
    systemId: string;
    initialData?: {
        existing_governance_framework?: any;
        governance_details?: string;
        documentation_status?: string;
        risk_management_system?: any;
        conformity_assessment_ready?: any;
        ai_compliance_officer?: string;
    };
    onNext: (data: Step10Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step10ComplianceResults: React.FC<Step10Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step10Data>({
        existing_governance_framework: '',
        governance_details: '',
        documentation_status: '',
        risk_management_system: '',
        conformity_assessment_ready: '',
        ai_compliance_officer: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [classification, setClassification] = useState<ClassificationResult | null>(null);
    const [classifying, setClassifying] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                existing_governance_framework: initialData.existing_governance_framework ? 'yes' : initialData.existing_governance_framework === false ? 'no' : '',
                governance_details: initialData.governance_details || '',
                documentation_status: initialData.documentation_status || '',
                risk_management_system: initialData.risk_management_system ? 'yes' : initialData.risk_management_system === false ? 'no' : '',
                conformity_assessment_ready: initialData.conformity_assessment_ready ? 'yes' : initialData.conformity_assessment_ready === false ? 'no' : '',
                ai_compliance_officer: initialData.ai_compliance_officer || ''
            });
        }
    }, [initialData]);

    const handleInputChange = (field: keyof Step10Data, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user makes selection
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.existing_governance_framework) {
            newErrors.existing_governance_framework = 'Please specify if you have an AI governance framework';
        }

        if (!formData.documentation_status) {
            newErrors.documentation_status = 'Please specify your documentation status';
        }

        if (!formData.risk_management_system) {
            newErrors.risk_management_system = 'Please specify if you have a risk management system';
        }

        if (!formData.conformity_assessment_ready) {
            newErrors.conformity_assessment_ready = 'Please specify your conformity assessment readiness';
        }

        if (!formData.ai_compliance_officer) {
            newErrors.ai_compliance_officer = 'Please specify if you have appointed an AI compliance officer';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClassifySystem = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setClassifying(true);
            console.log('🔄 Starting classification process...');

            // First save the current step data
            console.log('💾 Saving step 10 data...');
            await aiSystemsApi.updateAssessmentStep(systemId, {
                step: 10,
                data: formData
            });
            console.log('✅ Step 10 data saved');

            // Then classify the system
            console.log('🎯 Calling classification API...');
            const classificationResponse = await aiSystemsApi.classifyAISystem(systemId);
            console.log('📊 Classification response:', classificationResponse);

            if (classificationResponse.success) {
                console.log('✅ Classification successful:', classificationResponse.data);
                setClassification(classificationResponse.data);
                setShowResults(true);
            } else {
                console.error('❌ Classification failed:', classificationResponse);
                setErrors({
                    submit: 'Failed to classify system. Please try again.'
                });
            }

        } catch (error) {
            console.error('❌ Error classifying system:', error);
            setErrors({
                submit: 'Failed to classify system. Please try again.'
            });
        } finally {
            setClassifying(false);
        }
    };

    const handleSaveDraft = async () => {
        try {
            setSaving(true);

            await aiSystemsApi.updateAssessmentStep(systemId, {
                step: 10,
                data: {
                    ...formData,
                    is_draft: true
                }
            });

            alert('Draft saved successfully!');

        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleFinish = () => {
        onNext(formData);
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'unacceptable': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'limited': return '#ffc107';
            case 'minimal': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getRiskLevelIcon = (riskLevel: string) => {
        switch (riskLevel) {
            case 'unacceptable': return '🚫';
            case 'high': return '⚠️';
            case 'limited': return '⚡';
            case 'minimal': return '✅';
            default: return '❓';
        }
    };

    const getComplianceChecklist = (riskLevel: string) => {
        const baseItems = [
            'Document AI system purpose and functionality',
            'Establish data governance procedures',
            'Implement appropriate transparency measures'
        ];

        switch (riskLevel) {
            case 'unacceptable':
                return [
                    '🚫 SYSTEM PROHIBITED - Do not deploy',
                    'Review system design to eliminate prohibited practices',
                    'Consider alternative approaches that comply with AI Act'
                ];
            case 'high':
                return [
                    ...baseItems,
                    'Implement comprehensive risk management system',
                    'Establish detailed technical documentation',
                    'Set up quality management system',
                    'Implement human oversight measures',
                    'Ensure accuracy, robustness and cybersecurity',
                    'Register system in EU database before deployment',
                    'Conduct conformity assessment',
                    'Apply CE marking (if applicable)',
                    'Implement post-market monitoring'
                ];
            case 'limited':
                return [
                    ...baseItems,
                    'Ensure users are informed about AI interaction',
                    'Implement appropriate user notifications',
                    'Maintain basic documentation'
                ];
            case 'minimal':
                return [
                    'Maintain basic system documentation',
                    'Monitor for any changes that might affect risk level'
                ];
            default:
                return baseItems;
        }
    };

    const getTimelineAndSteps = (riskLevel: string) => {
        const currentDate = new Date();
        const addMonths = (date: Date, months: number) => {
            const result = new Date(date);
            result.setMonth(result.getMonth() + months);
            return result.toLocaleDateString();
        };

        switch (riskLevel) {
            case 'unacceptable':
                return {
                    immediate: 'Stop development/deployment immediately',
                    short_term: 'Redesign system architecture (1-3 months)',
                    long_term: 'Re-assess modified system'
                };
            case 'high':
                return {
                    immediate: 'Begin compliance preparation immediately',
                    short_term: `Complete technical documentation by ${addMonths(currentDate, 3)}`,
                    medium_term: `Conduct conformity assessment by ${addMonths(currentDate, 6)}`,
                    long_term: `Register in EU database before deployment (by ${addMonths(currentDate, 12)})`
                };
            case 'limited':
                return {
                    immediate: 'Implement user notification mechanisms',
                    short_term: `Complete transparency documentation by ${addMonths(currentDate, 1)}`,
                    long_term: 'Monitor for compliance with transparency obligations'
                };
            case 'minimal':
                return {
                    immediate: 'Document current system state',
                    short_term: 'Establish monitoring procedures',
                    long_term: 'Periodic review for risk level changes'
                };
            default:
                return {
                    immediate: 'Complete system assessment',
                    short_term: 'Implement identified measures',
                    long_term: 'Maintain compliance monitoring'
                };
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Loading step data...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e252e', marginBottom: '8px' }}>
                    Compliance Readiness & Results
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Complete your governance assessment and get your final AI Act risk classification.
                </p>
            </div>

            {!showResults ? (
                <>
                    {/* Compliance Questions */}
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                            Governance & Compliance Readiness
                        </h3>

                        {/* Question 1: AI Governance Framework */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '12px',
                                fontWeight: '500',
                                color: '#333',
                                fontSize: '16px'
                            }}>
                                Do you have an internal AI governance framework? *
                            </label>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginBottom: '12px',
                                border: errors.existing_governance_framework ? '1px solid #dc3545' : 'none',
                                borderRadius: '6px',
                                padding: errors.existing_governance_framework ? '8px' : '0'
                            }}>
                                {[
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no', label: 'No' }
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            backgroundColor: formData.existing_governance_framework === option.value ? '#f8f7ff' : '#f7fafc',
                                            border: `1px solid ${formData.existing_governance_framework === option.value ? '#6030c9' : '#e2e8f0'}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="existing_governance_framework"
                                            value={option.value}
                                            checked={formData.existing_governance_framework === option.value}
                                            onChange={(e) => handleInputChange('existing_governance_framework', e.target.value)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>

                            {formData.existing_governance_framework === 'yes' && (
                                <textarea
                                    value={formData.governance_details}
                                    onChange={(e) => handleInputChange('governance_details', e.target.value)}
                                    placeholder="Briefly describe your AI governance framework..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        minHeight: '60px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            )}

                            {errors.existing_governance_framework && (
                                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                                    {errors.existing_governance_framework}
                                </div>
                            )}
                        </div>

                        {/* Question 2: Documentation Status */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '12px',
                                fontWeight: '500',
                                color: '#333',
                                fontSize: '16px'
                            }}>
                                What is your documentation status? *
                            </label>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                border: errors.documentation_status ? '1px solid #dc3545' : 'none',
                                borderRadius: '6px',
                                padding: errors.documentation_status ? '8px' : '0'
                            }}>
                                {[
                                    { value: 'complete', label: 'Complete' },
                                    { value: 'partial', label: 'Partial' },
                                    { value: 'none', label: 'None' }
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            backgroundColor: formData.documentation_status === option.value ? '#f8f7ff' : '#f7fafc',
                                            border: `1px solid ${formData.documentation_status === option.value ? '#6030c9' : '#e2e8f0'}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="documentation_status"
                                            value={option.value}
                                            checked={formData.documentation_status === option.value}
                                            onChange={(e) => handleInputChange('documentation_status', e.target.value)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>

                            {errors.documentation_status && (
                                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                                    {errors.documentation_status}
                                </div>
                            )}
                        </div>

                        {/* Question 3: Risk Management System */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '12px',
                                fontWeight: '500',
                                color: '#333',
                                fontSize: '16px'
                            }}>
                                Is a risk management system established? *
                            </label>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                border: errors.risk_management_system ? '1px solid #dc3545' : 'none',
                                borderRadius: '6px',
                                padding: errors.risk_management_system ? '8px' : '0'
                            }}>
                                {[
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no', label: 'No' }
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            backgroundColor: formData.risk_management_system === option.value ? '#f8f7ff' : '#f7fafc',
                                            border: `1px solid ${formData.risk_management_system === option.value ? '#6030c9' : '#e2e8f0'}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="risk_management_system"
                                            value={option.value}
                                            checked={formData.risk_management_system === option.value}
                                            onChange={(e) => handleInputChange('risk_management_system', e.target.value)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>

                            {errors.risk_management_system && (
                                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                                    {errors.risk_management_system}
                                </div>
                            )}
                        </div>

                        {/* Question 4: Conformity Assessment */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '12px',
                                fontWeight: '500',
                                color: '#333',
                                fontSize: '16px'
                            }}>
                                Are you ready for conformity assessment (if needed)? *
                            </label>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                border: errors.conformity_assessment_ready ? '1px solid #dc3545' : 'none',
                                borderRadius: '6px',
                                padding: errors.conformity_assessment_ready ? '8px' : '0'
                            }}>
                                {[
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no', label: 'No' },
                                    { value: 'not_sure', label: 'Not Sure' }
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            backgroundColor: formData.conformity_assessment_ready === option.value ? '#f8f7ff' : '#f7fafc',
                                            border: `1px solid ${formData.conformity_assessment_ready === option.value ? '#6030c9' : '#e2e8f0'}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="conformity_assessment_ready"
                                            value={option.value}
                                            checked={formData.conformity_assessment_ready === option.value}
                                            onChange={(e) => handleInputChange('conformity_assessment_ready', e.target.value)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>

                            {errors.conformity_assessment_ready && (
                                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                                    {errors.conformity_assessment_ready}
                                </div>
                            )}
                        </div>

                        {/* Question 5: AI Compliance Officer */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '12px',
                                fontWeight: '500',
                                color: '#333',
                                fontSize: '16px'
                            }}>
                                Have you appointed an AI Compliance Officer or responsible role? *
                            </label>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                border: errors.ai_compliance_officer ? '1px solid #dc3545' : 'none',
                                borderRadius: '6px',
                                padding: errors.ai_compliance_officer ? '8px' : '0'
                            }}>
                                {[
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no', label: 'No' }
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            backgroundColor: formData.ai_compliance_officer === option.value ? '#f8f7ff' : '#f7fafc',
                                            border: `1px solid ${formData.ai_compliance_officer === option.value ? '#6030c9' : '#e2e8f0'}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="ai_compliance_officer"
                                            value={option.value}
                                            checked={formData.ai_compliance_officer === option.value}
                                            onChange={(e) => handleInputChange('ai_compliance_officer', e.target.value)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>

                            {errors.ai_compliance_officer && (
                                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                                    {errors.ai_compliance_officer}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div style={{
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '8px',
                            padding: '12px',
                            color: '#721c24',
                            marginBottom: '24px'
                        }}>
                            {errors.submit}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '40px',
                        gap: '16px'
                    }}>
                        {/* Left side - Save Draft */}
                        <button
                            onClick={handleSaveDraft}
                            disabled={saving || classifying}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'transparent',
                                border: '2px solid #6030c9',
                                borderRadius: '8px',
                                color: '#6030c9',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: (saving || classifying) ? 'not-allowed' : 'pointer',
                                opacity: (saving || classifying) ? 0.7 : 1,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>

                        {/* Right side - Navigation */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    disabled={saving || classifying}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        color: '#666',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: (saving || classifying) ? 'not-allowed' : 'pointer',
                                        opacity: (saving || classifying) ? 0.7 : 1
                                    }}
                                >
                                    ← Back
                                </button>
                            )}

                            <button
                                onClick={handleClassifySystem}
                                disabled={saving || classifying}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#28a745',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: (saving || classifying) ? 'not-allowed' : 'pointer',
                                    opacity: (saving || classifying) ? 0.7 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {classifying ? 'Classifying...' : 'Complete Assessment & Get Results →'}
                            </button>

                            {/* Temporary debug button */}
                            <button
                                onClick={async () => {
                                    console.log('🧪 Testing classification directly...');
                                    try {
                                        const response = await aiSystemsApi.classifyAISystem(systemId);
                                        console.log('🧪 Direct classification response:', response);
                                        if (response.success) {
                                            setClassification(response.data);
                                            setShowResults(true);
                                        }
                                    } catch (error) {
                                        console.error('🧪 Direct classification failed:', error);
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#007bff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    marginLeft: '8px'
                                }}
                            >
                                🧪 Test Classification
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Results Section */}
                    <div style={{ marginBottom: '40px' }}>
                        {/* Risk Classification Result */}
                        <div style={{
                            backgroundColor: 'white',
                            border: `3px solid ${getRiskLevelColor(classification?.risk_level || '')}`,
                            borderRadius: '12px',
                            padding: '24px',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                                {getRiskLevelIcon(classification?.risk_level || '')}
                            </div>
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: getRiskLevelColor(classification?.risk_level || ''),
                                marginBottom: '8px',
                                textTransform: 'uppercase'
                            }}>
                                {classification?.risk_level?.replace('_', ' ')} RISK
                            </h3>
                            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                                {classification?.primary_reason}
                            </p>
                        </div>

                        {/* Compliance Checklist */}
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
                                📋 Tailored Compliance Checklist
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {getComplianceChecklist(classification?.risk_level || '').map((item, index) => (
                                    <li key={index} style={{
                                        padding: '8px 0',
                                        borderBottom: index < getComplianceChecklist(classification?.risk_level || '').length - 1 ? '1px solid #dee2e6' : 'none',
                                        fontSize: '14px',
                                        color: item.startsWith('🚫') ? '#dc3545' : '#333'
                                    }}>
                                        • {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Timeline and Next Steps */}
                        <div style={{
                            backgroundColor: '#e3f2fd',
                            border: '1px solid #2196f3',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1565c0', marginBottom: '16px' }}>
                                🗓️ Timeline & Next Steps
                            </h4>
                            {(() => {
                                const timeline = getTimelineAndSteps(classification?.risk_level || '');
                                return (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <div>
                                            <strong style={{ color: '#1565c0' }}>Immediate Actions:</strong>
                                            <div style={{ color: '#333', fontSize: '14px' }}>{timeline.immediate}</div>
                                        </div>
                                        {timeline.short_term && (
                                            <div>
                                                <strong style={{ color: '#1565c0' }}>Short Term:</strong>
                                                <div style={{ color: '#333', fontSize: '14px' }}>{timeline.short_term}</div>
                                            </div>
                                        )}
                                        {timeline.medium_term && (
                                            <div>
                                                <strong style={{ color: '#1565c0' }}>Medium Term:</strong>
                                                <div style={{ color: '#333', fontSize: '14px' }}>{timeline.medium_term}</div>
                                            </div>
                                        )}
                                        {timeline.long_term && (
                                            <div>
                                                <strong style={{ color: '#1565c0' }}>Long Term:</strong>
                                                <div style={{ color: '#333', fontSize: '14px' }}>{timeline.long_term}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Classification Details */}
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            padding: '16px',
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                <div><strong>Article 5 Violation:</strong> {classification?.article_5_violation ? 'Yes' : 'No'}</div>
                                <div><strong>Annex III Match:</strong> {classification?.annex_iii_match ? 'Yes' : 'No'}</div>
                                <div><strong>Has Exceptions:</strong> {classification?.has_exceptions ? 'Yes' : 'No'}</div>
                                <div><strong>Confidence Level:</strong> {classification?.confidence_level}</div>
                            </div>
                        </div>
                    </div>

                    {/* Final Actions */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        marginTop: '40px'
                    }}>
                        <button
                            onClick={() => window.print()}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#6c757d',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            📄 Print Report
                        </button>

                        <button
                            onClick={handleFinish}
                            style={{
                                padding: '12px 32px',
                                backgroundColor: '#28a745',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ✅ Complete Assessment
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Step10ComplianceResults;
