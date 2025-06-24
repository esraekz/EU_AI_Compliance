// src/pages/eu_act/WizardSteps/Step3TechnicalCharacteristics.tsx - Refined Elegant Style
import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step3Data {
    ai_model_type: string;
    model_architecture: string;
    data_processing_type: string;
    input_data_types: string[];
    output_types: string[];
    decision_autonomy: string;
}

interface Step3Props {
    systemId: string;
    initialData?: {
        ai_model_type?: string;
        model_architecture?: string;
        data_processing_type?: string;
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
        data_processing_type: '',
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
                data_processing_type: initialData.data_processing_type || '',
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

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.ai_model_type) {
            newErrors.ai_model_type = 'Please select the AI model type';
        }

        if (!formData.model_architecture) {
            newErrors.model_architecture = 'Please specify the model architecture';
        }

        if (!formData.data_processing_type) {
            newErrors.data_processing_type = 'Please select data processing type';
        }

        if (formData.input_data_types.length === 0) {
            newErrors.input_data_types = 'Please select at least one input data type';
        }

        if (formData.output_types.length === 0) {
            newErrors.output_types = 'Please select at least one output type';
        }

        if (!formData.decision_autonomy) {
            newErrors.decision_autonomy = 'Please specify decision autonomy level';
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

    const modelTypeOptions = [
        { value: 'machine_learning', label: 'Machine Learning', description: 'Systems that learn patterns from data using algorithms' },
        { value: 'rule_based', label: 'Rule-Based System', description: 'Systems that use predefined rules and logic' },
        { value: 'hybrid', label: 'Hybrid System', description: 'Combination of machine learning and rule-based approaches' },
        { value: 'generative', label: 'Generative AI', description: 'Systems that create new content (text, images, audio)' }
    ];

    const architectureOptions = [
        { value: 'neural_network', label: 'Neural Network' },
        { value: 'transformer', label: 'Transformer' },
        { value: 'decision_tree', label: 'Decision Tree' },
        { value: 'ensemble', label: 'Ensemble Methods' },
        { value: 'llm', label: 'Large Language Model' },
        { value: 'cnn', label: 'Convolutional Neural Network' },
        { value: 'rnn_lstm', label: 'RNN/LSTM' },
        { value: 'svm', label: 'Support Vector Machine' },
        { value: 'other', label: 'Other Architecture' }
    ];

    const processingOptions = [
        { value: 'real_time', label: 'Real-Time Processing', description: 'Processes data immediately as it arrives' },
        { value: 'batch', label: 'Batch Processing', description: 'Processes data in scheduled batches' },
        { value: 'both', label: 'Both Real-Time and Batch', description: 'Supports both processing modes' }
    ];

    const inputDataOptions = [
        { id: 'text', label: 'Text Data' },
        { id: 'image', label: 'Images' },
        { id: 'audio', label: 'Audio' },
        { id: 'video', label: 'Video' },
        { id: 'structured_data', label: 'Structured Data' },
        { id: 'sensor_data', label: 'Sensor Data' },
        { id: 'biometric', label: 'Biometric Data' },
        { id: 'behavioral', label: 'Behavioral Data' }
    ];

    const outputTypeOptions = [
        { id: 'classification', label: 'Classification' },
        { id: 'prediction', label: 'Prediction' },
        { id: 'recommendation', label: 'Recommendation' },
        { id: 'generation', label: 'Content Generation' },
        { id: 'detection', label: 'Detection/Recognition' },
        { id: 'scoring', label: 'Scoring/Ranking' },
        { id: 'optimization', label: 'Optimization' },
        { id: 'decision_support', label: 'Decision Support' }
    ];

    const autonomyOptions = [
        { value: 'fully_automated', label: 'Fully Automated', description: 'System makes decisions automatically', riskColor: '#f56565' },
        { value: 'human_oversight', label: 'Human Oversight', description: 'Human monitors and can intervene', riskColor: '#ed8936' },
        { value: 'human_approval', label: 'Human Approval Required', description: 'All decisions require human approval', riskColor: '#38a169' }
    ];

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
                    Technical Characteristics
                </h2>
                <p style={{ color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
                    Provide technical details about your AI system's architecture and processing capabilities.
                </p>
            </div>

            {/* AI Model Type */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2d3748', fontSize: '14px' }}>
                    AI Model Type *
                </label>
                <div style={{
                    border: errors.ai_model_type ? '1px solid #f56565' : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#f7fafc'
                }}>
                    {modelTypeOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #e2e8f0'
                            }}
                        >
                            <input
                                type="radio"
                                name="ai_model_type"
                                value={option.value}
                                checked={formData.ai_model_type === option.value}
                                onChange={(e) => handleInputChange('ai_model_type', e.target.value)}
                                style={{ marginTop: '2px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '500', color: '#2d3748', fontSize: '13px', marginBottom: '2px' }}>
                                    {option.label}
                                </div>
                                <div style={{ color: '#718096', fontSize: '11px' }}>
                                    {option.description}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
                {errors.ai_model_type && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                        {errors.ai_model_type}
                    </div>
                )}
            </div>

            {/* Model Architecture */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2d3748', fontSize: '14px' }}>
                    Model Architecture *
                </label>
                <select
                    value={formData.model_architecture}
                    onChange={(e) => handleInputChange('model_architecture', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: errors.model_architecture ? '1px solid #f56565' : '1px solid #cbd5e0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <option value="">Select architecture...</option>
                    {architectureOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {errors.model_architecture && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                        {errors.model_architecture}
                    </div>
                )}
            </div>

            {/* Data Processing Type */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2d3748', fontSize: '14px' }}>
                    Data Processing Type *
                </label>
                <div style={{
                    border: errors.data_processing_type ? '1px solid #f56565' : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#f7fafc'
                }}>
                    {processingOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #e2e8f0'
                            }}
                        >
                            <input
                                type="radio"
                                name="data_processing_type"
                                value={option.value}
                                checked={formData.data_processing_type === option.value}
                                onChange={(e) => handleInputChange('data_processing_type', e.target.value)}
                                style={{ marginTop: '2px' }}
                            />
                            <div>
                                <div style={{ fontWeight: '500', color: '#2d3748', fontSize: '13px', marginBottom: '2px' }}>
                                    {option.label}
                                </div>
                                <div style={{ color: '#718096', fontSize: '11px' }}>
                                    {option.description}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
                {errors.data_processing_type && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                        {errors.data_processing_type}
                    </div>
                )}
            </div>

            {/* Input Data Types */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2d3748', fontSize: '14px' }}>
                    Input Data Types * <span style={{ fontSize: '12px', color: '#718096', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>
                <div style={{
                    border: errors.input_data_types ? '1px solid #f56565' : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#f7fafc',
                    padding: '10px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '8px'
                }}>
                    {inputDataOptions.map((option) => (
                        <label
                            key={option.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
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
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                        {errors.input_data_types}
                    </div>
                )}
            </div>

            {/* Output Types */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2d3748', fontSize: '14px' }}>
                    Output Types * <span style={{ fontSize: '12px', color: '#718096', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>
                <div style={{
                    border: errors.output_types ? '1px solid #f56565' : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#f7fafc',
                    padding: '10px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '8px'
                }}>
                    {outputTypeOptions.map((option) => (
                        <label
                            key={option.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 8px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
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
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                        {errors.output_types}
                    </div>
                )}
            </div>

            {/* Decision Autonomy */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2d3748', fontSize: '14px' }}>
                    Decision Autonomy Level *
                </label>
                <div style={{
                    border: errors.decision_autonomy ? '1px solid #f56565' : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#f7fafc'
                }}>
                    {autonomyOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #e2e8f0'
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
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: '500', color: '#2d3748', fontSize: '13px' }}>
                                        {option.label}
                                    </span>
                                    <span style={{
                                        backgroundColor: option.riskColor,
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        fontSize: '10px',
                                        fontWeight: '600'
                                    }}>
                                        RISK
                                    </span>
                                </div>
                                <div style={{ color: '#718096', fontSize: '11px', marginTop: '2px' }}>
                                    {option.description}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
                {errors.decision_autonomy && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                        {errors.decision_autonomy}
                    </div>
                )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
                <div style={{
                    backgroundColor: '#fed7d7',
                    border: '1px solid #f56565',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    color: '#c53030',
                    marginBottom: '16px',
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

export default Step3TechnicalCharacteristics;
