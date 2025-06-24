// src/pages/eu_act/WizardSteps/Step4DeploymentAnalysis.tsx
import React, { useEffect, useState } from 'react';
import { aiSystemsApi } from '../../../services/api';

interface Step4Data {
    target_users: string[];
    geographic_scope: string;
    usage_volume: string;
    deployment_environment: string;
    human_oversight: string;
    monitoring_capabilities: string[];
    user_interaction: string;
    decision_automation: string;
    fallback_mechanisms: string;
}

interface Step4Props {
    systemId: string;
    initialData?: {
        target_users?: any;
        geographic_scope?: string;
        usage_volume?: string;
        deployment_environment?: string;
        human_oversight?: string;
        monitoring_capabilities?: any;
        user_interaction?: string;
        decision_automation?: string;
        fallback_mechanisms?: string;
    };
    onNext: (data: Step4Data) => void;
    onBack?: () => void;
    loading?: boolean;
}

const Step4DeploymentAnalysis: React.FC<Step4Props> = ({
    systemId,
    initialData,
    onNext,
    onBack,
    loading = false
}) => {
    const [formData, setFormData] = useState<Step4Data>({
        target_users: [],
        geographic_scope: '',
        usage_volume: '',
        deployment_environment: '',
        human_oversight: '',
        monitoring_capabilities: [],
        user_interaction: '',
        decision_automation: '',
        fallback_mechanisms: ''
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                target_users: parseArrayField(initialData.target_users) || [],
                geographic_scope: initialData.geographic_scope || '',
                usage_volume: initialData.usage_volume || '',
                deployment_environment: initialData.deployment_environment || '',
                human_oversight: initialData.human_oversight || '',
                monitoring_capabilities: parseArrayField(initialData.monitoring_capabilities) || [],
                user_interaction: initialData.user_interaction || '',
                decision_automation: initialData.decision_automation || '',
                fallback_mechanisms: initialData.fallback_mechanisms || ''
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

    const handleArrayChange = (field: keyof Pick<Step4Data, 'target_users' | 'monitoring_capabilities'>, value: string, checked: boolean) => {
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

    const handleInputChange = (field: keyof Omit<Step4Data, 'target_users' | 'monitoring_capabilities'>, value: string) => {
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

        if (formData.target_users.length === 0) {
            newErrors.target_users = 'Please select at least one target user group';
        }

        if (!formData.geographic_scope) {
            newErrors.geographic_scope = 'Please specify geographic deployment scope';
        }

        if (!formData.usage_volume) {
            newErrors.usage_volume = 'Please select expected usage volume';
        }

        if (!formData.deployment_environment) {
            newErrors.deployment_environment = 'Please specify deployment environment';
        }

        if (!formData.human_oversight) {
            newErrors.human_oversight = 'Please specify human oversight level';
        }

        if (!formData.user_interaction) {
            newErrors.user_interaction = 'Please specify user interaction type';
        }

        if (!formData.decision_automation) {
            newErrors.decision_automation = 'Please specify decision automation level';
        }

        if (!formData.fallback_mechanisms) {
            newErrors.fallback_mechanisms = 'Please specify fallback mechanisms';
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

    const targetUserOptions = [
        { id: 'general_public', label: 'General Public', description: 'Available to any member of the general public' },
        { id: 'employees', label: 'Employees', description: 'Used by company employees, workers, job applicants' },
        { id: 'customers', label: 'Customers/Clients', description: 'Used by customers, clients, or service users' },
        { id: 'students', label: 'Students/Learners', description: 'Used in educational institutions, training programs' },
        { id: 'patients', label: 'Patients/Healthcare', description: 'Used by patients, healthcare providers, medical professionals' },
        { id: 'law_enforcement', label: 'Law Enforcement', description: 'Used by police, security, border control, judicial system' },
        { id: 'government', label: 'Government/Public Sector', description: 'Used by government agencies, public administrations' },
        { id: 'children', label: 'Children/Minors', description: 'Specifically targets or is accessible to people under 18' },
        { id: 'vulnerable_groups', label: 'Vulnerable Groups', description: 'Elderly, disabled, economically disadvantaged populations' }
    ];

    const geographicOptions = [
        { value: 'eu_only', label: 'EU Only', description: 'Deployed only within European Union member states' },
        { value: 'eu_plus_eea', label: 'EU + EEA', description: 'European Union plus European Economic Area' },
        { value: 'eu_plus_selected', label: 'EU + Selected Countries', description: 'EU plus specific non-EU countries' },
        { value: 'global', label: 'Global Deployment', description: 'Worldwide deployment including EU' },
        { value: 'pilot_limited', label: 'Pilot/Limited Deployment', description: 'Limited geographic testing or pilot program' }
    ];

    const usageVolumeOptions = [
        { value: 'low_volume', label: 'Low Volume', description: 'Less than 1,000 users or interactions per month' },
        { value: 'medium_volume', label: 'Medium Volume', description: '1,000 - 10,000 users or interactions per month' },
        { value: 'high_volume', label: 'High Volume', description: '10,000 - 100,000 users or interactions per month' },
        { value: 'very_high_volume', label: 'Very High Volume', description: 'More than 100,000 users or interactions per month' },
        { value: 'variable_volume', label: 'Variable Volume', description: 'Usage varies significantly based on conditions' }
    ];

    const environmentOptions = [
        { value: 'cloud_saas', label: 'Cloud/SaaS', description: 'Cloud-based service, software as a service' },
        { value: 'on_premise', label: 'On-Premise', description: 'Deployed on customer or organization premises' },
        { value: 'mobile_app', label: 'Mobile Application', description: 'Mobile app deployment on devices' },
        { value: 'embedded_system', label: 'Embedded System', description: 'Embedded in hardware devices, IoT, appliances' },
        { value: 'critical_infrastructure', label: 'Critical Infrastructure', description: 'Part of critical infrastructure (power, transport, etc.)' },
        { value: 'hybrid', label: 'Hybrid Environment', description: 'Combination of multiple deployment types' }
    ];

    const oversightOptions = [
        { value: 'full_human_control', label: 'Full Human Control', description: 'Humans make all final decisions, AI provides recommendations only' },
        { value: 'human_in_loop', label: 'Human-in-the-Loop', description: 'Human oversight for critical decisions, some automated decisions allowed' },
        { value: 'human_on_loop', label: 'Human-on-the-Loop', description: 'Human monitoring with ability to intervene when needed' },
        { value: 'human_out_loop', label: 'Human-out-of-Loop', description: 'Fully automated decisions with minimal human oversight' },
        { value: 'no_human_oversight', label: 'No Human Oversight', description: 'Completely autonomous operation without human intervention' }
    ];

    const monitoringOptions = [
        { id: 'performance_monitoring', label: 'Performance Monitoring', description: 'Tracking system accuracy, response times, availability' },
        { id: 'bias_monitoring', label: 'Bias Monitoring', description: 'Ongoing monitoring for discriminatory outcomes' },
        { id: 'user_feedback', label: 'User Feedback Systems', description: 'Mechanisms to collect and respond to user feedback' },
        { id: 'error_logging', label: 'Error Logging', description: 'Comprehensive logging of system errors and failures' },
        { id: 'audit_trails', label: 'Audit Trails', description: 'Complete audit logs for decisions and actions' },
        { id: 'real_time_alerts', label: 'Real-time Alerts', description: 'Automated alerts for anomalies or issues' },
        { id: 'compliance_reporting', label: 'Compliance Reporting', description: 'Regular reporting for regulatory compliance' }
    ];

    const interactionOptions = [
        { value: 'transparent_ai', label: 'Transparent AI Interaction', description: 'Users are clearly informed they are interacting with AI' },
        { value: 'hidden_ai', label: 'Hidden AI Interaction', description: 'AI operation is not explicitly disclosed to users' },
        { value: 'mixed_interaction', label: 'Mixed Interaction', description: 'Some interactions disclosed, others not' },
        { value: 'no_direct_interaction', label: 'No Direct User Interaction', description: 'System operates in background without direct user interaction' }
    ];

    const automationOptions = [
        { value: 'fully_automated', label: 'Fully Automated', description: 'All decisions made automatically without human intervention' },
        { value: 'semi_automated', label: 'Semi-Automated', description: 'Some decisions automated, others require human approval' },
        { value: 'recommendation_only', label: 'Recommendation Only', description: 'System provides recommendations, humans make decisions' },
        { value: 'support_tool', label: 'Support Tool', description: 'Assists humans in decision-making process' }
    ];

    const fallbackOptions = [
        { value: 'human_fallback', label: 'Human Fallback', description: 'Human intervention available when system fails or is uncertain' },
        { value: 'alternative_system', label: 'Alternative System', description: 'Backup automated system or process available' },
        { value: 'graceful_degradation', label: 'Graceful Degradation', description: 'System continues with reduced functionality' },
        { value: 'fail_safe', label: 'Fail-Safe Mode', description: 'System defaults to safe state when problems occur' },
        { value: 'no_fallback', label: 'No Fallback', description: 'No specific fallback mechanisms implemented' }
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
                    Deployment and Operational Context
                </h2>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Provide details about how your AI system will be deployed, who will use it, and how it will operate.
                </p>
            </div>

            {/* Target Users */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Target User Groups * <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply)</span>
                </label>

                <div style={{
                    border: errors.target_users ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {targetUserOptions.map((option) => (
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
                                checked={formData.target_users.includes(option.id)}
                                onChange={(e) => handleArrayChange('target_users', option.id, e.target.checked)}
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

                {errors.target_users && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.target_users}
                    </div>
                )}
            </div>

            {/* Geographic Scope */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Geographic Deployment Scope *
                </label>

                <div style={{
                    border: errors.geographic_scope ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {geographicOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.geographic_scope === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.geographic_scope === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="geographic_scope"
                                value={option.value}
                                checked={formData.geographic_scope === option.value}
                                onChange={(e) => handleInputChange('geographic_scope', e.target.value)}
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

                {errors.geographic_scope && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.geographic_scope}
                    </div>
                )}
            </div>

            {/* Usage Volume */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Expected Usage Volume *
                </label>

                <div style={{
                    border: errors.usage_volume ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {usageVolumeOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.usage_volume === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.usage_volume === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="usage_volume"
                                value={option.value}
                                checked={formData.usage_volume === option.value}
                                onChange={(e) => handleInputChange('usage_volume', e.target.value)}
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

                {errors.usage_volume && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.usage_volume}
                    </div>
                )}
            </div>

            {/* Deployment Environment */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Deployment Environment *
                </label>

                <div style={{
                    border: errors.deployment_environment ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {environmentOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.deployment_environment === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.deployment_environment === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="deployment_environment"
                                value={option.value}
                                checked={formData.deployment_environment === option.value}
                                onChange={(e) => handleInputChange('deployment_environment', e.target.value)}
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

                {errors.deployment_environment && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.deployment_environment}
                    </div>
                )}
            </div>

            {/* Human Oversight */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Human Oversight Level *
                </label>

                <div style={{
                    border: errors.human_oversight ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {oversightOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.human_oversight === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.human_oversight === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="human_oversight"
                                value={option.value}
                                checked={formData.human_oversight === option.value}
                                onChange={(e) => handleInputChange('human_oversight', e.target.value)}
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

                {errors.human_oversight && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.human_oversight}
                    </div>
                )}
            </div>

            {/* Monitoring Capabilities */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Monitoring Capabilities <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(Select all that apply, optional)</span>
                </label>

                <div style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {monitoringOptions.map((option) => (
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
                                checked={formData.monitoring_capabilities.includes(option.id)}
                                onChange={(e) => handleArrayChange('monitoring_capabilities', option.id, e.target.checked)}
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

            {/* User Interaction */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    User Interaction Type *
                </label>

                <div style={{
                    border: errors.user_interaction ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {interactionOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.user_interaction === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.user_interaction === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="user_interaction"
                                value={option.value}
                                checked={formData.user_interaction === option.value}
                                onChange={(e) => handleInputChange('user_interaction', e.target.value)}
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

                {errors.user_interaction && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.user_interaction}
                    </div>
                )}
            </div>

            {/* Decision Automation */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Decision Automation Level *
                </label>

                <div style={{
                    border: errors.decision_automation ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {automationOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.decision_automation === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.decision_automation === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="decision_automation"
                                value={option.value}
                                checked={formData.decision_automation === option.value}
                                onChange={(e) => handleInputChange('decision_automation', e.target.value)}
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

                {errors.decision_automation && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.decision_automation}
                    </div>
                )}
            </div>

            {/* Fallback Mechanisms */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#333',
                    fontSize: '16px'
                }}>
                    Fallback Mechanisms *
                </label>

                <div style={{
                    border: errors.fallback_mechanisms ? '2px solid #dc3545' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                }}>
                    {fallbackOptions.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                marginBottom: '8px',
                                border: `1px solid ${formData.fallback_mechanisms === option.value ? '#6030c9' : '#e5e7eb'}`,
                                borderRadius: '6px',
                                backgroundColor: formData.fallback_mechanisms === option.value ? '#f8f7ff' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <input
                                type="radio"
                                name="fallback_mechanisms"
                                value={option.value}
                                checked={formData.fallback_mechanisms === option.value}
                                onChange={(e) => handleInputChange('fallback_mechanisms', e.target.value)}
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

                {errors.fallback_mechanisms && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '8px' }}>
                        {errors.fallback_mechanisms}
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

export default Step4DeploymentAnalysis;
