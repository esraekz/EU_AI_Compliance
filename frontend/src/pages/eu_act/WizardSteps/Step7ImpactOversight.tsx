import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step7Data {
    people_affected_count: string;
    vulnerable_groups: string[];
    potential_impact: string;
    human_oversight_model: string;
    humans_can_override: string;
    output_review_frequency: string;
    fallback_human_contact: string;
}

interface Step7Props {
    systemId: string;
    initialData?: {
        people_affected_count?: string;
        vulnerable_groups?: any;
        potential_impact?: string;
        human_oversight_model?: string;
        humans_can_override?: string;
        output_review_frequency?: string;
        fallback_human_contact?: string;
    };
    onNext: (data: Step7Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step7ImpactOversight: React.FC<Step7Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step7Data>({
        people_affected_count: '',
        vulnerable_groups: [],
        potential_impact: '',
        human_oversight_model: '',
        humans_can_override: '',
        output_review_frequency: '',
        fallback_human_contact: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                people_affected_count: initialData.people_affected_count || '',
                vulnerable_groups: parseArrayField(initialData.vulnerable_groups) || [],
                potential_impact: initialData.potential_impact || '',
                human_oversight_model: initialData.human_oversight_model || '',
                humans_can_override: initialData.humans_can_override || '',
                output_review_frequency: initialData.output_review_frequency || '',
                fallback_human_contact: initialData.fallback_human_contact || ''
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

    const handleInputChange = (field: keyof Omit<Step7Data, 'vulnerable_groups'>, value: string) => {
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

    const handleArrayChange = (field: keyof Pick<Step7Data, 'vulnerable_groups'>, value: string, checked: boolean) => {
        setFormData(prev => {
            const currentArray = prev[field];
            let newArray: string[];

            if (value === 'none') {
                // If "None" is selected, clear all other selections
                newArray = checked ? ['none'] : [];
            } else {
                // If any other option is selected, remove "None" if present
                const filteredArray = currentArray.filter(item => item !== 'none');
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

        if (!formData.people_affected_count.trim()) {
            newErrors.people_affected_count = 'Please specify how many people are affected';
        }

        if (formData.vulnerable_groups.length === 0) {
            newErrors.vulnerable_groups = 'Please specify if vulnerable groups are affected';
        }

        if (!formData.potential_impact) {
            newErrors.potential_impact = 'Please select the potential impact level';
        }

        if (!formData.human_oversight_model) {
            newErrors.human_oversight_model = 'Please select the human oversight model';
        }

        if (!formData.humans_can_override) {
            newErrors.humans_can_override = 'Please specify if humans can override AI decisions';
        }

        if (!formData.output_review_frequency) {
            newErrors.output_review_frequency = 'Please specify how often outputs are reviewed';
        }

        if (!formData.fallback_human_contact) {
            newErrors.fallback_human_contact = 'Please specify if fallback human contact is available';
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
                step: 7,
                data: formData
            });

            // Call parent's onNext handler
            onNext(formData);

        } catch (error) {
            console.error('Error saving Step 7:', error);
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
                step: 7,
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

    const vulnerableGroupOptions = [
        { id: 'children', label: 'Children (under 18)' },
        { id: 'elderly', label: 'Elderly persons' },
        { id: 'disabled', label: 'Persons with disabilities' },
        { id: 'none', label: 'None of the above' }
    ];

    const potentialImpactOptions = [
        {
            value: 'minor_suggestions',
            label: 'Minor Suggestions',
            description: 'System provides recommendations that users can easily ignore'
        },
        {
            value: 'operational_decisions',
            label: 'Operational Decisions',
            description: 'System influences day-to-day operations or business processes'
        },
        {
            value: 'life_changing_legal',
            label: 'Life-changing/Legal Effects',
            description: 'System significantly impacts fundamental rights, legal status, or life opportunities'
        }
    ];

    const oversightModelOptions = [
        {
            value: 'human_in_loop',
            label: 'Human-in-the-loop',
            description: 'Humans actively participate in each decision cycle'
        },
        {
            value: 'human_on_loop',
            label: 'Human-on-the-loop',
            description: 'Humans monitor and can intervene when necessary'
        },
        {
            value: 'human_in_command',
            label: 'Human-in-command',
            description: 'Humans maintain full control and final authority'
        }
    ];

    const reviewFrequencyOptions = [
        { value: 'real_time', label: 'Real-time' },
        { value: 'periodically', label: 'Periodically' },
        { value: 'rarely', label: 'Rarely' },
        { value: 'never', label: 'Never' }
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
                    Impact Assessment & Human Oversight
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Evaluate the scope of impact and define human oversight mechanisms for your AI system.
                </p>
            </div>

            {/* Question 1: People Affected Count */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    How many people are affected by the system? *
                </label>
                <input
                    type="text"
                    value={formData.people_affected_count}
                    onChange={(e) => handleInputChange('people_affected_count', e.target.value)}
                    placeholder="e.g., 100-500 employees, 10,000+ customers, Unknown"
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.people_affected_count ? '#dc3545' : '#ddd'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                    }}
                />
                {errors.people_affected_count && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                        {errors.people_affected_count}
                    </div>
                )}
            </div>

            {/* Question 2: Vulnerable Groups */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Are vulnerable groups affected? * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.vulnerable_groups ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '8px'
                }}>
                    {vulnerableGroupOptions.map((option) => (
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
                                checked={formData.vulnerable_groups.includes(option.id)}
                                onChange={(e) => handleArrayChange('vulnerable_groups', option.id, e.target.checked)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.vulnerable_groups && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.vulnerable_groups}
                    </div>
                )}
            </div>

            {/* Question 3: Potential Impact */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the potential impact? *
                </label>

                <div style={{
                    border: errors.potential_impact ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {potentialImpactOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.potential_impact === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.potential_impact === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="potential_impact"
                                value={option.value}
                                checked={formData.potential_impact === option.value}
                                onChange={(e) => handleInputChange('potential_impact', e.target.value)}
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

                {errors.potential_impact && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.potential_impact}
                    </div>
                )}
            </div>

            {/* Question 4: Human Oversight Model */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    What is the human oversight model? *
                </label>

                <div style={{
                    border: errors.human_oversight_model ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {oversightModelOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.human_oversight_model === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.human_oversight_model === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="human_oversight_model"
                                value={option.value}
                                checked={formData.human_oversight_model === option.value}
                                onChange={(e) => handleInputChange('human_oversight_model', e.target.value)}
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

                {errors.human_oversight_model && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.human_oversight_model}
                    </div>
                )}
            </div>

            {/* Question 5: Humans Can Override */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Can humans override AI decisions? *
                </label>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    border: errors.humans_can_override ? '1px solid #dc3545' : 'none',
                    borderRadius: '6px',
                    padding: errors.humans_can_override ? '8px' : '0'
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
                                backgroundColor: formData.humans_can_override === option.value ? '#f8f7ff' : '#f7fafc',
                                border: `1px solid ${formData.humans_can_override === option.value ? '#6030c9' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <input
                                type="radio"
                                name="humans_can_override"
                                value={option.value}
                                checked={formData.humans_can_override === option.value}
                                onChange={(e) => handleInputChange('humans_can_override', e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.humans_can_override && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.humans_can_override}
                    </div>
                )}
            </div>

            {/* Question 6: Output Review Frequency */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    How often are outputs reviewed? *
                </label>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    border: errors.output_review_frequency ? '1px solid #dc3545' : 'none',
                    borderRadius: '6px',
                    padding: errors.output_review_frequency ? '8px' : '0'
                }}>
                    {reviewFrequencyOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: formData.output_review_frequency === option.value ? '#f8f7ff' : '#f7fafc',
                                border: `1px solid ${formData.output_review_frequency === option.value ? '#6030c9' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <input
                                type="radio"
                                name="output_review_frequency"
                                value={option.value}
                                checked={formData.output_review_frequency === option.value}
                                onChange={(e) => handleInputChange('output_review_frequency', e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.output_review_frequency && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.output_review_frequency}
                    </div>
                )}
            </div>

            {/* Question 7: Fallback Human Contact */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Is there a fallback human contact available for users? *
                </label>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    border: errors.fallback_human_contact ? '1px solid #dc3545' : 'none',
                    borderRadius: '6px',
                    padding: errors.fallback_human_contact ? '8px' : '0'
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
                                backgroundColor: formData.fallback_human_contact === option.value ? '#f8f7ff' : '#f7fafc',
                                border: `1px solid ${formData.fallback_human_contact === option.value ? '#6030c9' : '#e2e8f0'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            <input
                                type="radio"
                                name="fallback_human_contact"
                                value={option.value}
                                checked={formData.fallback_human_contact === option.value}
                                onChange={(e) => handleInputChange('fallback_human_contact', e.target.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                {errors.fallback_human_contact && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.fallback_human_contact}
                    </div>
                )}
            </div>

            {/* Information Box based on responses */}
            {formData.potential_impact === 'life_changing_legal' && (
                <div style={{
                    backgroundColor: '#fff5d4',
                    border: '1px solid #ed8936',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#c05621', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        ⚠️ High Impact System Detected
                    </h4>
                    <p style={{ color: '#c05621', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        Life-changing/legal impact systems require enhanced human oversight measures and may be subject to additional compliance requirements under the AI Act.
                    </p>
                </div>
            )}

            {formData.vulnerable_groups.some(group => ['children', 'elderly', 'disabled'].includes(group)) && (
                <div style={{
                    backgroundColor: '#fff5d4',
                    border: '1px solid #ed8936',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ color: '#c05621', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        🛡️ Vulnerable Groups Protection
                    </h4>
                    <p style={{ color: '#c05621', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                        Systems affecting vulnerable groups require additional safeguards and may be classified as high-risk under the AI Act.
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

export default Step7ImpactOversight;
