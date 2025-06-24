// src/pages/eu_act/WizardSteps/Step4ProhibitedPractices.tsx - Refined Elegant Style
import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step4Data {
    manipulation_techniques: boolean;
    manipulation_details: string;
    vulnerability_exploitation: boolean;
    vulnerability_details: string;
    social_scoring: boolean;
    social_scoring_details: string;
    biometric_identification: boolean;
    biometric_details: string;
    prohibited_practices: string[];
}

interface Step4Props {
    systemId: string;
    initialData?: {
        manipulation_techniques?: boolean;
        manipulation_details?: string;
        vulnerability_exploitation?: boolean;
        vulnerability_details?: string;
        social_scoring?: boolean;
        social_scoring_details?: string;
        biometric_identification?: boolean;
        biometric_details?: string;
        prohibited_practices?: any;
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
        manipulation_techniques: false,
        manipulation_details: '',
        vulnerability_exploitation: false,
        vulnerability_details: '',
        social_scoring: false,
        social_scoring_details: '',
        biometric_identification: false,
        biometric_details: '',
        prohibited_practices: []
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showWarning, setShowWarning] = useState(false);

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            const prohibitedPractices = parseArrayField(initialData.prohibited_practices) || [];

            setFormData({
                manipulation_techniques: initialData.manipulation_techniques || false,
                manipulation_details: initialData.manipulation_details || '',
                vulnerability_exploitation: initialData.vulnerability_exploitation || false,
                vulnerability_details: initialData.vulnerability_details || '',
                social_scoring: initialData.social_scoring || false,
                social_scoring_details: initialData.social_scoring_details || '',
                biometric_identification: initialData.biometric_identification || false,
                biometric_details: initialData.biometric_details || '',
                prohibited_practices: prohibitedPractices
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

    // Update prohibited practices array when individual practices change
    useEffect(() => {
        const practices: string[] = [];
        if (formData.manipulation_techniques) practices.push('manipulation_techniques');
        if (formData.vulnerability_exploitation) practices.push('vulnerability_exploitation');
        if (formData.social_scoring) practices.push('social_scoring');
        if (formData.biometric_identification) practices.push('biometric_identification');

        setFormData(prev => ({ ...prev, prohibited_practices: practices }));
        setShowWarning(practices.length > 0);
    }, [
        formData.manipulation_techniques,
        formData.vulnerability_exploitation,
        formData.social_scoring,
        formData.biometric_identification
    ]);

    const handleBooleanChange = (field: keyof Pick<Step4Data, 'manipulation_techniques' | 'vulnerability_exploitation' | 'social_scoring' | 'biometric_identification'>, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear associated details if unchecked
        if (!value) {
            const detailField = field.replace(/^/, '').replace(/_techniques$|_exploitation$|_scoring$|_identification$/, '_details') as keyof Step4Data;
            if (detailField.endsWith('_details')) {
                setFormData(prev => ({
                    ...prev,
                    [detailField]: ''
                }));
            }
        }
    };

    const handleTextChange = (field: keyof Pick<Step4Data, 'manipulation_details' | 'vulnerability_details' | 'social_scoring_details' | 'biometric_details'>, value: string) => {
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

        // Check if details are provided when practices are selected
        if (formData.manipulation_techniques && !formData.manipulation_details.trim()) {
            newErrors.manipulation_details = 'Please provide details about manipulation techniques';
        }

        if (formData.vulnerability_exploitation && !formData.vulnerability_details.trim()) {
            newErrors.vulnerability_details = 'Please provide details about vulnerability exploitation';
        }

        if (formData.social_scoring && !formData.social_scoring_details.trim()) {
            newErrors.social_scoring_details = 'Please provide details about social scoring';
        }

        if (formData.biometric_identification && !formData.biometric_details.trim()) {
            newErrors.biometric_details = 'Please provide details about biometric identification';
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

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '30px' }}>
                <div style={{ fontSize: '14px', color: '#666' }}>Loading step data...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '6px' }}>
                    Article 5 - Prohibited AI Practices
                </h2>
                <p style={{ color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
                    These AI practices are prohibited under EU law. If your system uses any of these techniques, it cannot be deployed in the EU.
                </p>
            </div>

            {/* Status Alert */}
            {showWarning ? (
                <div style={{
                    backgroundColor: '#fed7d7',
                    border: '1px solid #f56565',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: '600', color: '#c53030', fontSize: '13px' }}>
                            PROHIBITED AI SYSTEM DETECTED
                        </div>
                        <div style={{ color: '#c53030', fontSize: '12px' }}>
                            Your system cannot be placed on the EU market
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    backgroundColor: '#f0fff4',
                    border: '1px solid #68d391',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '16px' }}>✅</span>
                    <div>
                        <div style={{ fontWeight: '600', color: '#22543d', fontSize: '13px' }}>
                            No Prohibited Practices Detected
                        </div>
                        <div style={{ color: '#22543d', fontSize: '12px' }}>
                            Your system can proceed with assessment
                        </div>
                    </div>
                </div>
            )}

