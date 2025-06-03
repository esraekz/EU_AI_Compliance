// pages/eu_act/prompt-optimizer.tsx - Dashboard integrated version
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { OptimizationAnalysis, Prompt, promptOptimizerApi } from '../../services/api';

const PromptOptimizerPage: React.FC = () => {
    const router = useRouter();

    // State management
    const [activeTab, setActiveTab] = useState<'new' | 'saved'>('new');
    const [inputPrompt, setInputPrompt] = useState('');
    const [promptTitle, setPromptTitle] = useState('');
    const [optimizationResult, setOptimizationResult] = useState<OptimizationAnalysis | null>(null);
    const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load saved prompts when component mounts
    useEffect(() => {
        loadSavedPrompts();
    }, []);

    const loadSavedPrompts = async () => {
        try {
            const response = await promptOptimizerApi.getPrompts({ limit: 50 });
            if (response.success && response.data) {
                setSavedPrompts(response.data);
            }
        } catch (error) {
            console.error('Error loading saved prompts:', error);
            setSavedPrompts([]);
        }
    };

    const handleQuickAnalyze = async () => {
        if (!inputPrompt.trim()) {
            setError('Please enter a prompt to analyze');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setOptimizationResult(null);

        try {
            const response = await promptOptimizerApi.analyzePrompt(inputPrompt);
            if (response.success && response.data) {
                setOptimizationResult(response.data);
            }
        } catch (error) {
            setError('Failed to analyze prompt. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveAndOptimize = async () => {
        if (!inputPrompt.trim()) {
            setError('Please enter a prompt to save and optimize');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const createResponse = await promptOptimizerApi.createPrompt({
                title: promptTitle || 'Untitled Prompt',
                original_prompt: inputPrompt
            });

            if (createResponse.success && createResponse.data) {
                const optimizeResponse = await promptOptimizerApi.optimizePrompt(createResponse.data.id);

                if (optimizeResponse.success && optimizeResponse.data) {
                    setOptimizationResult(optimizeResponse.data);
                    setSuccess('Prompt saved and optimized successfully!');
                    await loadSavedPrompts();
                }
            }
        } catch (error) {
            setError('Failed to save and optimize prompt. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearAll = () => {
        setInputPrompt('');
        setPromptTitle('');
        setOptimizationResult(null);
        setSelectedPrompt(null);
        setError(null);
        setSuccess(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return '#10b981';
        if (score >= 0.6) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 0.8) return 'Excellent';
        if (score >= 0.6) return 'Good';
        if (score >= 0.4) return 'Fair';
        return 'Needs Improvement';
    };

    // Dashboard-compatible styles
    const styles = {
        container: {
            padding: '20px',
            maxWidth: '100%',
            height: '100%',
            overflowY: 'auto' as const,
            backgroundColor: '#f8f9fa'
        },
        header: {
            textAlign: 'center' as const,
            marginBottom: '24px'
        },
        tabNav: {
            display: 'flex',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        },
        tab: {
            flex: 1,
            padding: '12px 24px',
            background: 'none' as const,
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500' as const,
            cursor: 'pointer' as const,
            transition: 'all 0.2s ease'
        },
        activeTab: {
            backgroundColor: '#5d4cff',
            color: 'white'
        },
        inactiveTab: {
            color: '#6b7280'
        },
        alert: {
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontWeight: '500' as const
        },
        errorAlert: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
        },
        successAlert: {
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0'
        },
        inputSection: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        },
        label: {
            display: 'block',
            fontWeight: '600' as const,
            color: '#374151',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            marginBottom: '16px',
            boxSizing: 'border-box' as const
        },
        textarea: {
            width: '100%',
            padding: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: 'SF Mono, Monaco, Consolas, monospace',
            lineHeight: '1.5',
            resize: 'vertical' as const,
            minHeight: '200px',
            marginBottom: '20px',
            boxSizing: 'border-box' as const
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap' as const
        },
        button: {
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600' as const,
            cursor: 'pointer' as const,
            transition: 'all 0.2s ease'
        },
        analyzeBtn: {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db'
        },
        optimizeBtn: {
            backgroundColor: '#5d4cff',
            color: 'white'
        },
        clearBtn: {
            backgroundColor: '#ef4444',
            color: 'white'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#252a31', marginBottom: '8px', margin: 0 }}>
                    Prompt Optimizer
                </h1>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '8px 0 0 0' }}>
                    Analyze and improve your AI prompts with professional-grade optimization
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabNav}>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'new' ? styles.activeTab : styles.inactiveTab)
                    }}
                    onClick={() => setActiveTab('new')}
                >
                    New Optimization
                </button>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'saved' ? styles.activeTab : styles.inactiveTab)
                    }}
                    onClick={() => setActiveTab('saved')}
                >
                    Saved Prompts ({savedPrompts.length})
                </button>
            </div>

            {/* Alert Messages */}
            {error && (
                <div style={{ ...styles.alert, ...styles.errorAlert }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{ ...styles.alert, ...styles.successAlert }}>
                    {success}
                </div>
            )}

            {/* Main Content */}
            {activeTab === 'new' ? (
                <>
                    {/* Input Section */}
                    <div style={styles.inputSection}>
                        <label style={styles.label}>Prompt Title (Optional)</label>
                        <input
                            type="text"
                            value={promptTitle}
                            onChange={(e) => setPromptTitle(e.target.value)}
                            placeholder="e.g., Blog Writing Assistant"
                            style={styles.input}
                        />

                        <label style={styles.label}>Your Prompt</label>
                        <textarea
                            value={inputPrompt}
                            onChange={(e) => setInputPrompt(e.target.value)}
                            placeholder="Paste your prompt here for analysis and optimization..."
                            style={styles.textarea}
                        />

                        <div style={styles.buttonGroup}>
                            <button
                                onClick={handleQuickAnalyze}
                                disabled={isAnalyzing || !inputPrompt.trim()}
                                style={{ ...styles.button, ...styles.analyzeBtn }}
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Quick Analyze'}
                            </button>
                            <button
                                onClick={handleSaveAndOptimize}
                                disabled={isLoading || !inputPrompt.trim()}
                                style={{ ...styles.button, ...styles.optimizeBtn }}
                            >
                                {isLoading ? 'Optimizing...' : 'Save & Optimize'}
                            </button>
                            <button
                                onClick={clearAll}
                                style={{ ...styles.button, ...styles.clearBtn }}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    {optimizationResult && (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#252a31', marginBottom: '24px' }}>
                                Optimization Results
                            </h2>

                            {/* Overall Score */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '32px',
                                marginBottom: '32px',
                                padding: '20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '48px',
                                        fontWeight: '700',
                                        lineHeight: '1',
                                        color: getScoreColor(optimizationResult.overall_score)
                                    }}>
                                        {Math.round(optimizationResult.overall_score * 100)}%
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                                        {getScoreLabel(optimizationResult.overall_score)}
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <p style={{ margin: '4px 0', fontSize: '16px', color: '#374151' }}>
                                        <strong>Original:</strong> {optimizationResult.token_count_original} tokens
                                    </p>
                                    <p style={{ margin: '4px 0', fontSize: '16px', color: '#374151' }}>
                                        <strong>Optimized:</strong> {optimizationResult.token_count_optimized} tokens
                                    </p>
                                    <p style={{ margin: '4px 0', fontSize: '16px', color: '#10b981' }}>
                                        <strong>Savings:</strong> {optimizationResult.token_savings} tokens
                                    </p>
                                </div>
                            </div>

                            {/* Side-by-side Comparison */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
                                gap: '20px',
                                marginBottom: '32px'
                            }}>
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                                        Original Prompt
                                    </h3>
                                    <div style={{
                                        fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        color: '#1f2937',
                                        whiteSpace: 'pre-wrap',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        backgroundColor: 'white',
                                        padding: '16px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db'
                                    }}>
                                        {optimizationResult.original_prompt}
                                    </div>
                                </div>
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                                        Optimized Prompt
                                    </h3>
                                    <div style={{
                                        fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        color: '#1f2937',
                                        whiteSpace: 'pre-wrap',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        backgroundColor: 'white',
                                        padding: '16px',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db'
                                    }}>
                                        {optimizationResult.optimized_prompt}
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Details */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '20px'
                            }}>
                                {Object.entries(optimizationResult.analyses).map(([type, analysis]: [string, any]) => (
                                    <div key={type} style={{
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px', textTransform: 'capitalize' }}>
                                            {type} Analysis
                                        </h4>
                                        <div style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: getScoreColor(analysis.score || 0),
                                            marginBottom: '16px'
                                        }}>
                                            {Math.round((analysis.score || 0) * 100)}%
                                        </div>

                                        {analysis.issues && analysis.issues.length > 0 && (
                                            <div style={{ marginTop: '12px' }}>
                                                <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                                                    Issues Found:
                                                </h5>
                                                {analysis.issues.slice(0, 3).map((issue: any, idx: number) => (
                                                    <div key={idx} style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '4px', color: '#dc2626' }}>
                                                        • {issue.description || issue.type}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {analysis.suggestions && analysis.suggestions.length > 0 && (
                                            <div style={{ marginTop: '12px' }}>
                                                <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                                                    Suggestions:
                                                </h5>
                                                {analysis.suggestions.slice(0, 2).map((suggestion: any, idx: number) => (
                                                    <div key={idx} style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '4px', color: '#059669' }}>
                                                        • {suggestion.improvement || suggestion.suggestion || suggestion.fix}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Saved Prompts Tab */
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#252a31', marginBottom: '24px' }}>
                        Your Saved Prompts
                    </h2>
                    {savedPrompts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            <p>No saved prompts yet. Create your first optimization!</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '20px'
                        }}>
                            {savedPrompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                        {prompt.title}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.4', marginBottom: '12px' }}>
                                        {prompt.original_prompt.slice(0, 100)}...
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            backgroundColor: prompt.status === 'optimized' ? '#d1fae5' : '#f3f4f6',
                                            color: prompt.status === 'optimized' ? '#065f46' : '#374151'
                                        }}>
                                            {prompt.status}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                            {new Date(prompt.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PromptOptimizerPage;
