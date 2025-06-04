// pages/eu_act/prompt-optimizer.tsx - Standalone Version
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

// Inline type definitions to avoid import issues
interface OptimizationAnalysis {
    original_prompt: string;
    optimized_prompt: string;
    token_count_original: number;
    token_count_optimized: number;
    overall_score: number;
    analyses: {
        clarity?: any;
        security?: any;
        performance?: any;
        structure?: any;
    };
    token_savings?: number;
}

interface Prompt {
    id: string;
    user_id: string;
    title: string;
    original_prompt: string;
    optimized_prompt?: string;
    status: 'draft' | 'optimized' | 'archived';
    tags?: string[];
    created_at: string;
    updated_at: string;
}

interface ApiPromptResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    total?: number;
    limit?: number;
    offset?: number;
}

// Inline API functions to avoid import issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const promptOptimizerApi = {
    createPrompt: async (promptData: { title?: string; original_prompt: string; tags?: string[] }): Promise<ApiPromptResponse<Prompt>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/prompt-optimizer/prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promptData),
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating prompt:', error);
            throw error;
        }
    },

    getPrompts: async (params: { limit?: number; offset?: number; search?: string } = {}): Promise<ApiPromptResponse<Prompt[]>> => {
        try {
            const searchParams = new URLSearchParams();
            if (params.limit) searchParams.set('limit', params.limit.toString());
            if (params.offset) searchParams.set('offset', params.offset.toString());
            if (params.search) searchParams.set('search', params.search);

            const query = searchParams.toString();
            const url = `${API_BASE_URL}/prompt-optimizer/prompts${query ? `?${query}` : ''}`;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching prompts:', error);
            throw error;
        }
    },

    optimizePrompt: async (promptId: string): Promise<ApiPromptResponse<OptimizationAnalysis>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/prompt-optimizer/prompts/${promptId}/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            return await response.json();
        } catch (error) {
            console.error('Error optimizing prompt:', error);
            throw error;
        }
    },

    analyzePrompt: async (promptText: string): Promise<ApiPromptResponse<OptimizationAnalysis>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/prompt-optimizer/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt_text: promptText }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error analyzing prompt:', error);
            throw error;
        }
    },
};

// Simple Layout Component
interface LayoutProps {
    children: React.ReactNode;
}

const SimpleLayout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: '#f5f7fa'
        }}>
            <header style={{
                height: '60px',
                backgroundColor: '#5d4cff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '20px',
                fontSize: '20px',
                fontWeight: 'bold'
            }}>
                ZOKU - Prompt Optimizer
            </header>
            <main style={{ flex: 1, overflow: 'auto' }}>
                {children}
            </main>
        </div>
    );
};

interface OptimizationGoals {
    improve_clarity: boolean;
    add_specificity: boolean;
    better_structure: boolean;
    add_examples: boolean;
}

