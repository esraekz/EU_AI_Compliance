import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step9Data {
    user_notification_mechanism: string;
    transparency_level: string;
    decision_explanation_capability: string;
    explainability_features: string;
    user_documentation: string[];
    transparency_adapted_to_risk: string;
}

interface Step9Props {
    systemId: string;
    initialData?: {
        user_notification_mechanism?: string;
        transparency_level?: string;
        decision_explanation_capability?: any;
        explainability_features?: string;
        user_documentation?: any;
        transparency_adapted_to_risk?: string;
    };
    onNext: (data: Step9Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step9Transparency: React.FC<Step9Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step9Data>({
        user_notification_mechanism: '',
        transparency_level: '',
        decision_explanation_capability: '',
        explainability_features: '',
        user_documentation: [],
        transparency_adapted_to_risk: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                user_notification_mechanism: initialData.user_notification_mechanism || '',
                transparency_level: initialData.transparency_level || '',
                decision_explanation_capability: initialData.decision_explanation_capability ? 'yes' : initialData.decision_explanation_capability === false ? 'no' : '',
                explainability_features: initialData.explainability_features || '',
                user_documentation: parseArrayField(initialData.user_documentation) || [],
                transparency_adapted_to_risk: initialData.transparency_adapted_to_risk || ''
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

    const handleInputChange = (field: keyof Omit<Step9Data, 'user_documentation'>, value: string) => {
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

    const handleArrayChange = (field: keyof Pick<Step9Data, 'user_documentation'>, value: string, checked: boolean) => {
        setFormData(prev => {
            let newArray: string[];

            if (value === 'none') {
                // If "None" is selected, clear all other selections
                newArray = checked ? ['none'] : [];
            } else {
                // If any other option is selected, remove "None" if present
                const filteredArray = prev[field].filter(item => item !== 'none');
                newArray = checked
                    ? [...filteredArray, value]
                    : filteredArray.filter(item => item !== value);
            }

            return {
                ...prev,
                [field]: newArray
            };
        });

        // Clear error when user makes selection
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.user_notification_mechanism) {
            newErrors.user_notification_mechanism = 'Please specify if users are informed about AI interaction';
        }

        if (!formData.transparency_level) {
            newErrors.transparency_level = 'Please select the required transparency level';
        }

        if (!formData.decision_explanation_capability) {
            newErrors.decision_explanation_capability = 'Please specify if the system can explain its decisions';
        }

        if (formData.user_documentation.length === 0) {
            newErrors.user_documentation = 'Please specify what documentation is provided to users';
        }

        if (!formData.transparency_adapted_to_risk) {
            newErrors.transparency_adapted_to_risk = 'Please specify if transparency obligations are adapted to risk level';
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
                step: 9,
                data: formData
            });

            // Call parent's onNext handler
            onNext(formData);

        } catch (error) {
            console.error('Error saving Step 9:', error);
            setErrors({
                submit: 'Failed to save. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        try {
            setSaving(true);

            await aiSystemsApi.updateAssessmentStep(systemId, {
                step: 9,
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

    const transparencyLevelOptions = [
        { value: 'minimal', label: 'Minimal Notice', description: 'Basic notification that AI is being used' },
        { value: 'medium', label: 'Explanation Required', description: 'Users can request explanations of AI decisions' },
        { value: 'high', label: 'Justification & Traceability', description: 'Full justification and audit trail required' }
    ];

    const documentationOptions = [
        { id: 'user_manual', label: 'User Manual' },
        { id: 'technical_explanation', label: 'Technical Explanation' },
        { id: 'contact_support', label: 'Contact Support' },
        { id: 'privacy_notice', label: 'Privacy Notice' },
        { id: 'faq', label: 'FAQ/Help Documentation' },
        { id: 'none', label: 'None' }
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
                    Transparency & Explainability
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Assess transparency obligations and explainability features of your AI system.
                </p>
            </div>

            {/* Question 1: User Notification */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Are users informed they're interacting with an AI system? *
                </label>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px',
                    border: errors.user_notification_mechanism ? '1px solid #dc3545' : 'none',
                    borderRadius: '6px',
                    padding: errors.user_notification_mechanism ? '8px' : '0'
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
                                backgroundColor: formData.user_notification_mechanism === option.value ? '#f8f7ff' : '#f7fafc',
                                border: `1px solid ${formData.user_notification_mechanism === option.value ? '#6030c9' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <input
                                type="radio"
                                name="user_notification_mechanism"
                                value={option.value}
                                checked={formData.user_notification_mechanism === option.value}
                                onChange={(e) => handleInputChange('user_notification_mechanism', e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                <div style={{ fontSize: '14px', color: '#666' }}>
                    Users should be clearly informed when they are interacting with an AI system, not a human.
                </div>

                {errors.user_notification_mechanism && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.user_notification_mechanism}
                    </div>
                )}
            </div>

            {/* Question 2: Transparency Level */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What transparency level is required? *
                </label>
                <select
                    value={formData.transparency_level}
                    onChange={(e) => handleInputChange('transparency_level', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.transparency_level ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                    }}
                >
                    <option value="">Select transparency level...</option>
                    {transparencyLevelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label} - {option.description}
                        </option>
                    ))}
                </select>
                {errors.transparency_level && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.transparency_level}
                    </div>
                )}
            </div>

            {/* Question 3: Decision Explanation Capability */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Can the system explain its decisions? *
                </label>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px',
                    border: errors.decision_explanation_capability ? '1px solid #dc3545' : 'none',
                    borderRadius: '6px',
                    padding: errors.decision_explanation_capability ? '8px' : '0'
                }}>
                    {[
                        { value: 'yes', label: 'Yes' },
                        { value: 'partially', label: 'Partially' },
                        { value: 'no', label: 'No' }
                    ].map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: formData.decision_explanation_capability === option.value ? '#f8f7ff' : '#f7fafc',
                                border: `1px solid ${formData.decision_explanation_capability === option.value ? '#6030c9' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <input
                                type="radio"
                                name="decision_explanation_capability"
                                value={option.value}
                                checked={formData.decision_explanation_capability === option.value}
                                onChange={(e) => handleInputChange('decision_explanation_capability', e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {formData.decision_explanation_capability && (
                    <div style={{ marginTop: '12px' }}>
                        <textarea
                            value={formData.explainability_features}
                            onChange={(e) => handleInputChange('explainability_features', e.target.value)}
                            placeholder="Describe the explainability features available (e.g., feature importance, decision paths, confidence scores, natural language explanations)..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '14px',
                                minHeight: '80px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                )}

                {errors.decision_explanation_capability && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.decision_explanation_capability}
                    </div>
                )}
            </div>

            {/* Question 4: User Documentation */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What documentation is provided to users? * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.user_documentation ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                }}>
                    {documentationOptions.map((option) => (
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
                                checked={formData.user_documentation.includes(option.id)}
                                onChange={(e) => handleArrayChange('user_documentation', option.id, e.target.checked)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.user_documentation && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.user_documentation}
                    </div>
                )}
            </div>

            {/* Question 5: Transparency Adapted to Risk */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Are transparency obligations adapted to risk level? *
                </label>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px',
                    border: errors.transparency_adapted_to_risk ? '1px solid #dc3545' : 'none',
                    borderRadius: '6px',
                    padding: errors.transparency_adapted_to_risk ? '8px' : '0'
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
                                backgroundColor: formData.transparency_adapted_to_risk === option.value ? '#f8f7ff' : '#f7fafc',
                                border: `1px solid ${formData.transparency_adapted_to_risk === option.value ? '#6030c9' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <input
                                type="radio"
                                name="transparency_adapted_to_risk"
                                value={option.value}
                                checked={formData.transparency_adapted_to_risk === option.value}
                                onChange={(e) => handleInputChange('transparency_adapted_to_risk', e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                <div style={{ fontSize: '14px', color: '#666' }}>
                    Higher risk systems typically require more detailed transparency measures and user notifications.
                </div>

                {errors.transparency_adapted_to_risk && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.transparency_adapted_to_risk}
                    </div>
                )}
            </div>

            {/* Information Boxes */}
            {formData.user_notification_mechanism === 'no' && (
                <div style={{
                    backgroundColor: '#fff5d4',
                    border: '1px solid #ed8936',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#c05621', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        ⚠️ User Notification Required
                    </h4>
                    <p style={{ color: '#c05621', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        The AI Act requires that users be informed when they are interacting with an AI system. Consider implementing clear notifications.
                    </p>
                </div>
            )}

            {formData.transparency_level === 'high' && (
                <div style={{
                    backgroundColor: '#f0fff4',
                    border: '1px solid #68d391',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#22543d', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        ✅ High Transparency Level
                    </h4>
                    <p style={{ color: '#22543d', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        Your system implements comprehensive transparency measures with full justification and traceability capabilities.
                    </p>
                </div>
            )}

            {formData.decision_explanation_capability === 'no' && formData.transparency_level === 'high' && (
                <div style={{
                    backgroundColor: '#fff5d4',
                    border: '1px solid #ed8936',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#c05621', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        💡 Explainability Gap
                    </h4>
                    <p style={{ color: '#c05621', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        High transparency requirements typically include decision explanation capabilities. Consider implementing explainability features.
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

export default Step9Transparency;
