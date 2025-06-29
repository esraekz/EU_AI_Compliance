import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step5Data {
    biometric_categorization: string;
    critical_infrastructure: string;
    education_vocational: string;
    employment_hr: string;
    essential_services: string;
    law_enforcement: string;
    migration_asylum: string;
    justice_democracy: string;
    profiling_individuals: string;
    preparatory_only: string;
}

interface Step5Props {
    systemId: string;
    initialData?: {
        biometric_categorization?: string;
        critical_infrastructure?: string;
        education_vocational?: string;
        employment_hr?: string;
        essential_services?: string;
        law_enforcement?: string;
        migration_asylum?: string;
        justice_democracy?: string;
        profiling_individuals?: string;
        preparatory_only?: string;
    };
    onNext: (data: Step5Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step5AnnexIIIAssessment: React.FC<Step5Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step5Data>({
        biometric_categorization: '',
        critical_infrastructure: '',
        education_vocational: '',
        employment_hr: '',
        essential_services: '',
        law_enforcement: '',
        migration_asylum: '',
        justice_democracy: '',
        profiling_individuals: '',
        preparatory_only: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [highRiskDetected, setHighRiskDetected] = useState(false);

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                biometric_categorization: initialData.biometric_categorization || '',
                critical_infrastructure: initialData.critical_infrastructure || '',
                education_vocational: initialData.education_vocational || '',
                employment_hr: initialData.employment_hr || '',
                essential_services: initialData.essential_services || '',
                law_enforcement: initialData.law_enforcement || '',
                migration_asylum: initialData.migration_asylum || '',
                justice_democracy: initialData.justice_democracy || '',
                profiling_individuals: initialData.profiling_individuals || '',
                preparatory_only: initialData.preparatory_only || ''
            });
        }
    }, [initialData]);

    // Check for high-risk detection
    useEffect(() => {
        const hasHighRiskUses =
            formData.biometric_categorization === 'yes' ||
            formData.critical_infrastructure === 'yes' ||
            formData.education_vocational === 'yes' ||
            formData.employment_hr === 'yes' ||
            formData.essential_services === 'yes' ||
            formData.law_enforcement === 'yes' ||
            formData.migration_asylum === 'yes' ||
            formData.justice_democracy === 'yes' ||
            formData.profiling_individuals === 'yes';

        // High risk if has uses AND not preparatory only
        const isHighRisk = hasHighRiskUses && formData.preparatory_only !== 'yes';
        setHighRiskDetected(isHighRisk);
    }, [
        formData.biometric_categorization,
        formData.critical_infrastructure,
        formData.education_vocational,
        formData.employment_hr,
        formData.essential_services,
        formData.law_enforcement,
        formData.migration_asylum,
        formData.justice_democracy,
        formData.profiling_individuals,
        formData.preparatory_only
    ]);

    const handleInputChange = (field: keyof Step5Data, value: string) => {
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

        // All questions are required
        Object.keys(formData).forEach((key) => {
            if (!formData[key as keyof Step5Data]) {
                newErrors[key] = 'Please answer this question';
            }
        });

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
                step: 5,
                data: formData
            });

            // Call parent's onNext handler
            onNext(formData);

        } catch (error) {
            console.error('Error saving Step 5:', error);
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
                step: 5,
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
            field: 'biometric_categorization' as keyof Step5Data,
            question: 'Is the AI used for biometric categorization or identification?',
            description: 'Systems that identify or categorize people based on biometric data (facial recognition, fingerprints, etc.)'
        },
        {
            field: 'critical_infrastructure' as keyof Step5Data,
            question: 'Is it used in critical infrastructure (e.g., traffic, energy)?',
            description: 'AI systems managing or controlling critical infrastructure like power grids, transportation, water systems'
        },
        {
            field: 'education_vocational' as keyof Step5Data,
            question: 'Is it used in education or vocational training?',
            description: 'Systems for student assessment, admission decisions, educational content delivery, or skills evaluation'
        },
        {
            field: 'employment_hr' as keyof Step5Data,
            question: 'Is it used in employment or HR-related decisions?',
            description: 'CV screening, hiring decisions, performance evaluation, promotion decisions, or workforce management'
        },
        {
            field: 'essential_services' as keyof Step5Data,
            question: 'Is it used to grant access to essential services (e.g., credit, housing)?',
            description: 'Credit scoring, loan approvals, insurance eligibility, housing applications, social benefits'
        },
        {
            field: 'law_enforcement' as keyof Step5Data,
            question: 'Is it used in law enforcement (e.g., predictive policing)?',
            description: 'Crime prediction, evidence analysis, risk assessment, or other law enforcement applications'
        },
        {
            field: 'migration_asylum' as keyof Step5Data,
            question: 'Is it used in migration, asylum, or border control?',
            description: 'Visa processing, asylum applications, border security, immigration decisions'
        },
        {
            field: 'justice_democracy' as keyof Step5Data,
            question: 'Is it used in justice/democracy (e.g., legal scoring)?',
            description: 'Legal case analysis, judicial decision support, democratic process management'
        },
        {
            field: 'profiling_individuals' as keyof Step5Data,
            question: 'Does it involve profiling of individuals?',
            description: 'Evaluating personal characteristics, behavior, interests, or predicting individual outcomes'
        },
        {
            field: 'preparatory_only' as keyof Step5Data,
            question: 'Are these uses only preparatory, monitoring, or minor deviation detection?',
            description: 'Limited to narrow procedural tasks, monitoring, or detecting minor deviations (may reduce risk classification)'
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
                    Annex III – High-Risk Use Cases
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Determine if your AI system falls under any Annex III high-risk categories that require comprehensive compliance measures.
                </p>
            </div>

            {/* Status Alert */}
            {highRiskDetected ? (
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
                            HIGH-RISK AI SYSTEM IDENTIFIED
                        </div>
                        <div style={{ color: '#c53030', fontSize: '14px' }}>
                            Your system requires comprehensive compliance measures under the EU AI Act
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
                            No High-Risk Categories Detected
                        </div>
                        <div style={{ color: '#22543d', fontSize: '14px' }}>
                            Your system may qualify for limited or minimal risk classification
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

export default Step5AnnexIIIAssessment;