const PromptOptimizerPage: React.FC = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // State management
    const [inputPrompt, setInputPrompt] = useState('');
    const [promptTitle, setPromptTitle] = useState('');
    const [targetModel, setTargetModel] = useState('GPT-4');
    const [industry, setIndustry] = useState('Technology');
    const [optimizationGoals, setOptimizationGoals] = useState<OptimizationGoals>({
        improve_clarity: true,
        add_specificity: true,
        better_structure: false,
        add_examples: false
    });
    const [optimizationResult, setOptimizationResult] = useState<OptimizationAnalysis | null>(null);
    const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
        loadSavedPrompts();
    }, []);

    // Load saved prompts when component mounts
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
                setSuccess('Prompt analyzed successfully!');
            }
        } catch (error) {
            setError('Failed to analyze prompt. Please check if your backend is running.');
            console.error('Analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleOptimizePrompt = async () => {
        if (!inputPrompt.trim()) {
            setError('Please enter a prompt to optimize');
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
                    setSuccess('Prompt optimized and saved successfully!');
                    await loadSavedPrompts();
                }
            }
        } catch (error) {
            setError('Failed to optimize prompt. Please check if your backend is running.');
            console.error('Optimization error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearAll = () => {
        setInputPrompt('');
        setPromptTitle('');
        setOptimizationResult(null);
        setError(null);
        setSuccess(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return '#10b981';
        if (score >= 0.6) return '#f59e0b';
        return '#ef4444';
    };

    const getScorePercentage = (score: number) => Math.round(score * 100);

    const styles = {
        container: {
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        header: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            borderRadius: '12px'
        },
        headerContent: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        headerTitle: {
            fontSize: '24px',
            fontWeight: '700',
            margin: 0
        },
        headerSubtitle: {
            fontSize: '14px',
            opacity: 0.9,
            margin: '4px 0 0 0'
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: isClient && window.innerWidth > 1200 ? '1fr 400px' : '1fr',
            gap: '24px'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
        },
        cardTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 20px 0'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
        },
        textarea: {
            width: '100%',
            minHeight: '120px',
            padding: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'SF Mono, Monaco, Consolas, monospace',
            lineHeight: '1.5',
            resize: 'vertical' as const,
            boxSizing: 'border-box' as const,
            transition: 'border-color 0.2s ease'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box' as const
        },
        select: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white',
            boxSizing: 'border-box' as const
        },
        formRow: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
        },
        primaryButton: {
            width: '100%',
            padding: '16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            marginBottom: '12px'
        },
        secondaryButton: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
        },
        clearButton: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '12px'
        },
        alert: {
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500'
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
        scoreCircle: {
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            backgroundColor: '#f3f4f6'
        },
        scoreValue: {
            fontSize: '36px',
            fontWeight: '700',
            lineHeight: '1'
        },
        scoreLabel: {
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px'
        },
        resultBox: {
            backgroundColor: '#f8f9fa',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
            fontFamily: 'SF Mono, Monaco, Consolas, monospace',
            lineHeight: '1.5',
            color: '#1f2937',
            maxHeight: '200px',
            overflowY: 'auto' as const,
            whiteSpace: 'pre-wrap' as const,
            marginTop: '12px'
        }
    };

    return (
        <SimpleLayout>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerContent}>
                        <div>
                            <h1 style={styles.headerTitle}>Prompt Optimizer</h1>
                            <p style={styles.headerSubtitle}>Analyze and improve your AI prompts for better results</p>
                        </div>
                    </div>
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

                <div style={styles.mainGrid}>
                    {/* Left Panel */}
                    <div>
                        {/* Prompt Editor */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>✏️ Prompt Editor</h3>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Prompt Title (Optional)</label>
                                <input
                                    type="text"
                                    value={promptTitle}
                                    onChange={(e) => setPromptTitle(e.target.value)}
                                    placeholder="e.g., Blog Writing Assistant"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Your Prompt</label>
                                <textarea
                                    value={inputPrompt}
                                    onChange={(e) => setInputPrompt(e.target.value)}
                                    placeholder="Write a blog post about artificial intelligence"
                                    style={styles.textarea}
                                />
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Target Model</label>
                                    <select
                                        value={targetModel}
                                        onChange={(e) => setTargetModel(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="GPT-4">GPT-4</option>
                                        <option value="GPT-3.5">GPT-3.5</option>
                                        <option value="Claude">Claude</option>
                                        <option value="Gemini">Gemini</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Industry</label>
                                    <select
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="Technology">Technology</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Education">Education</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleOptimizePrompt}
                                disabled={isLoading || !inputPrompt.trim()}
                                style={{
                                    ...styles.primaryButton,
                                    opacity: (isLoading || !inputPrompt.trim()) ? 0.6 : 1
                                }}
                            >
                                {isLoading ? '⏳ Optimizing...' : '✨ Save & Optimize Prompt'}
                            </button>

                            <button
                                onClick={handleQuickAnalyze}
                                disabled={isAnalyzing || !inputPrompt.trim()}
                                style={{
                                    ...styles.secondaryButton,
                                    opacity: (isAnalyzing || !inputPrompt.trim()) ? 0.6 : 1
                                }}
                            >
                                {isAnalyzing ? '⏳ Analyzing...' : '🔍 Quick Analysis'}
                            </button>

                            {(optimizationResult || inputPrompt) && (
                                <button onClick={clearAll} style={styles.clearButton}>
                                    🗑️ Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div>
                        {/* Quality Assessment */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>✅ Quality Assessment</h3>

                            {optimizationResult ? (
                                <>
                                    <div
                                        style={{
                                            ...styles.scoreCircle,
                                            background: `conic-gradient(${getScoreColor(optimizationResult.overall_score)} ${optimizationResult.overall_score * 360}deg, #f3f4f6 0deg)`
                                        }}
                                    >
                                        <div style={{
                                            ...styles.scoreValue,
                                            color: getScoreColor(optimizationResult.overall_score)
                                        }}>
                                            {getScorePercentage(optimizationResult.overall_score)}
                                        </div>
                                        <div style={styles.scoreLabel}>Score</div>
                                    </div>

                                    {/* Token Information */}
                                    <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '16px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Token Analysis</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                                            <div>Original: {optimizationResult.token_count_original}</div>
                                            <div>Optimized: {optimizationResult.token_count_optimized}</div>
                                            <div style={{ gridColumn: '1 / -1', color: '#10b981', fontWeight: '600' }}>
                                                Savings: {optimizationResult.token_savings || (optimizationResult.token_count_original - optimizationResult.token_count_optimized)} tokens
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analysis Scores */}
                                    {optimizationResult.analyses && Object.entries(optimizationResult.analyses).length > 0 && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Analysis Breakdown</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                                {Object.entries(optimizationResult.analyses).map(([key, analysis]: [string, any]) => (
                                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ textTransform: 'capitalize' }}>{key}:</span>
                                                        <span style={{ color: getScoreColor(analysis.score || 0), fontWeight: '600' }}>
                                                            {getScorePercentage(analysis.score || 0)}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Results Display */}
                                    <div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Optimized Prompt</h4>
                                        <div style={styles.resultBox}>
                                            {optimizationResult.optimized_prompt}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={styles.scoreCircle}>
                                    <div style={{ ...styles.scoreValue, color: '#9ca3af' }}>--</div>
                                    <div style={styles.scoreLabel}>Score</div>
                                </div>
                            )}
                        </div>

                        {/* Saved Prompts Info */}
                        {savedPrompts.length > 0 && (
                            <div style={styles.card}>
                                <h3 style={styles.cardTitle}>💾 Saved Prompts</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                                    You have {savedPrompts.length} saved prompts.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SimpleLayout>
    );
};

export default PromptOptimizerPage;