            {/* Questions Container */}
            <div style={{
                backgroundColor: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px'
            }}>
                {/* Question 1: Manipulation Techniques */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: 'pointer',
                        marginBottom: '12px'
                    }}>
                        <input
                            type="radio"
                            name="manipulation_group"
                            checked={formData.manipulation_techniques}
                            onChange={(e) => handleBooleanChange('manipulation_techniques', e.target.checked)}
                            style={{ marginTop: '2px' }}
                        />
                        <div>
                            <div style={{ fontWeight: '500', color: '#2d3748', fontSize: '14px', marginBottom: '4px' }}>
                                Subliminal techniques or manipulation
                            </div>
                            <div style={{ color: '#718096', fontSize: '12px', lineHeight: '1.4' }}>
                                AI systems that deploy subliminal techniques beyond a person's consciousness or manipulative techniques to materially distort behavior causing harm
                            </div>
                        </div>
                    </label>

                    {formData.manipulation_techniques && (
                        <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <textarea
                                value={formData.manipulation_details}
                                onChange={(e) => handleTextChange('manipulation_details', e.target.value)}
                                placeholder="Describe the manipulation techniques used..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: `1px solid ${errors.manipulation_details ? '#f56565' : '#cbd5e0'}`,
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            />
                            {errors.manipulation_details && (
                                <div style={{ color: '#e53e3e', fontSize: '11px', marginTop: '4px' }}>
                                    {errors.manipulation_details}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Question 2: Vulnerability Exploitation */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: 'pointer',
                        marginBottom: '12px'
                    }}>
                        <input
                            type="radio"
                            name="vulnerability_group"
                            checked={formData.vulnerability_exploitation}
                            onChange={(e) => handleBooleanChange('vulnerability_exploitation', e.target.checked)}
                            style={{ marginTop: '2px' }}
                        />
                        <div>
                            <div style={{ fontWeight: '500', color: '#2d3748', fontSize: '14px', marginBottom: '4px' }}>
                                Vulnerability exploitation
                            </div>
                            <div style={{ color: '#718096', fontSize: '12px', lineHeight: '1.4' }}>
                                AI systems that exploit vulnerabilities of specific groups (age, disability, social/economic situation) causing harm
                            </div>
                        </div>
                    </label>

                    {formData.vulnerability_exploitation && (
                        <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <textarea
                                value={formData.vulnerability_details}
                                onChange={(e) => handleTextChange('vulnerability_details', e.target.value)}
                                placeholder="Describe how vulnerable groups are exploited..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: `1px solid ${errors.vulnerability_details ? '#f56565' : '#cbd5e0'}`,
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            />
                            {errors.vulnerability_details && (
                                <div style={{ color: '#e53e3e', fontSize: '11px', marginTop: '4px' }}>
                                    {errors.vulnerability_details}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Question 3: Social Scoring */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: 'pointer',
                        marginBottom: '12px'
                    }}>
                        <input
                            type="radio"
                            name="social_scoring_group"
                            checked={formData.social_scoring}
                            onChange={(e) => handleBooleanChange('social_scoring', e.target.checked)}
                            style={{ marginTop: '2px' }}
                        />
                        <div>
                            <div style={{ fontWeight: '500', color: '#2d3748', fontSize: '14px', marginBottom: '4px' }}>
                                Social scoring by public authorities
                            </div>
                            <div style={{ color: '#718096', fontSize: '12px', lineHeight: '1.4' }}>
                                AI systems for social scoring of natural persons by public authorities for general purpose leading to detrimental treatment
                            </div>
                        </div>
                    </label>

                    {formData.social_scoring && (
                        <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <textarea
                                value={formData.social_scoring_details}
                                onChange={(e) => handleTextChange('social_scoring_details', e.target.value)}
                                placeholder="Describe the social scoring system..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: `1px solid ${errors.social_scoring_details ? '#f56565' : '#cbd5e0'}`,
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            />
                            {errors.social_scoring_details && (
                                <div style={{ color: '#e53e3e', fontSize: '11px', marginTop: '4px' }}>
                                    {errors.social_scoring_details}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Question 4: Biometric Identification */}
                <div style={{ marginBottom: '0' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: 'pointer',
                        marginBottom: '12px'
                    }}>
                        <input
                            type="radio"
                            name="biometric_group"
                            checked={formData.biometric_identification}
                            onChange={(e) => handleBooleanChange('biometric_identification', e.target.checked)}
                            style={{ marginTop: '2px' }}
                        />
                        <div>
                            <div style={{ fontWeight: '500', color: '#2d3748', fontSize: '14px', marginBottom: '4px' }}>
                                Real-time remote biometric identification
                            </div>
                            <div style={{ color: '#718096', fontSize: '12px', lineHeight: '1.4' }}>
                                Real-time remote biometric identification systems in publicly accessible spaces for law enforcement (limited exceptions)
                            </div>
                        </div>
                    </label>

                    {formData.biometric_identification && (
                        <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <textarea
                                value={formData.biometric_details}
                                onChange={(e) => handleTextChange('biometric_details', e.target.value)}
                                placeholder="Describe the biometric identification system..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: `1px solid ${errors.biometric_details ? '#f56565' : '#cbd5e0'}`,
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            />
                            {errors.biometric_details && (
                                <div style={{ color: '#e53e3e', fontSize: '11px', marginTop: '4px' }}>
                                    {errors.biometric_details}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
                <div style={{
                    backgroundColor: '#fed7d7',
                    border: '1px solid #f56565',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    color: '#c53030',
                    marginTop: '16px',
                    fontSize: '13px'
                }}>
                    {errors.submit}
                </div>
            )}

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '24px',
                gap: '12px'
            }}>
                {/* Left side - Save Draft */}
                <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    style={{
                        padding: '8px 14px',
                        backgroundColor: 'transparent',
                        border: '1px solid #cbd5e0',
                        borderRadius: '6px',
                        color: '#718096',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                    }}
                >
                    {saving ? 'Saving...' : 'Save Draft'}
                </button>

                {/* Right side - Navigation */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            disabled={saving}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#edf2f7',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                color: '#4a5568',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            Previous
                        </button>
                    )}

                    <button
                        onClick={handleSaveAndContinue}
                        disabled={saving}
                        style={{
                            padding: '8px 20px',
                            backgroundColor: '#4299e1',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {saving ? 'Saving...' : 'Continue Assessment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step4ProhibitedPractices;
