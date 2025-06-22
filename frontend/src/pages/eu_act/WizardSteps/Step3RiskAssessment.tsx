// src/pages/eu_act/WizardSteps/Step3RiskAssessment.tsx
import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step3Data {
    prohibited_practices: string[];
    safety_component: string;
    impact_level: string;
}

interface Step3Props {
    systemId: string;
    initialData?: {
        prohibited_practices?: any;
        safety_component?: string;
        impact_level?: string;
    };
    onNext: (data: Step3Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step3RiskAssessment: React.FC<Step3Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step3Data>({
        prohibited_practices: [],
        safety_component: '',
        impact_level: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            let prohibitedPractices: string[] = [];

            // Handle different formats of prohibited_practices from backend
            if (initialData.prohibited_practices) {
                if (typeof initialData.prohibited_practices === 'string') {
                    try {
                        prohibitedPractices = JSON.parse(initialData.prohibited_practices);
                    } catch {
                        prohibitedPractices = [];
                    }
                } else if (Array.isArray(initialData.prohibited_practices)) {
                    prohibitedPractices = initialData.prohibited_practices;
                }
            }

            setFormData({
                prohibited_practices: prohibitedPractices,
                safety_component: initialData.safety_component || '',
                impact_level: initialData.impact_level || ''
            });
        }
    }, [initialData]);

    const handleProhibitedPracticeChange = (practice: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            prohibited_practices: checked
                ? [...prev.prohibited_practices, practice]
                : prev.prohibited_practices.filter(p => p !== practice)
        }));

        // Clear error when user makes selection
        if (errors.prohibited_practices) {
            setErrors(prev => ({ ...prev, prohibited_practices: '' }));
        }
    };

    const handleInputChange = (field: 'safety_component' | 'impact_level', value: string) => {
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

        if (!formData.safety_component) {
            newErrors.safety_component = 'Please answer the safety component question';
        }

        if (!formData.impact_level) {
            newErrors.impact_level = 'Please select an impact level';
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
                step: 3,
                data: formData
            });

            // Call parent's onNext handler
            onNext(formData);

        } catch (error) {
            console.error('Error saving Step 3:', error);
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
                step: 3,
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

    const prohibitedPracticesOptions = [
        {
            id: 'subliminal_techniques',
            label: 'Subliminal Techniques',
            description: 'AI systems that deploy subliminal techniques beyond a person\'s consciousness to materially distort behavior in a manner that causes harm'
        },
        {
            id: 'vulnerability_exploitation',
            label: 'Vulnerability Exploitation',
            description: 'AI systems that exploit vulnerabilities of specific groups (age, disability, social/economic situation) in ways that cause harm'
        },
        {
            id: 'social_scoring',
            label: 'Social Scoring by Public Authorities',
            description: 'AI systems for social scoring by public authorities for general purposes'
        },
        {
            id: 'realtime_biometric_public',
            label: 'Real-time Remote Biometric Identification in Public',
            description: 'Real-time remote biometric identification systems in publicly accessible spaces for law enforcement (with limited exceptions)'
        },
        {
            id: 'biometric_categorization',
            label: 'Biometric Categorization',
            description: 'Biometric categorisation systems that categorise people based on sensitive attributes (race, political opinions, trade union membership, religious beliefs, sex life, sexual orientation)'
        },
        {
            id: 'emotion_recognition_workplace',
            label: 'Emotion Recognition in Workplace/Education',
            description: 'AI systems for emotion recognition in workplace and educational institutions (except for medical/safety reasons)'
        }
    ];

    const safetyComponentOptions = [
        {
            value: 'safety_critical',
            label: 'Safety-Critical Component',
            description: 'The AI system is a safety component of a product covered by EU harmonisation legislation'
        },
        {
            value: 'standalone_safety',
            label: 'Standalone Safety System',
            description: 'The AI system is a standalone system that performs safety functions'
        },
        {
            value: 'not_safety_component',
            label: 'Not a Safety Component',
            description: 'The AI system is not a safety component and does not perform safety-critical functions'
        }
    ];

    const impactLevelOptions = [
        {
            value: 'high_impact',
            label: 'High Impact',
            description: 'Significant impact on fundamental rights, safety, or livelihoods of individuals'
        },
        {
            value: 'medium_impact',
            label: 'Medium Impact',
            description: 'Moderate impact on individuals with some risks present'
        },
        {
            value: 'low_impact',
            label: 'Low Impact',
            description: 'Limited impact on individuals with minimal risks'
        },
        {
            value: 'minimal_impact',
            label: 'Minimal Impact',
            description: 'Very limited or no meaningful impact on individuals'
        }
    ];

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
                    Risk Assessment & Compliance Check
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    This assessment checks for prohibited AI practices (Article 5) and evaluates safety requirements and impact levels.
                </p>
            </div>

            {/* Article 5 - Prohibited Practices */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    Article 5 - Prohibited AI Practices
                </h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                    Check any practices that your AI system employs. <strong>Any checked item will classify your system as "Unacceptable Risk" and prohibited.</strong>
                </p>

                <div style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#fafafa'
                }}>
                    {prohibitedPracticesOptions.map((option) => (
                        <label
                            key={option.id}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '16px',
                                marginBottom: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#d1d5db';
                                e.currentTarget.style.backgroundColor = '#f9f9f9';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.prohibited_practices.includes(option.id)}
                                onChange={(e) => handleProhibitedPracticeChange(option.id, e.target.checked)}
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

                    {formData.prohibited_practices.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#28a745',
                            backgroundColor: '#d4edda',
                            border: '1px solid #c3e6cb',
                            borderRadius: '6px',
                            marginTop: '16px'
                        }}>
                            ✅ No prohibited practices selected - your system can proceed with assessment
                        </div>
                    )}

                    {formData.prohibited_practices.length > 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#721c24',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '6px',
                            marginTop: '16px'
                        }}>
                            ⚠️ Prohibited practices detected - this system will be classified as "Unacceptable Risk"
                        </div>
                    )}
                </div>
            </div>

            {/* Article 6 - Safety Component Assessment */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '20px' }}>🔒</span>
                    Article 6 - Safety Component Assessment
                </h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                    Does your AI system serve as a safety component or perform safety-critical functions?
                </p>

                <div style={{
                    border: errors.safety_component ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {safetyComponentOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.safety_component === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.safety_component === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <input
                                type="radio"
                                name="safety_component"
                                value={option.value}
                                checked={formData.safety_component === option.value}
                                onChange={(e) => handleInputChange('safety_component', e.target.value)}
                                style={{ marginTop: '2px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                    {option.label}
                                </div>
                                <div style={{ color: '#666', fontSize: '14px' }}>
                                    {option.description}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>

                {errors.safety_component && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.safety_component}
                    </div>
                )}
            </div>

            {/* Impact Level Assessment */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '20px' }}>📊</span>
                    Impact Level Assessment
                </h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                    What level of impact does your AI system have on individuals, their rights, or safety?
                </p>

                <div style={{
                    border: errors.impact_level ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {impactLevelOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.impact_level === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.impact_level === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <input
                                type="radio"
                                name="impact_level"
                                value={option.value}
                                checked={formData.impact_level === option.value}
                                onChange={(e) => handleInputChange('impact_level', e.target.value)}
                                style={{ marginTop: '2px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                    {option.label}
                                </div>
                                <div style={{ color: '#666', fontSize: '14px' }}>
                                    {option.description}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>

                {errors.impact_level && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.impact_level}
                    </div>
                )}
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
                        {saving ? 'Saving...' : 'Continue to Results →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step3RiskAssessment;
