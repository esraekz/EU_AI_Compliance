// pages/eu_act/prompt-optimizer.tsx - Enhanced with Save to Library functionality
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

// NEW: Template Library API
const templateLibraryApi = {
    saveToLibrary: async (templateData: any) => {
        const response = await fetch(`${API_BASE_URL}/template-library/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData),
        });
        return await response.json();
    },

    getFeaturedTemplates: async () => {
        const response = await fetch(`${API_BASE_URL}/template-library/templates/featured`);
        return await response.json();
    }
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

    // NEW: Save to Library states
    const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveToLibraryData, setSaveToLibraryData] = useState({
        title: '',
        description: '',
        category: 'AI Compliance',
        tags: 'optimized, ai-compliance',
        is_featured: true,
        is_public: false
    });

    // NEW: Template Library access states
    const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
    const [featuredTemplates, setFeaturedTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

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

                    // Pre-fill save modal with optimized data
                    setSaveToLibraryData(prev => ({
                        ...prev,
                        title: promptTitle || 'Optimized Prompt',
                        description: `Optimized prompt with ${Math.round(optimizeResponse.data.overall_score * 100)}% quality score`
                    }));
                }
            }
        } catch (error) {
            setError('Failed to optimize prompt. Make sure your backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Load Featured Templates
    const loadFeaturedTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const response = await templateLibraryApi.getFeaturedTemplates();
            if (response.success && response.data) {
                setFeaturedTemplates(response.data);
            } else {
                // Fallback to mock data if API fails
                setFeaturedTemplates([
                    {
                        id: '1',
                        title: 'Marketing Email Generator',
                        content: 'Create a compelling marketing email for [PRODUCT] targeting [AUDIENCE] with focus on [BENEFIT]. Include subject line, body, and CTA.',
                        category: 'Marketing',
                        tags: ['email', 'marketing', 'conversion'],
                        usage_count: 1247
                    },
                    {
                        id: '2',
                        title: 'AI Risk Assessment Prompt',
                        content: 'Analyze the following AI system for potential risks and compliance issues: [AI_SYSTEM_DESCRIPTION]. Evaluate bias, fairness, transparency, and accountability aspects.',
                        category: 'AI Compliance',
                        tags: ['risk-assessment', 'ai-compliance', 'audit'],
                        usage_count: 892
                    }
                ]);
            }
        } catch (error) {
            console.error('Failed to load featured templates:', error);
            // Use mock data as fallback
            setFeaturedTemplates([]);
        } finally {
            setLoadingTemplates(false);
        }
    };

    // NEW: Import Template
    const handleImportTemplate = (template: any) => {
        setInputPrompt(template.content);
        setPromptTitle(template.title);
        setShowTemplateLibrary(false);
        setSuccess(`Template "${template.title}" imported successfully!`);
        setTimeout(() => setSuccess(null), 3000);
    };

    // NEW: Open Template Library
    const handleOpenTemplateLibrary = async () => {
        setShowTemplateLibrary(true);
        await loadFeaturedTemplates();
    };
    const handleSaveToLibrary = async () => {
        if (!optimizationResult) {
            setError('Please optimize a prompt first before saving to library');
            return;
        }

        setShowSaveModal(true);
    };

    const confirmSaveToLibrary = async () => {
        if (!optimizationResult || !saveToLibraryData.title.trim()) {
            setError('Please provide a title for the template');
            return;
        }

        setIsSavingToLibrary(true);
        setError(null);

        try {
            const templateData = {
                title: saveToLibraryData.title,
                description: saveToLibraryData.description,
                content: getVersionContent(), // Save the currently selected version
                category: saveToLibraryData.category,
                tags: saveToLibraryData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
                is_featured: saveToLibraryData.is_featured,
                is_public: saveToLibraryData.is_public
            };

            const response = await templateLibraryApi.saveToLibrary(templateData);

            if (response.success) {
                setSuccess('✅ Prompt saved to Featured Templates!');
                setShowSaveModal(false);

                // Show success with navigation option
                setTimeout(() => {
                    if (confirm('Prompt saved successfully! Would you like to view it in the Template Library?')) {
                        router.push('/eu_act/prompt-library');
                    }
                }, 1000);
            } else {
                throw new Error(response.message || 'Failed to save to library');
            }
        } catch (error) {
            console.error('Error saving to library:', error);
            setError('Failed to save to library. Please try again.');
        } finally {
            setIsSavingToLibrary(false);
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
            paddingBottom: '20px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 72px)'
            }}>
                {/* COMPACT HEADER - FIXED HEIGHT */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    color: 'white',
                    marginBottom: 'clamp(0.5rem, 2vh, 1rem)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    flexWrap: 'wrap',
                    gap: '8px',
                    flexShrink: 0,
                    height: '60px'
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
                        {/* NEW: Library Navigation Button */}
                        <button
                            onClick={() => router.push('/eu_act/prompt-library')}
                            style={{
                                background: 'rgba(255, 255, 255, 0.25)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            📚 Library
                        </button>
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
                    gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr',
                    gap: '16px',
                    width: '100%',
                    flex: 1,
                    minHeight: 0,
                    maxHeight: 'calc(100vh - 140px)'
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
                        <div style={{
                            padding: '16px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ marginBottom: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '4px'
                                }}>
                                    <label style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: '#4a5568'
                                    }}>
                                        Your Prompt
                                    </label>
                                    {/* NEW: Template Library Icon */}
                                    <button
                                        onClick={handleOpenTemplateLibrary}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            color: 'white',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        title="Browse Featured Templates"
                                    >
                                        📚 Templates
                                    </button>
                                </div>
                                <textarea
                                    value={inputPrompt}
                                    onChange={(e) => setInputPrompt(e.target.value)}
                                    placeholder="Write a blog post about artificial intelligence OR click 'Templates' to import from library"
                                    style={{
                                        width: '100%',
                                        flex: 1,
                                        minHeight: window.innerWidth > 1400 ? '200px' : '160px',
                                        maxHeight: window.innerWidth > 1400 ? '280px' : '220px',
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
                                                gap: 'clamp(4px, 0.5vw, 10px)',
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
                                    marginBottom: '6px'
                                }}
                            >
                                <span>{isLoading ? '⏳' : '✨'}</span>
                                <span>{isLoading ? 'Analyzing...' : 'Analyze & Optimize'}</span>
                            </button>

                            {/* Clear All Button */}
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
                        gap: '12px',
                        height: '100%',
                        minHeight: 0
                    }}>
                        {/* QUALITY ASSESSMENT */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            height: 'clamp(40%, 45vh, 55%)'
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
                                padding: '16px',
                                height: 'calc(100% - 46px)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                {/* Top Row: Score Circle + Analysis Metrics */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    gap: '12px',
                                    height: 'clamp(55px, 8vh, 80px)'
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
                                            width: window.innerWidth > 1400 ? '60px' : '50px',
                                            height: window.innerWidth > 1400 ? '60px' : '50px',
                                            margin: '0 auto 4px'
                                        }}>
                                            <svg
                                                width="100%"
                                                height="100%"
                                                viewBox="0 0 60 60"
                                                style={{ transform: 'rotate(-90deg)' }}
                                            >
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
                                                fontSize: 'clamp(11px, 1.2vw, 16px)',
                                                fontWeight: '700',
                                                color: optimizationResult ? getScoreColor(optimizationResult.overall_score) : '#8b9cf7'
                                            }}>
                                                {optimizationResult ? getScorePercentage(optimizationResult.overall_score) : '--'}%
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 'clamp(8px, 0.8vw, 12px)', color: '#718096', fontWeight: '500' }}>
                                            Overall Score
                                        </div>
                                    </div>

                                    {/* Analysis Metrics */}
                                    {optimizationResult && (
                                        <div style={{
                                            flex: 1,
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '4px',
                                            alignContent: 'start'
                                        }}>
                                            {Object.entries(optimizationResult.analyses).map(([key, analysis]: [string, any]) => (
                                                <div key={key} style={{
                                                    padding: 'clamp(4px, 0.6vw, 10px)',
                                                    background: 'rgba(139, 156, 247, 0.05)',
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(139, 156, 247, 0.15)',
                                                    borderLeft: `3px solid ${getScoreColor(analysis.score || 0)}`
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '1px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: 'clamp(8px, 0.8vw, 12px)',
                                                            fontWeight: '600',
                                                            color: '#4a5568',
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {key}
                                                        </span>
                                                        <span style={{
                                                            fontSize: 'clamp(9px, 1vw, 14px)',
                                                            fontWeight: '700',
                                                            color: getScoreColor(analysis.score || 0)
                                                        }}>
                                                            {getScorePercentage(analysis.score || 0)}%
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: 'clamp(6px, 0.7vw, 9px)', color: '#6b7280' }}>
                                                        {(analysis.issues?.length || analysis.vulnerabilities?.length || analysis.structure_issues?.length || 0)} issues
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Token Analysis */}
                                {optimizationResult && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%)',
                                        border: '1px solid rgba(79, 172, 254, 0.3)',
                                        borderRadius: '6px',
                                        padding: window.innerWidth > 1400 ? '16px' : '12px',
                                        flex: 1,
                                        minHeight: window.innerWidth > 1400 ? '100px' : '80px',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <div style={{
                                            fontSize: window.innerWidth > 1400 ? '13px' : '11px',
                                            fontWeight: '600',
                                            color: '#1e40af',
                                            marginBottom: '10px'
                                        }}>
                                            Token Analysis
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr',
                                            gap: window.innerWidth > 1400 ? '12px' : '8px',
                                            flex: 1
                                        }}>
                                            <div style={{
                                                textAlign: 'center',
                                                padding: window.innerWidth > 1400 ? '16px' : '12px',
                                                background: 'white',
                                                borderRadius: '6px',
                                                boxShadow: '0 2px 6px rgba(79, 172, 254, 0.2)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                minHeight: window.innerWidth > 1400 ? '70px' : '55px'
                                            }}>
                                                <div style={{
                                                    fontSize: window.innerWidth > 1400 ? '22px' : '18px',
                                                    fontWeight: '700',
                                                    marginBottom: '6px',
                                                    color: '#1e40af'
                                                }}>
                                                    {optimizationResult.token_count_original}
                                                </div>
                                                <div style={{ fontSize: 'clamp(10px, 1vw, 15px)', color: '#64748b', fontWeight: '500' }}>Original</div>
                                            </div>
                                            <div style={{
                                                textAlign: 'center',
                                                padding: 'clamp(0.75rem, 1.2vw, 1.5rem)',
                                                background: 'white',
                                                borderRadius: '6px',
                                                boxShadow: '0 2px 6px rgba(79, 172, 254, 0.2)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                minHeight: 'clamp(50px, 8vh, 80px)'
                                            }}>
                                                <div style={{
                                                    fontSize: 'clamp(16px, 2vw, 26px)',
                                                    fontWeight: '700',
                                                    marginBottom: 'clamp(0.25rem, 0.5vh, 0.5rem)',
                                                    color: '#1e40af'
                                                }}>
                                                    {optimizationResult.token_count_optimized}
                                                </div>
                                                <div style={{ fontSize: 'clamp(10px, 1vw, 15px)', color: '#64748b', fontWeight: '500' }}>Optimized</div>
                                            </div>
                                            <div style={{
                                                textAlign: 'center',
                                                padding: 'clamp(0.75rem, 1.2vw, 1.5rem)',
                                                background: 'white',
                                                borderRadius: '6px',
                                                boxShadow: '0 2px 6px rgba(79, 172, 254, 0.2)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                minHeight: 'clamp(50px, 8vh, 80px)'
                                            }}>
                                                <div style={{
                                                    fontSize: 'clamp(16px, 2vw, 26px)',
                                                    fontWeight: '700',
                                                    marginBottom: 'clamp(0.25rem, 0.5vh, 0.5rem)',
                                                    color: '#10b981'
                                                }}>
                                                    {optimizationResult.token_savings || (optimizationResult.token_count_optimized - optimizationResult.token_count_original) > 0 ? '+' : ''}{optimizationResult.token_savings || (optimizationResult.token_count_optimized - optimizationResult.token_count_original)}
                                                </div>
                                                <div style={{ fontSize: 'clamp(10px, 1vw, 15px)', color: '#64748b', fontWeight: '500' }}>Change</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* OPTIMIZED PROMPT */}
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
                            <div style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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

                                {/* Prompt Display */}
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
                                    marginBottom: '10px',
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

                                {/* ENHANCED Action Buttons */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: optimizationResult ? '1fr 1fr 1fr' : '1fr',
                                    gap: '4px',
                                    flexShrink: 0
                                }}>
                                    {optimizationResult ? (
                                        <>
                                            <button
                                                onClick={handleSaveToLibrary}
                                                disabled={isSavingToLibrary}
                                                style={{
                                                    padding: '6px 8px',
                                                    background: isSavingToLibrary
                                                        ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                                                        : 'linear-gradient(135deg, #10b981, #059669)',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '8px',
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    cursor: isSavingToLibrary ? 'not-allowed' : 'pointer',
                                                    textAlign: 'center',
                                                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '2px'
                                                }}
                                            >
                                                {isSavingToLibrary ? '⏳' : '💾'} {isSavingToLibrary ? 'Saving...' : 'Save to Library'}
                                            </button>
                                            <button
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
                                                📤 Export
                                            </button>
                                            <button
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
                                                🔄 Versions
                                            </button>
                                        </>
                                    ) : (
                                        <div style={{
                                            padding: '8px',
                                            textAlign: 'center',
                                            color: '#6b7280',
                                            fontSize: '10px',
                                            fontStyle: 'italic'
                                        }}>
                                            Optimize a prompt to unlock actions
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TEMPLATE LIBRARY MODAL */}
            {showTemplateLibrary && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                                    📚 Featured Templates
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                                    Select a template to import into the editor
                                </p>
                            </div>
                            <button
                                onClick={() => setShowTemplateLibrary(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    padding: '4px 8px'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '20px',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {loadingTemplates ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '200px',
                                    color: '#6b7280',
                                    fontSize: '14px'
                                }}>
                                    ⏳ Loading templates...
                                </div>
                            ) : featuredTemplates.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '200px',
                                    color: '#6b7280',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                                    <div>No featured templates available</div>
                                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                        Create and save some prompts first!
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {featuredTemplates.map((template) => (
                                        <div
                                            key={template.id}
                                            style={{
                                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '16px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* Category Badge */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                background: template.category === 'AI Compliance' ? '#dc2626' :
                                                    template.category === 'Marketing' ? '#667eea' : '#8b5cf6',
                                                color: 'white',
                                                padding: '2px 6px',
                                                borderRadius: '10px',
                                                fontSize: '10px',
                                                fontWeight: '600'
                                            }}>
                                                {template.category}
                                            </div>

                                            {/* Title */}
                                            <h4 style={{
                                                margin: '0 0 8px 0',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                paddingRight: '60px'
                                            }}>
                                                {template.title}
                                            </h4>

                                            {/* Content Preview */}
                                            <div style={{
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '4px',
                                                padding: '8px',
                                                fontSize: '11px',
                                                fontFamily: "'SF Mono', Monaco, Consolas, monospace",
                                                color: '#374151',
                                                lineHeight: '1.4',
                                                marginBottom: '12px',
                                                maxHeight: '80px',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}>
                                                {template.content}
                                                {template.content.length > 150 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        right: 0,
                                                        background: 'linear-gradient(to right, transparent, #f8fafc)',
                                                        padding: '0 8px',
                                                        fontSize: '10px',
                                                        color: '#6b7280'
                                                    }}>
                                                        ...
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tags */}
                                            <div style={{
                                                display: 'flex',
                                                gap: '4px',
                                                marginBottom: '12px',
                                                flexWrap: 'wrap'
                                            }}>
                                                {template.tags?.slice(0, 3).map((tag: string) => (
                                                    <span
                                                        key={tag}
                                                        style={{
                                                            background: '#e5e7eb',
                                                            color: '#6b7280',
                                                            padding: '2px 6px',
                                                            borderRadius: '10px',
                                                            fontSize: '10px',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Stats and Import Button */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    color: '#6b7280'
                                                }}>
                                                    Used {template.usage_count || 0} times
                                                </span>
                                                <button
                                                    onClick={() => handleImportTemplate(template)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                                                    }}
                                                >
                                                    📥 Import
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #e5e7eb',
                            background: '#f9fafb',
                            textAlign: 'center'
                        }}>
                            <button
                                onClick={() => router.push('/eu_act/prompt-library')}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #667eea',
                                    borderRadius: '6px',
                                    color: '#667eea',
                                    padding: '8px 16px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    margin: '0 auto'
                                }}
                            >
                                🔗 Open Full Library
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SAVE TO LIBRARY MODAL */}
            {showSaveModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                                Save to Template Library
                            </h3>
                            <button
                                onClick={() => setShowSaveModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                                Template Title *
                            </label>
                            <input
                                type="text"
                                value={saveToLibraryData.title}
                                onChange={(e) => setSaveToLibraryData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter template title"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                                Description
                            </label>
                            <textarea
                                value={saveToLibraryData.description}
                                onChange={(e) => setSaveToLibraryData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what this template does"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                                    Category
                                </label>
                                <select
                                    value={saveToLibraryData.category}
                                    onChange={(e) => setSaveToLibraryData(prev => ({ ...prev, category: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="AI Compliance">AI Compliance</option>
                                    <option value="Risk Assessment">Risk Assessment</option>
                                    <option value="Marketing Copy">Marketing Copy</option>
                                    <option value="Code Generation">Code Generation</option>
                                    <option value="Documentation">Documentation</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    value={saveToLibraryData.tags}
                                    onChange={(e) => setSaveToLibraryData(prev => ({ ...prev, tags: e.target.value }))}
                                    placeholder="optimized, ai-compliance"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={saveToLibraryData.is_featured}
                                    onChange={(e) => setSaveToLibraryData(prev => ({ ...prev, is_featured: e.target.checked }))}
                                />
                                Add to Featured Templates (recommended for optimized prompts)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                                <input
                                    type="checkbox"
                                    checked={saveToLibraryData.is_public}
                                    onChange={(e) => setSaveToLibraryData(prev => ({ ...prev, is_public: e.target.checked }))}
                                />
                                Make template public
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowSaveModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    background: 'transparent',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '6px',
                                    color: '#6b7280',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSaveToLibrary}
                                disabled={isSavingToLibrary || !saveToLibraryData.title.trim()}
                                style={{
                                    padding: '10px 20px',
                                    background: isSavingToLibrary
                                        ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                                        : 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: isSavingToLibrary || !saveToLibraryData.title.trim() ? 'not-allowed' : 'pointer',
                                    opacity: isSavingToLibrary || !saveToLibraryData.title.trim() ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {isSavingToLibrary ? '⏳ Saving...' : '📚 Save to Library'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptOptimizerPage;
