// src/pages/eu_act/WizardSteps/Step3DataAssessment.tsx
import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step3Data {
    data_sources: string[];
    data_types: string[];
    personal_data_processing: string;
    training_data_size: string;
    data_quality_measures: string[];
    bias_assessment: string;
    data_governance: string;
}

interface Step3Props {
    systemId: string;
    initialData?: {
        data_sources?: any;
        data_types?: any;
        personal_data_processing?: string;
        training_data_size?: string;
        data_quality_measures?: any;
        bias_assessment?: string;
        data_governance?: string;
    };
    onNext: (data: Step3Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step3DataAssessment: React.FC<Step3Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step3Data>({
        data_sources: [],
        data_types: [],
        personal_data_processing: '',
        training_data_size: '',
        data_quality_measures: [],
        bias_assessment: '',
        data_governance: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                data_sources: parseArrayField(initialData.data_sources) || [],
                data_types: parseArrayField(initialData.data_types) || [],
                personal_data_processing: initialData.personal_data_processing || '',
                training_data_size: initialData.training_data_size || '',
                data_quality_measures: parseArrayField(initialData.data_quality_measures) || [],
                bias_assessment: initialData.bias_assessment || '',
                data_governance: initialData.data_governance || ''
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

    const handleArrayChange = (field: keyof Pick<Step3Data, 'data_sources' | 'data_types' | 'data_quality_measures'>, value: string, checked: boolean) => {
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

    const handleInputChange = (field: keyof Omit<Step3Data, 'data_sources' | 'data_types' | 'data_quality_measures'>, value: string) => {
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

        if (formData.data_sources.length === 0) {
            newErrors.data_sources = 'Please select at least one data source';
        }

        if (formData.data_types.length === 0) {
            newErrors.data_types = 'Please select at least one data type';
        }

        if (!formData.personal_data_processing) {
            newErrors.personal_data_processing = 'Please specify personal data processing';
        }

        if (!formData.training_data_size) {
            newErrors.training_data_size = 'Please select training data size';
        }

        if (!formData.bias_assessment) {
            newErrors.bias_assessment = 'Please answer the bias assessment question';
        }

        if (!formData.data_governance) {
            newErrors.data_governance = 'Please specify data governance approach';
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

    const dataSourceOptions = [
        { id: 'internal_databases', label: 'Internal Databases', description: 'Company databases, CRM systems, internal records' },
        { id: 'public_datasets', label: 'Public Datasets', description: 'Publicly available datasets, government data, research datasets' },
        { id: 'user_generated', label: 'User-Generated Content', description: 'Social media, user uploads, customer feedback' },
        { id: 'third_party_data', label: 'Third-Party Data', description: 'Purchased datasets, partner data, vendor-provided data' },
        { id: 'web_scraping', label: 'Web Scraping', description: 'Data collected from websites, APIs, online sources' },
        { id: 'sensor_data', label: 'Sensor/IoT Data', description: 'Device sensors, IoT devices, monitoring equipment' },
        { id: 'synthetic_data', label: 'Synthetic Data', description: 'Artificially generated data, simulated datasets' }
    ];

    const dataTypeOptions = [
        { id: 'text', label: 'Text Data', description: 'Documents, emails, chat logs, written content' },
        { id: 'images', label: 'Images', description: 'Photos, screenshots, medical images, visual content' },
        { id: 'audio', label: 'Audio Data', description: 'Voice recordings, music, sound files' },
        { id: 'video', label: 'Video Data', description: 'Video files, live streams, surveillance footage' },
        { id: 'biometric', label: 'Biometric Data', description: 'Fingerprints, facial features, voice patterns, physiological data' },
        { id: 'behavioral', label: 'Behavioral Data', description: 'User interactions, clickstreams, usage patterns' },
        { id: 'financial', label: 'Financial Data', description: 'Transaction data, credit information, financial records' },
        { id: 'location', label: 'Location Data', description: 'GPS coordinates, geolocation, tracking data' },
        { id: 'health', label: 'Health Data', description: 'Medical records, health metrics, diagnostic data' }
    ];

    const personalDataOptions = [
        { value: 'no_personal_data', label: 'No Personal Data', description: 'System does not process any personal data' },
        { value: 'minimal_personal_data', label: 'Minimal Personal Data', description: 'Limited personal data, basic identifiers only' },
        { value: 'standard_personal_data', label: 'Standard Personal Data', description: 'Regular personal data processing under GDPR' },
        { value: 'sensitive_personal_data', label: 'Sensitive Personal Data', description: 'Special categories under GDPR (health, biometric, etc.)' }
    ];

    const trainingSizeOptions = [
        { value: 'small', label: 'Small Dataset', description: 'Less than 10,000 data points' },
        { value: 'medium', label: 'Medium Dataset', description: '10,000 - 100,000 data points' },
        { value: 'large', label: 'Large Dataset', description: '100,000 - 1 million data points' },
        { value: 'very_large', label: 'Very Large Dataset', description: 'More than 1 million data points' },
        { value: 'not_applicable', label: 'Not Applicable', description: 'Rule-based system, no training data' }
    ];

    const qualityMeasureOptions = [
        { id: 'accuracy_validation', label: 'Accuracy Validation', description: 'Data accuracy checks and validation processes' },
        { id: 'completeness_checks', label: 'Completeness Checks', description: 'Ensuring data completeness and addressing missing values' },
        { id: 'consistency_monitoring', label: 'Consistency Monitoring', description: 'Data consistency across sources and time' },
        { id: 'bias_detection', label: 'Bias Detection', description: 'Automated bias detection and monitoring' },
        { id: 'data_lineage', label: 'Data Lineage Tracking', description: 'Tracking data sources and transformations' },
        { id: 'quality_metrics', label: 'Quality Metrics', description: 'Defined quality metrics and thresholds' }
    ];

    const biasAssessmentOptions = [
        { value: 'comprehensive_assessment', label: 'Comprehensive Assessment', description: 'Formal bias assessment with documentation and mitigation plans' },
        { value: 'basic_assessment', label: 'Basic Assessment', description: 'Basic bias checks and awareness measures' },
        { value: 'planned_assessment', label: 'Planned Assessment', description: 'Bias assessment is planned but not yet implemented' },
        { value: 'no_assessment', label: 'No Assessment', description: 'No bias assessment conducted or planned' }
    ];

    const governanceOptions = [
        { value: 'formal_governance', label: 'Formal Data Governance', description: 'Established data governance framework with policies and procedures' },
        { value: 'basic_governance', label: 'Basic Governance', description: 'Basic data management practices and some documentation' },
        { value: 'minimal_governance', label: 'Minimal Governance', description: 'Limited formal governance, ad-hoc data management' },
        { value: 'no_governance', label: 'No Formal Governance', description: 'No established data governance framework' }
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
                    Data Sources and Processing
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Provide information about the data your AI system uses, including sources, types, and governance measures.
                </p>
            </div>

            {/* Data Sources */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Data Sources * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.data_sources ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {dataSourceOptions.map((option) => (
                        <label
                            key={option.id}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.data_sources.includes(option.id)}
                                onChange={(e) => handleArrayChange('data_sources', option.id, e.target.checked)}
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

                {errors.data_sources && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.data_sources}
                    </div>
                )}
            </div>

            {/* Data Types */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Data Types * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.data_types ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {dataTypeOptions.map((option) => (
                        <label
                            key={option.id}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.data_types.includes(option.id)}
                                onChange={(e) => handleArrayChange('data_types', option.id, e.target.checked)}
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

                {errors.data_types && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.data_types}
                    </div>
                )}
            </div>

            {/* Personal Data Processing */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Personal Data Processing *
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
                                gap: '12px',
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
                                <div style={{ color: '#666', fontSize: '14px' }}>
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

            {/* Training Data Size */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Training Data Size *
                </label>

                <div style={{
                    border: errors.training_data_size ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {trainingSizeOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.training_data_size === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.training_data_size === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="training_data_size"
                                value={option.value}
                                checked={formData.training_data_size === option.value}
                                onChange={(e) => handleInputChange('training_data_size', e.target.value)}
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

                {errors.training_data_size && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.training_data_size}
                    </div>
                )}
            </div>

            {/* Data Quality Measures */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Data Quality Measures <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply, optional)</span>
                </label>

                <div style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {qualityMeasureOptions.map((option) => (
                        <label
                            key={option.id}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.data_quality_measures.includes(option.id)}
                                onChange={(e) => handleArrayChange('data_quality_measures', option.id, e.target.checked)}
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
            </div>

            {/* Bias Assessment */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Bias Assessment *
                </label>

                <div style={{
                    border: errors.bias_assessment ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {biasAssessmentOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.bias_assessment === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.bias_assessment === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="bias_assessment"
                                value={option.value}
                                checked={formData.bias_assessment === option.value}
                                onChange={(e) => handleInputChange('bias_assessment', e.target.value)}
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

                {errors.bias_assessment && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.bias_assessment}
                    </div>
                )}
            </div>

            {/* Data Governance */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Data Governance Framework *
                </label>

                <div style={{
                    border: errors.data_governance ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {governanceOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.data_governance === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.data_governance === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="data_governance"
                                value={option.value}
                                checked={formData.data_governance === option.value}
                                onChange={(e) => handleInputChange('data_governance', e.target.value)}
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

                {errors.data_governance && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.data_governance}
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
                        {saving ? 'Saving...' : 'Save & Continue →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step3DataAssessment;
