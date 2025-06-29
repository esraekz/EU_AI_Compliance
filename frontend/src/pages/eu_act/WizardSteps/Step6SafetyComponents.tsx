import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step6Data {
    ai_regulated_product: string;
    safety_sector: string;
    third_party_conformity: string;
    ce_marking_required: string;
    applicable_legislation: string[];
}

interface Step6Props {
    systemId: string;
    initialData?: {
        ai_regulated_product?: string;
        safety_sector?: string;
        third_party_conformity?: string;
        ce_marking_required?: string;
        applicable_legislation?: any;
    };
    onNext: (data: Step6Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step6SafetyComponents: React.FC<Step6Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step6Data>({
        ai_regulated_product: '',
        safety_sector: '',
        third_party_conformity: '',
        ce_marking_required: '',
        applicable_legislation: []
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSectorQuestion, setShowSectorQuestion] = useState(false);
    const [showFollowUpQuestions, setShowFollowUpQuestions] = useState(false);

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                ai_regulated_product: initialData.ai_regulated_product || '',
                safety_sector: initialData.safety_sector || '',
                third_party_conformity: initialData.third_party_conformity || '',
                ce_marking_required: initialData.ce_marking_required || '',
                applicable_legislation: parseArrayField(initialData.applicable_legislation) || []
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

    // Control question visibility based on answers
    useEffect(() => {
        setShowSectorQuestion(formData.ai_regulated_product === 'yes');
        setShowFollowUpQuestions(formData.ai_regulated_product === 'yes' && formData.safety_sector !== '');
    }, [formData.ai_regulated_product, formData.safety_sector]);

    const handleInputChange = (field: keyof Omit<Step6Data, 'applicable_legislation'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear dependent fields when main question changes
        if (field === 'ai_regulated_product' && value === 'no') {
            setFormData(prev => ({
                ...prev,
                safety_sector: '',
                third_party_conformity: '',
                ce_marking_required: '',
                applicable_legislation: []
            }));
        }

        // Clear error when user makes selection
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleArrayChange = (field: keyof Pick<Step6Data, 'applicable_legislation'>, value: string, checked: boolean) => {
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

        if (!formData.ai_regulated_product) {
            newErrors.ai_regulated_product = 'Please answer whether AI is part of a regulated product';
        }

        if (formData.ai_regulated_product === 'yes') {
            if (!formData.safety_sector) {
                newErrors.safety_sector = 'Please select which sector applies';
            }

            if (!formData.third_party_conformity) {
                newErrors.third_party_conformity = 'Please answer about third-party conformity assessment';
            }

            if (!formData.ce_marking_required) {
                newErrors.ce_marking_required = 'Please answer about CE marking requirements';
            }

            if (formData.applicable_legislation.length === 0) {
                newErrors.applicable_legislation = 'Please select at least one applicable legislation';
            }
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
                step: 6,
                data: formData
            });

            // Call parent's onNext handler
            onNext(formData);

        } catch (error) {
            console.error('Error saving Step 6:', error);
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
                step: 6,
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

    const sectorOptions = [
        { value: 'medical_devices', label: 'Medical Devices' },
        { value: 'machinery', label: 'Machinery' },
        { value: 'automotive', label: 'Automotive' },
        { value: 'aviation', label: 'Aviation' },
        { value: 'industrial_robots', label: 'Industrial Robots' },
        { value: 'other', label: 'Other' }
    ];

    const legislationOptions = [
        { id: 'mdr', label: 'MDR (Medical Device Regulation)' },
        { id: 'machinery_directive', label: 'Machinery Directive' },
        { id: 'general_product_safety', label: 'General Product Safety Directive' },
        { id: 'aviation_regulation', label: 'Aviation Regulation' },
        { id: 'other', label: 'Other' }
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
                    Article 6 – Safety Component Check
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Determine if your AI system is a safety component under existing EU product safety legislation.
                </p>
            </div>

            {/* Question 1: Regulated Product */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Is the AI part of a product regulated by EU safety legislation? *
                </label>

                <div style={{
                    border: errors.ai_regulated_product ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {[
                        { value: 'yes', label: 'Yes', description: 'The AI system is integrated into or is a component of a product covered by EU safety legislation' },
                        { value: 'no', label: 'No', description: 'The AI system is standalone or not part of a regulated product' }
                    ].map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.ai_regulated_product === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.ai_regulated_product === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="ai_regulated_product"
                                value={option.value}
                                checked={formData.ai_regulated_product === option.value}
                                onChange={(e) => handleInputChange('ai_regulated_product', e.target.value)}
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

                {errors.ai_regulated_product && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.ai_regulated_product}
                    </div>
                )}
            </div>

            {/* Question 2: Sector (only if Yes to Q1) */}
            {showSectorQuestion && (
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#333',
                        fontSize: '16px'
                    }}>
                        Which sector applies? *
                    </label>
                    <select
                        value={formData.safety_sector}
                        onChange={(e) => handleInputChange('safety_sector', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: `2px solid ${errors.safety_sector ? '#dc3545' : '#ddd'}`,
                            borderRadius: '8px',
                            fontSize: '16px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                        }}
                    >
                        <option value="">Select sector...</option>
                        {sectorOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.safety_sector && (
                        <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                            {errors.safety_sector}
                        </div>
                    )}
                </div>
            )}

            {/* Follow-up Questions (only if sector is selected) */}
            {showFollowUpQuestions && (
                <>
                    {/* Question 3: Third-party Conformity Assessment */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontWeight: '500',
                            color: '#333',
                            fontSize: '16px'
                        }}>
                            Does the product require third-party conformity assessment? *
                        </label>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            border: errors.third_party_conformity ? '1px solid #dc3545' : 'none',
                            borderRadius: '6px',
                            padding: errors.third_party_conformity ? '8px' : '0'
                        }}>
                            {[
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' },
                                { value: 'not_sure', label: 'Not Sure' }
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        backgroundColor: formData.third_party_conformity === option.value ? '#f8f7ff' : '#f7fafc',
                                        border: `1px solid ${formData.third_party_conformity === option.value ? '#6030c9' : '#e2e8f0'}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="third_party_conformity"
                                        value={option.value}
                                        checked={formData.third_party_conformity === option.value}
                                        onChange={(e) => handleInputChange('third_party_conformity', e.target.value)}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>

                        {errors.third_party_conformity && (
                            <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                                {errors.third_party_conformity}
                            </div>
                        )}
                    </div>

                    {/* Question 4: CE Marking */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontWeight: '500',
                            color: '#333',
                            fontSize: '16px'
                        }}>
                            Is CE marking required under existing laws? *
                        </label>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            border: errors.ce_marking_required ? '1px solid #dc3545' : 'none',
                            borderRadius: '6px',
                            padding: errors.ce_marking_required ? '8px' : '0'
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
                                        backgroundColor: formData.ce_marking_required === option.value ? '#f8f7ff' : '#f7fafc',
                                        border: `1px solid ${formData.ce_marking_required === option.value ? '#6030c9' : '#e2e8f0'}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="ce_marking_required"
                                        value={option.value}
                                        checked={formData.ce_marking_required === option.value}
                                        onChange={(e) => handleInputChange('ce_marking_required', e.target.value)}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>

                        {errors.ce_marking_required && (
                            <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                                {errors.ce_marking_required}
                            </div>
                        )}
                    </div>

                    {/* Question 5: Applicable Legislation */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontWeight: '500',
                            color: '#333',
                            fontSize: '16px'
                        }}>
                            Which legislation applies? * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                        </label>

                        <div style={{
                            border: errors.applicable_legislation ? '2px solid #dc3545' : '2px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '8px'
                        }}>
                            {legislationOptions.map((option) => (
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
                                        checked={formData.applicable_legislation.includes(option.id)}
                                        onChange={(e) => handleArrayChange('applicable_legislation', option.id, e.target.checked)}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>

                        {errors.applicable_legislation && (
                            <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                                {errors.applicable_legislation}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Information Box */}
            {formData.ai_regulated_product === 'yes' && (
                <div style={{
                    backgroundColor: '#fff5d4',
                    border: '1px solid #ed8936',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#c05621', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        💡 Safety Component Requirements
                    </h4>
                    <p style={{ color: '#c05621', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        Your AI system is a safety component under Article 6 and must comply with existing EU product safety legislation in addition to AI Act requirements. This may include technical documentation, conformity assessment, and CE marking.
                    </p>
                </div>
            )}

            {formData.ai_regulated_product === 'no' && (
                <div style={{
                    backgroundColor: '#f0fff4',
                    border: '1px solid #68d391',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#22543d', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        ✅ Standalone AI System
                    </h4>
                    <p style={{ color: '#22543d', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        Your AI system is not subject to existing EU product safety legislation. It will be assessed solely under AI Act requirements.
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

export default Step6SafetyComponents;
