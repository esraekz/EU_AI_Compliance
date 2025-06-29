import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step8Data {
    data_sources: string[];
    personal_data_processing: string;
    data_quality_measures: string;
    bias_mitigation_measures: string;
    data_governance_framework: string;
    gdpr_compliance_status: string;
}

interface Step8Props {
    systemId: string;
    initialData?: {
        data_sources?: any;
        personal_data_processing?: any;
        data_quality_measures?: string;
        bias_mitigation_measures?: string;
        data_governance_framework?: string;
        gdpr_compliance_status?: string;
    };
    onNext: (data: Step8Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step8DataGovernance: React.FC<Step8Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step8Data>({
        data_sources: [],
        personal_data_processing: '',
        data_quality_measures: '',
        bias_mitigation_measures: '',
        data_governance_framework: '',
        gdpr_compliance_status: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                data_sources: parseArrayField(initialData.data_sources) || [],
                personal_data_processing: initialData.personal_data_processing ? 'yes' : initialData.personal_data_processing === false ? 'no' : '',
                data_quality_measures: initialData.data_quality_measures || '',
                bias_mitigation_measures: initialData.bias_mitigation_measures || '',
                data_governance_framework: initialData.data_governance_framework || '',
                gdpr_compliance_status: initialData.gdpr_compliance_status || ''
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

    const handleInputChange = (field: keyof Omit<Step8Data, 'data_sources'>, value: string) => {
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

    const handleArrayChange = (field: keyof Pick<Step8Data, 'data_sources'>, value: string, checked: boolean) => {
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

        if (formData.data_sources.length === 0) {
            newErrors.data_sources = 'Please select at least one data source';
        }

        if (!formData.personal_data_processing) {
            newErrors.personal_data_processing = 'Please specify if personal data is processed';
        }

        if (!formData.data_quality_measures.trim()) {
            newErrors.data_quality_measures = 'Please provide information about data size and quality';
        }

        if (!formData.bias_mitigation_measures.trim()) {
            newErrors.bias_mitigation_measures = 'Please describe bias mitigation techniques (or specify "None")';
        }

        if (!formData.data_governance_framework) {
            newErrors.data_governance_framework = 'Please specify if you have a formal data governance framework';
        }

        if (!formData.gdpr_compliance_status) {
            newErrors.gdpr_compliance_status = 'Please specify GDPR compliance status';
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
                step: 8,
                data: formData
            });

            // Call parent's onNext handler
            onNext(formData);

        } catch (error) {
            console.error('Error saving Step 8:', error);
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
                step: 8,
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

    const dataSourceOptions = [
        { id: 'internal_dbs', label: 'Internal Databases' },
        { id: 'public_datasets', label: 'Public Datasets' },
        { id: 'third_party', label: '3rd Party Data Providers' },
        { id: 'user_generated', label: 'User-Generated Content' },
        { id: 'sensors', label: 'Sensors/IoT Devices' },
        { id: 'web_scraping', label: 'Web Scraping' },
        { id: 'other', label: 'Other' }
    ];

    const personalDataOptions = [
        {
            value: 'no',
            label: 'No Personal Data',
            description: 'System does not process any personal data'
        },
        {
            value: 'minimal',
            label: 'Minimal Processing',
            description: 'Limited personal data (e.g., user IDs, basic demographics)'
        },
        {
            value: 'standard',
            label: 'Standard Processing',
            description: 'Regular personal data (e.g., names, emails, preferences)'
        },
        {
            value: 'sensitive',
            label: 'Sensitive Categories',
            description: 'Special categories of personal data (health, biometric, etc.)'
        }
    ];

    const gdprComplianceOptions = [
        { value: 'fully_compliant', label: 'Fully Compliant' },
        { value: 'partially_compliant', label: 'Partially Compliant' },
        { value: 'not_compliant', label: 'Not Compliant' },
        { value: 'unknown', label: 'Unknown' }
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
                    Data Governance & Quality
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Assess data sources, quality measures, and governance frameworks for your AI system.
                </p>
            </div>

            {/* Question 1: Data Sources */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What are the data sources? * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.data_sources ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                }}>
                    {dataSourceOptions.map((option) => (
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
                                checked={formData.data_sources.includes(option.id)}
                                onChange={(e) => handleArrayChange('data_sources', option.id, e.target.checked)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.data_sources && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.data_sources}
                    </div>
                )}
            </div>

            {/* Question 2: Personal Data Processing */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Does it process personal data? *
                </label>

                <div style={{
                    border: errors.personal_data_processing ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {personalDataOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.personal_data_processing === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.personal_data_processing === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="personal_data_processing"
                                value={option.value}
                                checked={formData.personal_data_processing === option.value}
                                onChange={(e) => handleInputChange('personal_data_processing', e.target.value)}
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

                {errors.personal_data_processing && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.personal_data_processing}
                    </div>
                )}
            </div>

            {/* Question 3: Data Quality Measures */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Estimate size and quality of training data *
                </label>
                <textarea
                    value={formData.data_quality_measures}
                    onChange={(e) => handleInputChange('data_quality_measures', e.target.value)}
                    placeholder="Describe data size (e.g., 1M records), quality measures, validation processes, data completeness, accuracy metrics, etc."
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.data_quality_measures ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        minHeight: '100px',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                    }}
                />
                {errors.data_quality_measures && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.data_quality_measures}
                    </div>
                )}
            </div>

            {/* Question 4: Bias Mitigation Techniques */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What bias mitigation techniques are used? *
                </label>
                <textarea
                    value={formData.bias_mitigation_measures}
                    onChange={(e) => handleInputChange('bias_mitigation_measures', e.target.value)}
                    placeholder="Describe bias detection methods, fairness metrics, data balancing techniques, algorithmic fairness measures, or specify 'None' if not applicable."
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.bias_mitigation_measures ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        minHeight: '100px',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                    }}
                />
                {errors.bias_mitigation_measures && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.bias_mitigation_measures}
                    </div>
                )}
            </div>

            {/* Question 5: Data Governance Framework */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Is there a formal data governance framework? *
                </label>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px',
                    border: errors.data_governance_framework ? '1px solid #dc3545' : 'none',
                    borderRadius: '6px',
                    padding: errors.data_governance_framework ? '8px' : '0'
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
                                backgroundColor: formData.data_governance_framework === option.value ? '#f8f7ff' : '#f7fafc',
                                border: `1px solid ${formData.data_governance_framework === option.value ? '#6030c9' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <input
                                type="radio"
                                name="data_governance_framework"
                                value={option.value}
                                checked={formData.data_governance_framework === option.value}
                                onChange={(e) => handleInputChange('data_governance_framework', e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    A formal framework includes data lineage tracking, access controls, data quality standards, and retention policies.
                </div>

                {errors.data_governance_framework && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.data_governance_framework}
                    </div>
                )}
            </div>

            {/* Question 6: GDPR Compliance Status */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    GDPR compliance status? *
                </label>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    border: errors.gdpr_compliance_status ? '1px solid #dc3545' : 'none',
                    borderRadius: '6px',
                    padding: errors.gdpr_compliance_status ? '8px' : '0'
                }}>
                    {gdprComplianceOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: formData.gdpr_compliance_status === option.value ? '#f8f7ff' : '#f7fafc',
                                border: `1px solid ${formData.gdpr_compliance_status === option.value ? '#6030c9' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <input
                                type="radio"
                                name="gdpr_compliance_status"
                                value={option.value}
                                checked={formData.gdpr_compliance_status === option.value}
                                onChange={(e) => handleInputChange('gdpr_compliance_status', e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.gdpr_compliance_status && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.gdpr_compliance_status}
                    </div>
                )}
            </div>

            {/* Information Boxes */}
            {formData.personal_data_processing === 'sensitive' && (
                <div style={{
                    backgroundColor: '#fff5d4',
                    border: '1px solid #ed8936',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#c05621', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        ⚠️ Sensitive Personal Data Processing
                    </h4>
                    <p style={{ color: '#c05621', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        Processing sensitive categories of personal data requires additional safeguards and may classify your system as high-risk under the AI Act.
                    </p>
                </div>
            )}

            {formData.gdpr_compliance_status === 'not_compliant' && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#721c24', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        🚨 GDPR Compliance Required
                    </h4>
                    <p style={{ color: '#721c24', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        GDPR non-compliance poses significant legal risks. Consider implementing necessary data protection measures before system deployment.
                    </p>
                </div>
            )}

            {formData.data_governance_framework === 'no' && (
                <div style={{
                    backgroundColor: '#fff5d4',
                    border: '1px solid #ed8936',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#c05621', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        📋 Data Governance Recommended
                    </h4>
                    <p style={{ color: '#c05621', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        Implementing a formal data governance framework is recommended for AI Act compliance and overall data quality assurance.
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

export default Step8DataGovernance;
