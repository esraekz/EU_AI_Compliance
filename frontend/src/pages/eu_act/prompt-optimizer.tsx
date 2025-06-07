// pages/eu_act/prompt-optimizer.tsx - UPDATED VERSION
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

// Your existing types and API - keep as is
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

// Your existing API - keep as is
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'http://localhost:8000'; // Replace with your production URL

const promptOptimizerApi = {
    createPrompt: async (promptData: any) => {
        const response = await fetch(`${API_BASE_URL}/prompt-optimizer/prompts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promptData),
        });
        return await response.json();
    },

    getPrompts: async (params = {}) => {
        const searchParams = new URLSearchParams(params as any);
        const response = await fetch(`${API_BASE_URL}/prompt-optimizer/prompts?${searchParams}`);
        return await response.json();
    },

    optimizePrompt: async (promptId: string) => {
        const response = await fetch(`${API_BASE_URL}/prompt-optimizer/prompts/${promptId}/optimize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        return await response.json();
    },

    analyzePrompt: async (promptText: string) => {
        const response = await fetch(`${API_BASE_URL}/prompt-optimizer/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt_text: promptText }),
        });
        return await response.json();
    },
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

    // Your existing state - keep as is
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
    const [currentVersion, setCurrentVersion] = useState<'original' | 'clarity' | 'specificity' | 'structure'>('original');

    // Your existing functions - keep as is
    useEffect(() => {
        setIsClient(true);
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
        }
    };

    const handleQuickAnalyze = async () => {
        if (!inputPrompt.trim()) {
            setError('Please enter a prompt to analyze');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const response = await promptOptimizerApi.analyzePrompt(inputPrompt);
            if (response.success && response.data) {
                setOptimizationResult(response.data);
                setSuccess('Prompt analyzed successfully!');
                // Auto-hide success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (error) {
            setError('Failed to analyze prompt. Make sure your backend is running.');
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

        try {
            const createResponse = await promptOptimizerApi.createPrompt({
                title: promptTitle || 'Untitled Prompt',
                original_prompt: inputPrompt
            });

            if (createResponse.success && createResponse.data) {
                const optimizeResponse = await promptOptimizerApi.optimizePrompt(createResponse.data.id);

                if (optimizeResponse.success && optimizeResponse.data) {
                    setOptimizationResult(optimizeResponse.data);
                    setSuccess('Prompt optimized and saved!');
                    // Auto-hide success message after 3 seconds
                    setTimeout(() => setSuccess(null), 3000);
                    await loadSavedPrompts();
                }
            }
        } catch (error) {
            setError('Failed to optimize prompt. Make sure your backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Clear function
    const handleClearPrompt = () => {
        setInputPrompt('');
        setPromptTitle('');
        setOptimizationResult(null);
        setError(null);
        setSuccess(null);
        setCurrentVersion('original');
    };

    const showVersion = (type: 'original' | 'clarity' | 'specificity' | 'structure') => {
        setCurrentVersion(type);
    };

    const getVersionContent = () => {
        if (!optimizationResult) return inputPrompt;

        const versions = {
            original: optimizationResult.original_prompt,
            clarity: optimizationResult.optimized_prompt,
            specificity: optimizationResult.optimized_prompt,
            structure: optimizationResult.optimized_prompt
        };

        return versions[currentVersion] || optimizationResult.optimized_prompt;
    };

    const copyPrompt = async () => {
        const text = getVersionContent();
        try {
            await navigator.clipboard.writeText(text);
            setSuccess('Prompt copied to clipboard!');
            setTimeout(() => setSuccess(null), 2000);
        } catch (error) {
            setError('Failed to copy to clipboard');
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return '#68d391';
        if (score >= 0.6) return '#f6ad55';
        return '#fc8181';
    };

    const getScorePercentage = (score: number) => Math.round(score * 100);

    // Loading state during hydration
    if (!isClient) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                fontSize: '18px',
                color: '#718096'
            }}>
                Loading Prompt Optimizer...
            </div>
        );
    }

    return (
        <div style={{
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            background: 'linear-gradient(135deg, #8b9cf7 0%, #9ba3f7 50%, #a8b4f8 100%)',
            minHeight: '100vh',
            maxHeight: '100vh',
            padding: '16px',
            paddingBottom: '20px', // REDUCED: Less bottom spacing for more room
            boxSizing: 'border-box',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 60px)' // UPDATED: More space with reduced padding
            }}>
                {/* COMPACT HEADER - FIXED HEIGHT */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    color: 'white',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    flexWrap: 'wrap',
                    gap: '8px',
                    flexShrink: 0,
                    height: '60px' // FIXED HEIGHT
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '18px' }}>⚡</div>
                        <div>
                            <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, lineHeight: 1 }}>
                                Prompt Optimizer
                            </h1>
                            <p style={{ fontSize: '11px', opacity: 0.9, margin: 0, lineHeight: 1 }}>
                                Analyze and improve your AI prompts
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '500',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            Free: 7/10
                        </div>
                        <button style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '10px',
                            cursor: 'pointer'
                        }}>
                            Upgrade Pro
                        </button>
                        <div style={{
                            background: '#10b981',
                            padding: '3px 6px',
                            borderRadius: '6px',
                            fontSize: '9px',
                            fontWeight: '600'
                        }}>
                            Live
                        </div>
                    </div>
                </div>

                {/* Alert Messages - FIXED POSITION OVERLAY */}
                {(error || success) && (
                    <div style={{
                        position: 'absolute',
                        top: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        padding: '6px 10px',
                        borderRadius: '4px',
                        backgroundColor: error ? '#fef2f2' : '#f0fdf4',
                        color: error ? '#dc2626' : '#16a34a',
                        border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}`,
                        fontSize: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {error || success}
                    </div>
                )}

                {/* MAIN LAYOUT - RESPONSIVE GRID */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr', // RESPONSIVE: Single column on smaller screens
                    gap: '12px',
                    width: '100%',
                    flex: 1,
                    minHeight: 0, // This is crucial for flex children with overflow
                    maxHeight: 'calc(100vh - 140px)' // UPDATED: More space available
                }}>
                    {/* LEFT PANEL - PROMPT EDITOR */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}>
                        <div style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(102, 126, 234, 0.05)',
                            flexShrink: 0
                        }}>
                            <span style={{ fontSize: '14px' }}>✏️</span>
                            <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', margin: 0 }}>
                                Prompt Editor
                            </h2>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '4px'
                                }}>
                                    Your Prompt
                                </label>
                                <textarea
                                    value={inputPrompt}
                                    onChange={(e) => setInputPrompt(e.target.value)}
                                    placeholder="Write a blog post about artificial intelligence"
                                    style={{
                                        width: '100%',
                                        flex: 1, // Takes available space
                                        minHeight: '120px', // Reduced for better fit
                                        maxHeight: '160px', // Reduced for better fit
                                        padding: '8px',
                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontFamily: "'SF Mono', Monaco, Consolas, monospace",
                                        lineHeight: '1.3',
                                        resize: 'none',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                                marginBottom: '8px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: '#4a5568',
                                        marginBottom: '3px'
                                    }}>
                                        Target Model
                                    </label>
                                    <select
                                        value={targetModel}
                                        onChange={(e) => setTargetModel(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            border: '1px solid rgba(139, 156, 247, 0.3)',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option>GPT-4</option>
                                        <option>GPT-3.5</option>
                                        <option>Claude</option>
                                        <option>Gemini</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: '#4a5568',
                                        marginBottom: '3px'
                                    }}>
                                        Industry
                                    </label>
                                    <select
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            border: '1px solid rgba(139, 156, 247, 0.3)',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option>Technology</option>
                                        <option>Healthcare</option>
                                        <option>Finance</option>
                                        <option>Education</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    marginBottom: '4px'
                                }}>
                                    Optimization Goals
                                </label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '6px'
                                }}>
                                    {Object.entries(optimizationGoals).map(([key, checked]) => (
                                        <div
                                            key={key}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '5px',
                                                border: `1px solid ${checked ? '#8b9cf7' : 'rgba(139, 156, 247, 0.3)'}`,
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                background: checked ? 'rgba(139, 156, 247, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                                                fontSize: '10px'
                                            }}
                                            onClick={() => setOptimizationGoals(prev => ({
                                                ...prev,
                                                [key]: !prev[key as keyof OptimizationGoals]
                                            }))}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => { }}
                                                style={{ margin: 0, transform: 'scale(0.8)' }}
                                            />
                                            <label style={{
                                                fontSize: '10px',
                                                fontWeight: '500',
                                                color: '#4a5568',
                                                lineHeight: 1
                                            }}>
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleOptimizePrompt}
                                disabled={isLoading || !inputPrompt.trim()}
                                style={{
                                    padding: '8px 12px',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    opacity: (isLoading || !inputPrompt.trim()) ? 0.6 : 1,
                                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                    flexShrink: 0,
                                    marginBottom: '6px' // ADDED: Space for clear button
                                }}
                            >
                                <span>{isLoading ? '⏳' : '✨'}</span>
                                <span>{isLoading ? 'Analyzing...' : 'Analyze & Optimize'}</span>
                            </button>

                            {/* NEW: Clear All Button */}
                            <button
                                onClick={handleClearPrompt}
                                style={{
                                    padding: '6px 12px',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                                    flexShrink: 0
                                }}
                            >
                                <span>🗑️</span>
                                <span>Clear All</span>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL - RESULTS ONLY */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        height: '100%',
                        minHeight: 0
                    }}>
                        {/* QUALITY ASSESSMENT - MADE DETAILS VISIBLE */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            height: '40%' // ADJUSTED: Better proportion
                        }}>
                            <div style={{
                                padding: '8px 12px',
                                borderBottom: '1px solid rgba(139, 156, 247, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(139, 156, 247, 0.05)'
                            }}>
                                <span style={{ fontSize: '14px' }}>📊</span>
                                <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', margin: 0 }}>
                                    Quality Assessment
                                </h2>
                            </div>
                            <div style={{
                                padding: '12px',
                                height: 'calc(100% - 42px)',
                                overflow: 'hidden', // REMOVED SCROLL: No more scrolling
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                {/* Top Row: Score Circle + Analysis Metrics */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    gap: '12px',
                                    height: '70px' // Fixed height for top section
                                }}>
                                    {/* Score Circle */}
                                    <div style={{
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            position: 'relative',
                                            width: '60px',
                                            height: '60px',
                                            margin: '0 auto 4px'
                                        }}>
                                            <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                                                <circle cx="30" cy="30" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                                                <circle
                                                    cx="30" cy="30" r="24" fill="none"
                                                    stroke={optimizationResult ? getScoreColor(optimizationResult.overall_score) : "#8b9cf7"}
                                                    strokeWidth="4"
                                                    strokeDasharray="151"
                                                    strokeDashoffset={optimizationResult ? 151 - (optimizationResult.overall_score * 151) : 75}
                                                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                                                />
                                            </svg>
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: optimizationResult ? getScoreColor(optimizationResult.overall_score) : '#8b9cf7'
                                            }}>
                                                {optimizationResult ? getScorePercentage(optimizationResult.overall_score) : '--'}%
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#718096', fontWeight: '500' }}>
                                            Overall Score
                                        </div>
                                    </div>

                                    {/* RIGHT SIDE: Analysis Metrics (Clarity, Security, etc.) */}
                                    {optimizationResult && (
                                        <div style={{
                                            flex: 1,
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '6px',
                                            alignContent: 'start'
                                        }}>
                                            {Object.entries(optimizationResult.analyses).map(([key, analysis]: [string, any]) => (
                                                <div key={key} style={{
                                                    padding: '6px',
                                                    background: 'rgba(139, 156, 247, 0.05)',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(139, 156, 247, 0.15)',
                                                    borderLeft: `3px solid ${getScoreColor(analysis.score || 0)}`
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '2px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            color: '#4a5568',
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {key}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            color: getScoreColor(analysis.score || 0)
                                                        }}>
                                                            {getScorePercentage(analysis.score || 0)}%
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '8px', color: '#6b7280' }}>
                                                        {(analysis.issues?.length || analysis.vulnerabilities?.length || analysis.structure_issues?.length || 0)} issues
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* BOTTOM: Token Analysis */}
                                {optimizationResult && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%)',
                                        border: '1px solid rgba(79, 172, 254, 0.3)',
                                        borderRadius: '8px',
                                        padding: '10px'
                                    }}>
                                        <div style={{
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: '#1e40af',
                                            marginBottom: '8px'
                                        }}>
                                            Token Analysis
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr',
                                            gap: '6px'
                                        }}>
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '6px',
                                                background: 'white',
                                                borderRadius: '4px',
                                                boxShadow: '0 1px 3px rgba(79, 172, 254, 0.1)'
                                            }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    marginBottom: '2px',
                                                    color: '#1e40af'
                                                }}>
                                                    {optimizationResult.token_count_original}
                                                </div>
                                                <div style={{ fontSize: '8px', color: '#64748b' }}>Original</div>
                                            </div>
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '6px',
                                                background: 'white',
                                                borderRadius: '4px',
                                                boxShadow: '0 1px 3px rgba(79, 172, 254, 0.1)'
                                            }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    marginBottom: '2px',
                                                    color: '#1e40af'
                                                }}>
                                                    {optimizationResult.token_count_optimized}
                                                </div>
                                                <div style={{ fontSize: '8px', color: '#64748b' }}>Optimized</div>
                                            </div>
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '6px',
                                                background: 'white',
                                                borderRadius: '4px',
                                                boxShadow: '0 1px 3px rgba(79, 172, 254, 0.1)'
                                            }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    marginBottom: '2px',
                                                    color: '#10b981'
                                                }}>
                                                    {optimizationResult.token_savings || (optimizationResult.token_count_optimized - optimizationResult.token_count_original) > 0 ? '+' : ''}{optimizationResult.token_savings || (optimizationResult.token_count_optimized - optimizationResult.token_count_original)}
                                                </div>
                                                <div style={{ fontSize: '8px', color: '#64748b' }}>Change</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* OPTIMIZED PROMPT - TAKES REMAINING SPACE */}
                        <div style={{
                            background: 'linear-gradient(135deg, #e0f2fe 0%, #e1f5fe 50%, #f0f9ff 100%)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(79, 172, 254, 0.15)',
                            overflow: 'hidden',
                            border: '1px solid rgba(79, 172, 254, 0.2)',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0
                        }}>
                            <div style={{
                                padding: '8px 12px',
                                borderBottom: '1px solid rgba(79, 172, 254, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(79, 172, 254, 0.08)',
                                flexShrink: 0
                            }}>
                                <span style={{ fontSize: '14px' }}>🚀</span>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', margin: 0 }}>
                                    Optimized Versions
                                </h3>
                            </div>
                            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                {/* Version Tabs */}
                                <div style={{
                                    display: 'flex',
                                    background: 'rgba(79, 172, 254, 0.1)',
                                    borderRadius: '4px',
                                    padding: '2px',
                                    marginBottom: '8px',
                                    gap: '1px',
                                    flexShrink: 0
                                }}>
                                    {(['original', 'clarity'] as const).map((version) => (
                                        <button
                                            key={version}
                                            onClick={() => showVersion(version)}
                                            style={{
                                                flex: 1,
                                                padding: '4px 6px',
                                                background: currentVersion === version
                                                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                                    : 'transparent',
                                                border: 'none',
                                                borderRadius: '3px',
                                                fontSize: '9px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                color: currentVersion === version ? 'white' : '#1e40af',
                                                textAlign: 'center',
                                                boxShadow: currentVersion === version ? '0 1px 4px rgba(59, 130, 246, 0.3)' : 'none'
                                            }}
                                        >
                                            {version === 'original' ? 'Original' : 'Optimized ✨'}
                                        </button>
                                    ))}
                                </div>

                                {/* Prompt Display - FLEXIBLE HEIGHT */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    border: '1px solid rgba(79, 172, 254, 0.2)',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    fontFamily: "'SF Mono', Monaco, Consolas, monospace",
                                    fontSize: '9px',
                                    lineHeight: '1.3',
                                    color: '#1e40af',
                                    position: 'relative',
                                    marginBottom: '8px',
                                    flex: 1,
                                    overflowY: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    minHeight: 0
                                }}>
                                    <button
                                        onClick={copyPrompt}
                                        style={{
                                            position: 'absolute',
                                            top: '4px',
                                            right: '4px',
                                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                            border: 'none',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            fontSize: '8px',
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 4px rgba(59, 130, 246, 0.3)'
                                        }}
                                    >
                                        📋
                                    </button>
                                    {getVersionContent()}
                                </div>

                                {/* Action Buttons */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: '4px',
                                    flexShrink: 0
                                }}>
                                    {['💾 Save', '📤 Export', '🔄 Versions'].map((label) => (
                                        <button
                                            key={label}
                                            style={{
                                                padding: '4px 6px',
                                                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                                border: '1px solid rgba(79, 172, 254, 0.2)',
                                                borderRadius: '3px',
                                                fontSize: '8px',
                                                fontWeight: '500',
                                                color: '#1e40af',
                                                cursor: 'pointer',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptOptimizerPage;
