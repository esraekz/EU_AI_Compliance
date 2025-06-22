// src/pages/eu_act/WizardSteps/Step2PurposeAnalysis.tsx
import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step2Data {
    primary_purpose: string;
    purpose_details: string;
}

interface Step2Props {
    systemId: string;
    initialData?: Step2Data;
    onNext: (data: Step2Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step2PurposeAnalysis: React.FC<Step2Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step2Data>({
        primary_purpose: initialData?.primary_purpose || '',
        purpose_details: initialData?.purpose_details || ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                primary_purpose: initialData.primary_purpose || '',
                purpose_details: initialData.purpose_details || ''
            });
        }
    }, [initialData]);

    const handleInputChange = (field: keyof Step2Data, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.primary_purpose) {
            newErrors.primary_purpose = 'Please select the primary purpose of your AI system';
        }

        if (!formData.purpose_details.trim()) {
            newErrors.purpose_details = 'Purpose details are required';
        } else if (formData.purpose_details.trim().length < 20) {
            newErrors.purpose_details = 'Please provide more detailed description (at least 20 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAndContinue = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            // Save step data to backend
            await aiSystemsApi.updateAssessmentStep(systemId, {
                step: 2,
                data: formData
            });

            // Call parent's onNext handler
            onNext(formData);

        } catch (error) {
            console.error('Error saving Step 2:', error);
            setErrors({
                submit: 'Failed to save. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!formData.primary_purpose) {
            setErrors({ primary_purpose: 'At least select a primary purpose to save draft' });
            return;
        }

        try {
            setSaving(true);

            // Save current data without advancing step
            await aiSystemsApi.updateAssessmentStep(systemId, {
                step: 2,
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

    const purposeOptions = [
        {
            value: 'employment',
            label: 'Employment and Recruitment',
            description: 'CV screening, candidate evaluation, hiring decisions, employee management',
            riskIndicator: 'High Risk - Annex III'
        },
        {
            value: 'biometric',
            label: 'Biometric Identification',
            description: 'Facial recognition, fingerprint analysis, identity verification',
            riskIndicator: 'High Risk - Annex III'
        },
        {
            value: 'education',
            label: 'Education and Training',
            description: 'Student assessment, educational content delivery, skill evaluation',
            riskIndicator: 'High Risk - Annex III'
        },
        {
            value: 'healthcare',
            label: 'Healthcare and Medical',
            description: 'Diagnosis support, treatment recommendations, medical devices',
            riskIndicator: 'High Risk - Annex III'
        },
        {
            value: 'infrastructure',
            label: 'Critical Infrastructure',
            description: 'Power grid management, water systems, transportation control',
            riskIndicator: 'High Risk - Annex III'
        },
        {
            value: 'law_enforcement',
            label: 'Law Enforcement',
            description: 'Crime detection, evidence analysis, risk assessment (with restrictions)',
            riskIndicator: 'High Risk - Annex III'
        },
        {
            value: 'financial',
            label: 'Financial Services',
            description: 'Credit scoring, fraud detection, algorithmic trading, loan decisions',
            riskIndicator: 'Potentially High Risk'
        },
        {
            value: 'customer',
            label: 'Customer Service',
            description: 'Chatbots, recommendation systems, content personalization',
            riskIndicator: 'Limited Risk'
        },
        {
            value: 'content',
            label: 'Content Generation',
            description: 'Text generation, image creation, content moderation',
            riskIndicator: 'Limited Risk'
        },
        {
            value: 'automation',
            label: 'Process Automation',
            description: 'Workflow automation, document processing, task optimization',
            riskIndicator: 'Minimal Risk'
        },
        {
            value: 'analytics',
            label: 'Data Analytics',
            description: 'Business intelligence, predictive analytics, reporting',
            riskIndicator: 'Minimal Risk'
        },
        {
            value: 'other',
            label: 'Other/General Purpose',
            description: 'Not covered by above categories',
            riskIndicator: 'Assessment Needed'
        }
    ];

    const getRiskColor = (riskIndicator: string) => {
        if (riskIndicator.includes('High Risk')) return '#fd7e14';
        if (riskIndicator.includes('Limited Risk')) return '#ffc107';
        if (riskIndicator.includes('Minimal Risk')) return '#28a745';
        return '#6c757d';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Loading step data...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e252e', marginBottom: '8px' }}>
                    Purpose and Application Domain
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Select your AI system's primary purpose. This determines which EU AI Act provisions apply and the risk classification.
                </p>
            </div>

            {/* Primary Purpose Selection */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Primary Purpose *
                </label>

                <div style={{
                    display: 'grid',
                    gap: '12px',
                    border: errors.primary_purpose ? '2px solid #dc3545' : 'none',
                    borderRadius: '8px',
                    padding: errors.primary_purpose ? '8px' : '0'
                }}>
                    {purposeOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '16px',
                                border: `2px solid ${formData.primary_purpose === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                backgroundColor: formData.primary_purpose === option.value ? '#f8f7ff' : 'white'
                            }}
                            onMouseEnter={(e) => {
                                if (formData.primary_purpose !== option.value) {
                                    e.currentTarget.style.borderColor = '#d1d5db';
                                    e.currentTarget.style.backgroundColor = '#fafafa';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (formData.primary_purpose !== option.value) {
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                    e.currentTarget.style.backgroundColor = 'white';
                                }
                            }}
                        >
                            <input
                                type="radio"
                                name="primary_purpose"
                                value={option.value}
                                checked={formData.primary_purpose === option.value}
                                onChange={(e) => handleInputChange('primary_purpose', e.target.value)}
                                style={{ marginTop: '2px' }}
                            />

                            <div style={{ flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '4px'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#333',
                                        fontSize: '16px'
                                    }}>
                                        {option.label}
                                    </span>

                                    <span style={{
                                        backgroundColor: getRiskColor(option.riskIndicator),
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap',
                                        marginLeft: '12px'
                                    }}>
                                        {option.riskIndicator}
                                    </span>
                                </div>

                                <p style={{
                                    color: '#666',
                                    fontSize: '14px',
                                    margin: 0,
                                    lineHeight: '1.4'
                                }}>
                                    {option.description}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>

                {errors.primary_purpose && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.primary_purpose}
                    </div>
                )}
            </div>

            {/* Purpose Details */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Purpose Details *
                </label>
                <textarea
                    value={formData.purpose_details}
                    onChange={(e) => handleInputChange('purpose_details', e.target.value)}
                    placeholder="Provide more specific details about how your AI system works, who uses it, what decisions it makes, and its intended outcomes..."
                    rows={5}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.purpose_details ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = errors.purpose_details ? '#dc3545' : '#ddd'}
                />
                {errors.purpose_details && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.purpose_details}
                    </div>
                )}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    Be specific about the use case, target users, and decision-making process
                </div>
            </div>

            {/* Information Box */}
            {formData.primary_purpose && (
                <div style={{
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196F3',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#1565C0', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        💡 Important Information
                    </h4>
                    <p style={{ color: '#1565C0', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        {formData.primary_purpose === 'employment' &&
                            "Employment and recruitment AI systems are automatically classified as high-risk under Annex III. You'll need to comply with technical documentation, risk management, and transparency requirements."
                        }
                        {formData.primary_purpose === 'biometric' &&
                            "Biometric identification systems are high-risk and may include prohibited practices. Careful assessment of Article 5 restrictions is required."
                        }
                        {formData.primary_purpose === 'customer' &&
                            "Customer service AI systems typically require transparency obligations - users must be informed they're interacting with an AI system."
                        }
                        {formData.primary_purpose === 'healthcare' &&
                            "Healthcare AI systems are high-risk and require comprehensive compliance including safety documentation and conformity assessment."
                        }
                        {['analytics', 'automation'].includes(formData.primary_purpose) &&
                            "This use case typically falls under minimal risk with basic compliance requirements and voluntary best practices."
                        }
                        {!['employment', 'biometric', 'customer', 'healthcare', 'analytics', 'automation'].includes(formData.primary_purpose) &&
                            "This use case requires detailed risk assessment to determine the appropriate compliance requirements."
                        }
                    </p>
                </div>
            )}

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
                    disabled={saving}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        border: '2px solid #6030c9',
                        borderRadius: '8px',
                        color: '#6030c9',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
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
                            disabled={saving}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                color: '#666',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            ← Back
                        </button>
                    )}

                    <button
                        onClick={handleSaveAndContinue}
                        disabled={saving}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6030c9',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {saving ? 'Saving...' : 'Save & Continue →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step2PurposeAnalysis;
