import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step2Data {
    business_domain: string;
    primary_purpose: string;
    target_users: string[];
    typical_use_case: string;
    deployment_location: string[];
    automated_decisions_legal_effects: string;
}

interface Step2Props {
    systemId: string;
    initialData?: {
        business_domain?: string;
        primary_purpose?: string;
        target_users?: any;
        typical_use_case?: string;
        deployment_location?: any;
        automated_decisions_legal_effects?: string;
    };
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
        business_domain: '',
        primary_purpose: '',
        target_users: [],
        typical_use_case: '',
        deployment_location: [],
        automated_decisions_legal_effects: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                business_domain: initialData.business_domain || '',
                primary_purpose: initialData.primary_purpose || '',
                target_users: parseArrayField(initialData.target_users) || [],
                typical_use_case: initialData.typical_use_case || '',
                deployment_location: parseArrayField(initialData.deployment_location) || [],
                automated_decisions_legal_effects: initialData.automated_decisions_legal_effects || ''
            });
        }
    }, [initialData]);

    const parseArrayField = (field: any): string[] => {
        if (Array.isArray(field)) return field;
        if (typeof field === 'string') {
            try {
                return JSON.parse(field);
            } catch {
                return [];
            }
        }
        return [];
    };

    const handleInputChange = (field: keyof Omit<Step2Data, 'target_users' | 'deployment_location'>, value: string) => {
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

    const handleArrayChange = (field: keyof Pick<Step2Data, 'target_users' | 'deployment_location'>, value: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));

        // Clear error when user makes selection
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.business_domain) {
            newErrors.business_domain = 'Please select a business domain';
        }

        if (!formData.primary_purpose.trim()) {
            newErrors.primary_purpose = 'Please describe the primary purpose';
        } else if (formData.primary_purpose.trim().length < 10) {
            newErrors.primary_purpose = 'Please provide more detailed description (at least 10 characters)';
        }

        if (formData.target_users.length === 0) {
            newErrors.target_users = 'Please select at least one target user group';
        }

        if (!formData.typical_use_case.trim()) {
            newErrors.typical_use_case = 'Please describe a typical use case';
        }

        if (formData.deployment_location.length === 0) {
            newErrors.deployment_location = 'Please select at least one deployment location';
        }

        if (!formData.automated_decisions_legal_effects) {
            newErrors.automated_decisions_legal_effects = 'Please answer this question about automated decisions';
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
        if (!formData.business_domain) {
            setErrors({ business_domain: 'At least select a business domain to save draft' });
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

    const businessDomainOptions = [
        { value: 'hr', label: 'HR' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'finance', label: 'Finance' },
        { value: 'security', label: 'Security' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'legal', label: 'Legal' },
        { value: 'education', label: 'Education' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'other', label: 'Other' }
    ];

    const targetUserOptions = [
        { id: 'internal_employees', label: 'Internal employees' },
        { id: 'general_public', label: 'General public' },
        { id: 'b2b_clients', label: 'B2B clients' },
        { id: 'government', label: 'Government' },
        { id: 'children', label: 'Children' },
        { id: 'elderly', label: 'Elderly' }
    ];

    const deploymentLocationOptions = [
        { id: 'eu', label: 'EU' },
        { id: 'non_eu', label: 'Non-EU' },
        { id: 'global', label: 'Global' }
    ];

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
                    Purpose and Business Domain
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Provide information about your AI system's business context, target users, and deployment scope.
                </p>
            </div>

            {/* Business Domain */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the primary business domain? *
                </label>
                <select
                    value={formData.business_domain}
                    onChange={(e) => handleInputChange('business_domain', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.business_domain ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = errors.business_domain ? '#dc3545' : '#ddd'}
                >
                    <option value="">Select business domain...</option>
                    {businessDomainOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {errors.business_domain && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.business_domain}
                    </div>
                )}
            </div>

            {/* Primary Purpose */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the primary purpose of the system? *
                </label>
                <textarea
                    value={formData.primary_purpose}
                    onChange={(e) => handleInputChange('primary_purpose', e.target.value)}
                    placeholder="Describe what your AI system is designed to accomplish, what problems it solves, and its main functionality..."
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.primary_purpose ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = errors.primary_purpose ? '#dc3545' : '#ddd'}
                />
                {errors.primary_purpose && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.primary_purpose}
                    </div>
                )}
            </div>

            {/* Target Users */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Who are the target users? * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.target_users ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                }}>
                    {targetUserOptions.map((option) => (
                        <label
                            key={option.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.target_users.includes(option.id)}
                                onChange={(e) => handleArrayChange('target_users', option.id, e.target.checked)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.target_users && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.target_users}
                    </div>
                )}
            </div>

            {/* Typical Use Case */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Briefly describe a typical use case *
                </label>
                <textarea
                    value={formData.typical_use_case}
                    onChange={(e) => handleInputChange('typical_use_case', e.target.value)}
                    placeholder="Describe a typical scenario where your AI system would be used, including the context, user interaction, and expected outcome..."
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.typical_use_case ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = errors.typical_use_case ? '#dc3545' : '#ddd'}
                />
                {errors.typical_use_case && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.typical_use_case}
                    </div>
                )}
            </div>

            {/* Deployment Location */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Where will this system be deployed? * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.deployment_location ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    gap: '16px'
                }}>
                    {deploymentLocationOptions.map((option) => (
                        <label
                            key={option.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                minWidth: '100px',
                                justifyContent: 'center'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.deployment_location.includes(option.id)}
                                onChange={(e) => handleArrayChange('deployment_location', option.id, e.target.checked)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.deployment_location && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.deployment_location}
                    </div>
                )}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    This affects which regulatory requirements apply to your system
                </div>
            </div>

            {/* Automated Decisions */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Does the system make or assist in automated decisions with legal/significant effects? *
                </label>

                <div style={{
                    border: errors.automated_decisions_legal_effects ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {[
                        { value: 'yes', label: 'Yes', description: 'The system makes or significantly influences decisions that have legal or similar significant effects on individuals' },
                        { value: 'no', label: 'No', description: 'The system provides recommendations or insights but does not make decisions with legal/significant effects' },
                        { value: 'not_sure', label: 'Not Sure', description: 'Uncertain about whether the decisions have legal or significant effects' }
                    ].map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.automated_decisions_legal_effects === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.automated_decisions_legal_effects === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="automated_decisions_legal_effects"
                                value={option.value}
                                checked={formData.automated_decisions_legal_effects === option.value}
                                onChange={(e) => handleInputChange('automated_decisions_legal_effects', e.target.value)}
                                style={{ marginTop: '2px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                    {option.label}
                                </div>
                                <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                                    {option.description}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>

                {errors.automated_decisions_legal_effects && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.automated_decisions_legal_effects}
                    </div>
                )}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    Examples of legal/significant effects: hiring decisions, loan approvals, insurance eligibility, medical diagnoses, benefit determinations
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
