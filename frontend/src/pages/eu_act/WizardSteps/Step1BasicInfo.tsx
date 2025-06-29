import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step1Data {
    system_name: string;
    system_description: string;
    development_stage: string;
    system_version: string;
    planned_deployment_timeline: string;
}

interface Step1Props {
    systemId: string;
    initialData?: Step1Data;
    onNext: (data: Step1Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step1BasicInfo: React.FC<Step1Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step1Data>({
        system_name: initialData?.system_name || '',
        system_description: initialData?.system_description || '',
        development_stage: initialData?.development_stage || 'planning',
        system_version: initialData?.system_version || '',
        planned_deployment_timeline: initialData?.planned_deployment_timeline || ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                system_name: initialData.system_name || '',
                system_description: initialData.system_description || '',
                development_stage: initialData.development_stage || 'planning',
                system_version: initialData.system_version || '',
                planned_deployment_timeline: initialData.planned_deployment_timeline || ''
            });
        }
    }, [initialData]);

    const handleInputChange = (field: keyof Step1Data, value: string) => {
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

        if (!formData.system_name.trim()) {
            newErrors.system_name = 'System name is required';
        } else if (formData.system_name.trim().length < 3) {
            newErrors.system_name = 'System name must be at least 3 characters';
        }

        if (!formData.system_description.trim()) {
            newErrors.system_description = 'Description is required';
        } else if (formData.system_description.trim().length < 10) {
            newErrors.system_description = 'Description must be at least 10 characters';
        }

        if (!formData.development_stage) {
            newErrors.development_stage = 'Development stage is required';
        }

        if (!formData.planned_deployment_timeline) {
            newErrors.planned_deployment_timeline = 'Deployment timeline is required';
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
            await aiSystemsApi.updateAssessmentStep(String(systemId).trim(), {
                step: 1,
                data: formData
            });

            // Call parent's onNext handler
            onNext(formData);

        } catch (error) {
            console.error('Error saving Step 1:', error);
            setErrors({
                submit: 'Failed to save. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!formData.system_name.trim()) {
            setErrors({ system_name: 'At least enter a system name to save draft' });
            return;
        }

        try {
            setSaving(true);

            // Save current data without advancing step
            await aiSystemsApi.updateAssessmentStep(systemId, {
                step: 1,
                data: {
                    ...formData,
                    is_draft: true // Flag to indicate this is a draft save
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

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div>Loading step data...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e252e', marginBottom: '8px' }}>
                    Basic System Information
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Provide basic details about your AI system. This information will be used throughout the assessment.
                </p>
            </div>

            {/* System Name */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the system name? *
                </label>
                <input
                    type="text"
                    value={formData.system_name}
                    onChange={(e) => handleInputChange('system_name', e.target.value)}
                    placeholder="e.g., Smart Recruitment Platform"
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.system_name ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = errors.system_name ? '#dc3545' : '#ddd'}
                />
                {errors.system_name && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.system_name}
                    </div>
                )}
            </div>

            {/* System Description */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Describe the AI system *
                </label>
                <textarea
                    value={formData.system_description}
                    onChange={(e) => handleInputChange('system_description', e.target.value)}
                    placeholder="Describe what your AI system does, its main features, and how it works..."
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.system_description ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = errors.system_description ? '#dc3545' : '#ddd'}
                />
                {errors.system_description && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.system_description}
                    </div>
                )}
            </div>

            {/* Development Stage */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the current development stage? *
                </label>
                <select
                    value={formData.development_stage}
                    onChange={(e) => handleInputChange('development_stage', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.development_stage ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = errors.development_stage ? '#dc3545' : '#ddd'}
                >
                    <option value="">Select development stage...</option>
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="deployed">Deployed</option>
                </select>
                {errors.development_stage && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.development_stage}
                    </div>
                )}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    This affects compliance timelines and requirements
                </div>
            </div>

            {/* System Version */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the system version?
                </label>
                <input
                    type="text"
                    value={formData.system_version}
                    onChange={(e) => handleInputChange('system_version', e.target.value)}
                    placeholder="e.g., v2.1.0, Beta 1.0, Production Release"
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    Optional: Current version or release identifier
                </div>
            </div>

            {/* Planned Deployment Timeline */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the planned deployment timeline? *
                </label>
                <select
                    value={formData.planned_deployment_timeline}
                    onChange={(e) => handleInputChange('planned_deployment_timeline', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.planned_deployment_timeline ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = errors.planned_deployment_timeline ? '#dc3545' : '#ddd'}
                >
                    <option value="">Select deployment timeline...</option>
                    <option value="already_deployed">Already deployed</option>
                    <option value="within_3_months">Within 3 months</option>
                    <option value="3_6_months">3–6 months</option>
                    <option value="6_12_months">6–12 months</option>
                    <option value="12_plus_months">12+ months</option>
                    <option value="not_planned_yet">Not planned yet</option>
                </select>
                {errors.planned_deployment_timeline && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.planned_deployment_timeline}
                    </div>
                )}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    This helps determine compliance deadlines and requirements
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
                    onMouseEnter={(e) => {
                        if (!saving) {
                            e.currentTarget.style.backgroundColor = '#6030c9';
                            e.currentTarget.style.color = 'white';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!saving) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#6030c9';
                        }
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
                        onMouseEnter={(e) => {
                            if (!saving) {
                                e.currentTarget.style.backgroundColor = '#4d26a5';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!saving) {
                                e.currentTarget.style.backgroundColor = '#6030c9';
                            }
                        }}
                    >
                        {saving ? 'Saving...' : 'Save & Continue →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step1BasicInfo;
