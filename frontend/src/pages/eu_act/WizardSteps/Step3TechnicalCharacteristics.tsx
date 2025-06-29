import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step3Data {
    ai_model_type: string;
    model_architecture: string;
    data_processing: string;
    input_data_types: string[];
    output_types: string[];
    decision_autonomy: string;
}

interface Step3Props {
    systemId: string;
    initialData?: {
        ai_model_type?: string;
        model_architecture?: string;
        data_processing?: string;
        input_data_types?: any;
        output_types?: any;
        decision_autonomy?: string;
    };
    onNext: (data: Step3Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step3TechnicalCharacteristics: React.FC<Step3Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step3Data>({
        ai_model_type: '',
        model_architecture: '',
        data_processing: '',
        input_data_types: [],
        output_types: [],
        decision_autonomy: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                ai_model_type: initialData.ai_model_type || '',
                model_architecture: initialData.model_architecture || '',
                data_processing: initialData.data_processing || '',
                input_data_types: parseArrayField(initialData.input_data_types) || [],
                output_types: parseArrayField(initialData.output_types) || [],
                decision_autonomy: initialData.decision_autonomy || ''
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

    const handleInputChange = (field: keyof Omit<Step3Data, 'input_data_types' | 'output_types'>, value: string) => {
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

    const handleArrayChange = (field: keyof Pick<Step3Data, 'input_data_types' | 'output_types'>, value: string, checked: boolean) => {
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

        if (!formData.ai_model_type) {
            newErrors.ai_model_type = 'Please select the AI model type';
        }

        if (!formData.data_processing) {
            newErrors.data_processing = 'Please select how the system processes data';
        }

        if (formData.input_data_types.length === 0) {
            newErrors.input_data_types = 'Please select at least one input data type';
        }

        if (formData.output_types.length === 0) {
            newErrors.output_types = 'Please select at least one output type';
        }

        if (!formData.decision_autonomy) {
            newErrors.decision_autonomy = 'Please select the decision autonomy level';
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

    const aiModelOptions = [
        { value: 'machine_learning', label: 'Machine Learning' },
        { value: 'rule_based', label: 'Rule-based' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'generative', label: 'Generative' },
        { value: 'other', label: 'Other' }
    ];

    const dataProcessingOptions = [
        { value: 'real_time', label: 'Real-time', description: 'Processes data immediately as it arrives' },
        { value: 'batch', label: 'Batch', description: 'Processes data in scheduled batches or groups' }
    ];

    const inputDataOptions = [
        { id: 'text', label: 'Text' },
        { id: 'image', label: 'Image' },
        { id: 'audio', label: 'Audio' },
        { id: 'video', label: 'Video' },
        { id: 'biometric', label: 'Biometric' },
        { id: 'sensor', label: 'Sensor' },
        { id: 'other', label: 'Other' }
    ];

    const outputTypeOptions = [
        { id: 'scores', label: 'Scores' },
        { id: 'recommendations', label: 'Recommendations' },
        { id: 'classifications', label: 'Classifications' },
        { id: 'decisions', label: 'Decisions' },
        { id: 'other', label: 'Other' }
    ];

    const decisionAutonomyOptions = [
        { value: 'manual_aid', label: 'Manual aid', description: 'System provides information to assist human decision-makers' },
        { value: 'partial_automation', label: 'Partial automation', description: 'System makes some decisions but requires human oversight or approval' },
        { value: 'full_autonomy', label: 'Full autonomy', description: 'System makes decisions independently without human intervention' }
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
                    Technical Characteristics
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Provide technical details about your AI system's architecture and processing capabilities.
                </p>
            </div>

            {/* AI Model Type */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What type of AI model is used? *
                </label>
                <select
                    value={formData.ai_model_type}
                    onChange={(e) => handleInputChange('ai_model_type', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.ai_model_type ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6030c9'}
                    onBlur={(e) => e.target.style.borderColor = errors.ai_model_type ? '#dc3545' : '#ddd'}
                >
                    <option value="">Select AI model type...</option>
                    {aiModelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {errors.ai_model_type && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.ai_model_type}
                    </div>
                )}
            </div>

            {/* Model Architecture */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the model architecture?
                </label>
                <input
                    type="text"
                    value={formData.model_architecture}
                    onChange={(e) => handleInputChange('model_architecture', e.target.value)}
                    placeholder="e.g., Neural Network, Decision Tree, GPT, BERT, Random Forest..."
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
                    Optional: Specific technical architecture or algorithm used
                </div>
            </div>

            {/* Data Processing */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    How does it process data? *
                </label>

                <div style={{
                    border: errors.data_processing ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {dataProcessingOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.data_processing === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.data_processing === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="data_processing"
                                value={option.value}
                                checked={formData.data_processing === option.value}
                                onChange={(e) => handleInputChange('data_processing', e.target.value)}
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

                {errors.data_processing && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.data_processing}
                    </div>
                )}
            </div>

            {/* Input Data Types */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What types of input data does it use? * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.input_data_types ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px'
                }}>
                    {inputDataOptions.map((option) => (
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
                                checked={formData.input_data_types.includes(option.id)}
                                onChange={(e) => handleArrayChange('input_data_types', option.id, e.target.checked)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.input_data_types && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.input_data_types}
                    </div>
                )}
            </div>

            {/* Output Types */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What kind of outputs does it produce? * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.output_types ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px'
                }}>
                    {outputTypeOptions.map((option) => (
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
                                checked={formData.output_types.includes(option.id)}
                                onChange={(e) => handleArrayChange('output_types', option.id, e.target.checked)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.output_types && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.output_types}
                    </div>
                )}
            </div>

            {/* Decision Autonomy */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the decision autonomy level? *
                </label>

                <div style={{
                    border: errors.decision_autonomy ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {decisionAutonomyOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.decision_autonomy === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.decision_autonomy === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="decision_autonomy"
                                value={option.value}
                                checked={formData.decision_autonomy === option.value}
                                onChange={(e) => handleInputChange('decision_autonomy', e.target.value)}
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

                {errors.decision_autonomy && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.decision_autonomy}
                    </div>
                )}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                    Higher autonomy levels may require additional compliance measures
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

export default Step3TechnicalCharacteristics;
