import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step4Data {
    subliminal_manipulation: string;
    vulnerable_groups_exploitation: string;
    social_scoring_public: string;
    realtime_biometric_public: string;
}

interface Step4Props {
    systemId: string;
    initialData?: {
        subliminal_manipulation?: string;
        vulnerable_groups_exploitation?: string;
        social_scoring_public?: string;
        realtime_biometric_public?: string;
    };
    onNext: (data: Step4Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step4ProhibitedPractices: React.FC<Step4Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step4Data>({
        subliminal_manipulation: '',
        vulnerable_groups_exploitation: '',
        social_scoring_public: '',
        realtime_biometric_public: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [prohibitedDetected, setProhibitedDetected] = useState(false);

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                subliminal_manipulation: initialData.subliminal_manipulation || '',
                vulnerable_groups_exploitation: initialData.vulnerable_groups_exploitation || '',
                social_scoring_public: initialData.social_scoring_public || '',
                realtime_biometric_public: initialData.realtime_biometric_public || ''
            });
        }
    }, [initialData]);

    // Check for prohibited practices
    useEffect(() => {
        const hasProhibited =
            formData.subliminal_manipulation === 'yes' ||
            formData.vulnerable_groups_exploitation === 'yes' ||
            formData.social_scoring_public === 'yes' ||
            formData.realtime_biometric_public === 'yes';

        setProhibitedDetected(hasProhibited);
    }, [
        formData.subliminal_manipulation,
        formData.vulnerable_groups_exploitation,
        formData.social_scoring_public,
        formData.realtime_biometric_public
    ]);

    const handleInputChange = (field: keyof Step4Data, value: string) => {
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

        if (!formData.subliminal_manipulation) {
            newErrors.subliminal_manipulation = 'Please answer this question';
        }

        if (!formData.vulnerable_groups_exploitation) {
            newErrors.vulnerable_groups_exploitation = 'Please answer this question';
        }

        if (!formData.social_scoring_public) {
            newErrors.social_scoring_public = 'Please answer this question';
        }

        if (!formData.realtime_biometric_public) {
            newErrors.realtime_biometric_public = 'Please answer this question';
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
                step: 4,
                data: formData
            });

            // Call parent's onNext handler
            onNext(formData);

        } catch (error) {
            console.error('Error saving Step 4:', error);
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
                step: 4,
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

    const questions = [
        {
            field: 'subliminal_manipulation' as keyof Step4Data,
            question: 'Does it use subliminal techniques to manipulate behavior?',
            description: 'AI systems that deploy subliminal techniques beyond a person\'s consciousness to materially distort behavior in a manner that is likely to cause harm'
        },
        {
            field: 'vulnerable_groups_exploitation' as keyof Step4Data,
            question: 'Does it exploit vulnerable groups (e.g., children, disabled)?',
            description: 'AI systems that exploit vulnerabilities of specific groups due to their age, physical or mental disability, or specific social or economic situation'
        },
        {
            field: 'social_scoring_public' as keyof Step4Data,
            question: 'Is it used for social scoring by public authorities?',
            description: 'AI systems for evaluation or classification of natural persons by public authorities based on their social behavior or personal characteristics'
        },
        {
            field: 'realtime_biometric_public' as keyof Step4Data,
            question: 'Does it enable real-time biometric identification in public spaces?',
            description: 'Real-time remote biometric identification systems in publicly accessible spaces for law enforcement purposes (limited exceptions apply)'
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
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e252e', marginBottom: '8px' }}>
                    Article 5 – Prohibited Practices
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    These AI practices are prohibited under EU law. If your system uses any of these techniques, it cannot be deployed in the EU.
                </p>
            </div>

            {/* Status Alert */}
            {prohibitedDetected ? (
                <div style={{
                    backgroundColor: '#fed7d7',
                    border: '1px solid #f56565',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: '600', color: '#c53030', fontSize: '16px', marginBottom: '4px' }}>
                            PROHIBITED AI SYSTEM DETECTED
                        </div>
                        <div style={{ color: '#c53030', fontSize: '14px' }}>
                            Your system cannot be placed on the EU market due to prohibited practices under Article 5
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    backgroundColor: '#f0fff4',
                    border: '1px solid #68d391',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '20px' }}>✅</span>
                    <div>
                        <div style={{ fontWeight: '600', color: '#22543d', fontSize: '16px', marginBottom: '4px' }}>
                            No Prohibited Practices Detected
                        </div>
                        <div style={{ color: '#22543d', fontSize: '14px' }}>
                            Your system can proceed with the assessment
                        </div>
                    </div>
                </div>
            )}

            {/* Questions */}
            <div style={{
                backgroundColor: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px'
            }}>
                {questions.map((item, index) => (
                    <div key={item.field} style={{
                        marginBottom: index === questions.length - 1 ? '0' : '24px',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '20px'
                    }}>
                        <div style={{ marginBottom: '12px' }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#2d3748',
                                marginBottom: '8px',
                                margin: 0
                            }}>
                                {item.question} *
                            </h3>
                            <p style={{
                                color: '#718096',
                                fontSize: '14px',
                                lineHeight: '1.4',
                                margin: 0
                            }}>
                                {item.description}
                            </p>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            border: errors[item.field] ? '1px solid #f56565' : 'none',
                            borderRadius: '6px',
                            padding: errors[item.field] ? '8px' : '0'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: formData[item.field] === 'yes' ? '#fed7d7' : '#f7fafc',
                                border: `1px solid ${formData[item.field] === 'yes' ? '#f56565' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                <input
                                    type="radio"
                                    name={item.field}
                                    value="yes"
                                    checked={formData[item.field] === 'yes'}
                                    onChange={(e) => handleInputChange(item.field, e.target.value)}
                                />
                                <span style={{ color: formData[item.field] === 'yes' ? '#c53030' : '#2d3748' }}>
                                    Yes
                                </span>
                            </label>

                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: formData[item.field] === 'no' ? '#f0fff4' : '#f7fafc',
                                border: `1px solid ${formData[item.field] === 'no' ? '#68d391' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                <input
                                    type="radio"
                                    name={item.field}
                                    value="no"
                                    checked={formData[item.field] === 'no'}
                                    onChange={(e) => handleInputChange(item.field, e.target.value)}
                                />
                                <span style={{ color: formData[item.field] === 'no' ? '#22543d' : '#2d3748' }}>
                                    No
                                </span>
                            </label>
                        </div>

                        {errors[item.field] && (
                            <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '8px' }}>
                                {errors[item.field]}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Error */}
            {errors.submit && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#721c24',
                    marginTop: '16px',
                    fontSize: '14px'
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

export default Step4ProhibitedPractices;
