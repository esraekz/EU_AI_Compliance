// pages/eu_act/prompt-library.tsx - Fixed version without syntax errors
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styles from './PromptLibrary.module.css';

// Types for the library
interface PromptTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    content: string;
    creator: string;
    created_at: string;
    updated_at: string;
    usage_count: number;
    rating: number;
    review_count: number;
    is_featured: boolean;
    is_public: boolean;
    version: string;
}

interface Category {
    name: string;
    count: number;
    color: string;
}

interface UserStats {
    created: number;
    saved: number;
    total_uses: number;
}

interface DashboardStats {
    total_templates: number;
    categories: any[];
    user_stats: UserStats;
    recent_updates: any[];
    top_rated: any[];
}

const PromptLibraryPage: React.FC = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('popular');
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [featuredTemplates, setFeaturedTemplates] = useState<PromptTemplate[]>([]);
    const [showAllTemplates, setShowAllTemplates] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingTemplate, setDeletingTemplate] = useState<PromptTemplate | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingTemplate, setViewingTemplate] = useState<PromptTemplate | null>(null);

    const API_BASE_URL = 'http://localhost:8000/template-library';

    useEffect(() => {
        setIsClient(true);
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        await Promise.all([
            loadFeaturedTemplates(),
            loadAllTemplates(),
            loadCategories(),
            loadDashboardStats()
        ]);
    };

    // Template Viewer Modal Component
    interface TemplateViewModalProps {
        isOpen: boolean;
        onClose: () => void;
        template: PromptTemplate | null;
    }

    const TemplateViewModal: React.FC<TemplateViewModalProps> = ({
        isOpen,
        onClose,
        template
    }) => {
        const [copied, setCopied] = useState(false);

        const handleCopy = async () => {
            if (template?.content) {
                try {
                    await navigator.clipboard.writeText(template.content);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (error) {
                    console.error('Failed to copy:', error);
                }
            }
        };

        if (!isOpen || !template) return null;

        return (
            <div className={styles.modalOverlay}>
                <div className={styles.viewModal}>
                    <div className={styles.viewModalHeader}>
                        <div className={styles.viewIcon}>👁️</div>
                        <div className={styles.viewHeaderContent}>
                            <h2>{template.title}</h2>
                            <p>{template.description}</p>
                        </div>
                        <button onClick={onClose} className={styles.closeButton}>×</button>
                    </div>

                    <div className={styles.viewModalContent}>
                        <div className={styles.templateMeta}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Category:</span>
                                <span className={styles.categoryBadge} style={{
                                    background: template.category === 'Marketing' ? '#667eea' :
                                        template.category === 'Coding' ? '#764ba2' : '#8b5cf6'
                                }}>
                                    {template.category}
                                </span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Tags:</span>
                                <div className={styles.tagsList}>
                                    {template.tags.map((tag) => (
                                        <span key={tag} className={styles.tag}>#{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Usage:</span>
                                <span>{template.usage_count} times • ⭐ {template.rating} ({template.review_count} reviews)</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Creator:</span>
                                <span>{template.creator}</span>
                            </div>
                        </div>

                        <div className={styles.templateContentSection}>
                            <div className={styles.contentHeader}>
                                <h3>Template Content</h3>
                                <button
                                    onClick={handleCopy}
                                    className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                                >
                                    {copied ? '✅ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                            <div className={styles.templateContentBox}>
                                {template.content}
                            </div>
                            <div className={styles.usageNote}>
                                <strong>Usage Note:</strong> Replace placeholders like [VARIABLE] with your specific content when using this template.
                            </div>
                        </div>
                    </div>

                    <div className={styles.viewModalActions}>
                        <button onClick={onClose} className={styles.closeActionButton}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Success Modal Component
    interface SuccessModalProps {
        isOpen: boolean;
        onClose: () => void;
        message: string;
    }

    const SuccessModal: React.FC<SuccessModalProps> = ({
        isOpen,
        onClose,
        message
    }) => {
        if (!isOpen) return null;

        return (
            <div className={styles.modalOverlay}>
                <div className={styles.successModal}>
                    <div className={styles.successModalHeader}>
                        <div className={styles.successIcon}>✅</div>
                        <h2>Success</h2>
                    </div>

                    <div className={styles.successModalContent}>
                        <p>{message}</p>
                    </div>

                    <div className={styles.successModalActions}>
                        <button
                            onClick={onClose}
                            className={styles.successButton}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Delete Confirmation Modal Component
    interface DeleteConfirmModalProps {
        isOpen: boolean;
        onClose: () => void;
        onConfirm: () => void;
        templateTitle: string;
    }

    const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
        isOpen,
        onClose,
        onConfirm,
        templateTitle
    }) => {
        if (!isOpen) return null;

        return (
            <div className={styles.modalOverlay}>
                <div className={styles.deleteModal}>
                    <div className={styles.deleteModalHeader}>
                        <div className={styles.deleteIcon}>🗑️</div>
                        <h2>Delete Template</h2>
                    </div>

                    <div className={styles.deleteModalContent}>
                        <p>Are you sure you want to delete <strong>"{templateTitle}"</strong>?</p>
                        <p className={styles.deleteWarning}>
                            This action cannot be undone. The template will be permanently removed from your library.
                        </p>
                    </div>

                    <div className={styles.deleteModalActions}>
                        <button
                            onClick={onClose}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={styles.deleteConfirmButton}
                        >
                            Delete Template
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const loadFeaturedTemplates = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/templates/featured`);
            const result = await response.json();

            if (result.success && result.data) {
                const mappedTemplates = result.data.map((template: any) => ({
                    id: template.id,
                    title: template.title || template.name,
                    description: template.description,
                    category: template.category,
                    tags: template.tags || [],
                    content: template.content || template.template_text,
                    creator: template.creator_name || '@' + (template.created_by || 'user'),
                    created_at: template.created_at,
                    updated_at: template.updated_at,
                    usage_count: template.usage_count || 0,
                    rating: template.rating || 0,
                    review_count: template.review_count || 0,
                    is_featured: template.is_featured,
                    is_public: template.is_public,
                    version: template.version || '1.0'
                }));

                setFeaturedTemplates(mappedTemplates);
                console.log('✅ Loaded featured templates from API:', mappedTemplates);
            } else {
                console.error('❌ API call succeeded but no data:', result);
                loadMockTemplates();
            }
        } catch (error) {
            console.error('❌ Failed to load featured templates from API:', error);
            setError('Failed to load templates. Using sample data.');
            loadMockTemplates();
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllTemplates = async () => {
        try {
            console.log('🔄 loadAllTemplates: Starting to load all templates...');
            const response = await fetch(`${API_BASE_URL}/templates?limit=50&sort_by=recent`);
            const result = await response.json();

            if (result.success && result.data) {
                const mappedTemplates = result.data.map((template: any) => ({
                    id: template.id,
                    title: template.title || template.name,
                    description: template.description,
                    category: template.category,
                    tags: template.tags || [],
                    content: template.content || template.template_text,
                    creator: template.creator_name || '@' + (template.created_by || 'user'),
                    created_at: template.created_at,
                    updated_at: template.updated_at,
                    usage_count: template.usage_count || 0,
                    rating: template.rating || 0,
                    review_count: template.review_count || 0,
                    is_featured: template.is_featured,
                    is_public: template.is_public,
                    version: template.version || '1.0'
                }));

                console.log('✅ loadAllTemplates: Loaded templates:', mappedTemplates.length, 'templates');
                console.log('First template:', mappedTemplates[0]?.title);
                setTemplates(mappedTemplates);
            } else {
                console.log('❌ loadAllTemplates: No data in response');
            }
        } catch (error) {
            console.error('❌ Failed to load all templates:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            const result = await response.json();

            if (result.success && result.data) {
                const mappedCategories = result.data.map((cat: any) => ({
                    name: cat.name,
                    count: cat.template_count || 0,
                    color: cat.color_hex || '#667eea'
                }));
                setCategories(mappedCategories);
                console.log('✅ Loaded categories from API:', mappedCategories);
            } else {
                loadMockCategories();
            }
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
            loadMockCategories();
        }
    };

    const loadDashboardStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`);
            const result = await response.json();

            if (result.success && result.data) {
                setDashboardStats(result.data);
                console.log('✅ Loaded dashboard stats from API:', result.data);
            } else {
                loadMockDashboardStats();
            }
        } catch (error) {
            console.error('❌ Failed to load dashboard stats:', error);
            loadMockDashboardStats();
        }
    };

    const searchTemplates = async (searchParams = {}) => {
        try {
            setIsLoading(true);

            const params = new URLSearchParams({
                limit: '20',
                offset: '0',
                sort_by: sortBy,
                ...searchParams,
                ...(searchTerm && { search: searchTerm }),
                ...(selectedCategory !== 'All' && { category: selectedCategory })
            });

            const response = await fetch(`${API_BASE_URL}/templates?${params}`);
            const result = await response.json();

            if (result.success && result.data) {
                const mappedTemplates = result.data.map((template: any) => ({
                    id: template.id,
                    title: template.title || template.name,
                    description: template.description,
                    category: template.category,
                    tags: template.tags || [],
                    content: template.content || template.template_text,
                    creator: template.creator_name || '@' + (template.created_by || 'user'),
                    created_at: template.created_at,
                    updated_at: template.updated_at,
                    usage_count: template.usage_count || 0,
                    rating: template.rating || 0,
                    review_count: template.review_count || 0,
                    is_featured: template.is_featured,
                    is_public: template.is_public,
                    version: template.version || '1.0'
                }));

                setTemplates(mappedTemplates);
                return mappedTemplates;
            }
        } catch (error) {
            console.error('❌ Failed to search templates:', error);
            setError('Failed to search templates');
        } finally {
            setIsLoading(false);
        }
    };

    // Mock data fallbacks
    const loadMockTemplates = () => {
        const mockTemplates = [
            {
                id: '1',
                title: 'Marketing Email Generator',
                description: 'Create compelling marketing emails for [PRODUCT] targeting [AUDIENCE] with focus on [BENEFIT].',
                category: 'Marketing',
                tags: ['email', 'marketing', 'conversion'],
                content: 'Create a compelling marketing email for [PRODUCT] targeting [AUDIENCE] with focus on [BENEFIT]. Include subject line, body, and CTA.',
                creator: '@marketing_pro',
                created_at: '2024-01-15',
                updated_at: '2024-01-20',
                usage_count: 1247,
                rating: 4.8,
                review_count: 156,
                is_featured: true,
                is_public: true,
                version: '2.1'
            },
            {
                id: '2',
                title: 'Code Documentation Writer',
                description: 'Generate comprehensive documentation for [CODE_BLOCK]. Include purpose, parameters, return values.',
                category: 'Coding',
                tags: ['documentation', 'code', 'api'],
                content: 'Generate comprehensive documentation for: [CODE_BLOCK]. Include: purpose, parameters, return values, examples, and error handling.',
                creator: '@dev_tools',
                created_at: '2024-01-10',
                updated_at: '2024-01-18',
                usage_count: 892,
                rating: 4.7,
                review_count: 89,
                is_featured: true,
                is_public: true,
                version: '1.5'
            }
        ];
        setFeaturedTemplates(mockTemplates);
        console.log('📝 Using mock templates as fallback');
    };

    const loadMockCategories = () => {
        const mockCategories = [
            { name: 'Marketing Copy', count: 847, color: '#667eea' },
            { name: 'Code Generation', count: 623, color: '#764ba2' },
            { name: 'Creative Writing', count: 456, color: '#8b5cf6' },
            { name: 'Data Analysis', count: 334, color: '#6366f1' },
            { name: 'Support', count: 278, color: '#8b9cf7' }
        ];
        setCategories(mockCategories);
    };

    const loadMockDashboardStats = () => {
        setDashboardStats({
            total_templates: 2847,
            categories: [],
            user_stats: { created: 23, saved: 156, total_uses: 1200 },
            recent_updates: [
                { title: 'Email Marketing Campaign', time: '2 hours ago', variants: 47, type: 'updated' },
                { title: 'Python Code Documentation', time: '1 day ago', type: 'community' }
            ],
            top_rated: [
                { title: 'Product Description Writer', rating: 4.8, reviews: 247 },
                { title: 'Email Subject Line Generator', rating: 4.9, reviews: 189 }
            ]
        });
    };

    const getCategoryColor = (category: string) => {
        const categoryObj = categories.find(cat => cat.name === category);
        return categoryObj?.color || '#667eea';
    };

    const handleUseTemplate = async (template: PromptTemplate) => {
        try {
            // Log usage via API
            await fetch(`${API_BASE_URL}/templates/${template.id}/use`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('✅ Template usage logged');

            // Show template in custom modal instead of alert
            setViewingTemplate(template);
            setShowViewModal(true);
        } catch (error) {
            console.error('❌ Failed to log template usage:', error);
            // Still show the template even if logging fails
            setViewingTemplate(template);
            setShowViewModal(true);
        }
    };

    const handleCreateTemplate = () => {
        setShowCreateModal(true);
    };

    const handleEditTemplate = (template: PromptTemplate) => {
        setEditingTemplate(template);
        setShowEditModal(true);
    };

    const handleDeleteTemplate = async (template: PromptTemplate) => {
        setDeletingTemplate(template);
        setShowDeleteModal(true);
    };

    const confirmDeleteTemplate = async () => {
        if (!deletingTemplate) return;

        try {
            const response = await fetch(`${API_BASE_URL}/templates/${deletingTemplate.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Remove from local state
                setFeaturedTemplates(prev => prev.filter(t => t.id !== deletingTemplate.id));
                setTemplates(prev => prev.filter(t => t.id !== deletingTemplate.id));

                // If we're currently showing all templates, refresh that view too
                if (showAllTemplates) {
                    await searchTemplates();
                }

                // Show success modal
                setSuccessMessage('Template deleted successfully');
                setShowSuccessModal(true);
            } else {
                throw new Error(result.message || result.detail || 'Failed to delete template');
            }
        } catch (error) {
            console.error('❌ Failed to delete template:', error);
            alert(`Failed to delete template: ${error.message || 'Unknown error'}`);
        } finally {
            setShowDeleteModal(false);
            setDeletingTemplate(null);
        }
    };

    const handleSaveTemplate = async (templateData: any) => {
        try {
            const isEditing = editingTemplate !== null;
            const url = isEditing
                ? `${API_BASE_URL}/templates/${editingTemplate.id}`
                : `${API_BASE_URL}/templates`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Template saved successfully!');

                // Show success modal
                setSuccessMessage(`Template ${isEditing ? 'updated' : 'created'} successfully`);
                setShowSuccessModal(true);

                // Close modals first
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingTemplate(null);

                // Simple approach: just reload all data
                console.log('🔄 Reloading all template data...');
                loadInitialData(); // This loads everything fresh

            } else {
                throw new Error(result.message || 'Failed to save template');
            }
        } catch (error) {
            console.error('❌ Failed to save template:', error);
            alert('Failed to save template');
        }
    };

    const handleSearch = async () => {
        await searchTemplates();
    };

    const handleCategoryFilter = async (category: string) => {
        setSelectedCategory(category);
        await searchTemplates({ category: category !== 'All' ? category : undefined });
    };

    if (!isClient) {
        return (
            <div className={styles.loadingState}>
                Loading Prompt Library...
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* Error Message */}
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIcon}>
                            <span>📚</span>
                        </div>
                        <div className={styles.headerContent}>
                            <h1>Prompt Registry</h1>
                            <p>Template library and prompt management system</p>
                            <div className={styles.headerStats}>
                                <span>• {dashboardStats?.total_templates || 0} templates</span>
                                <span>• {categories.length} categories</span>
                                <span>• Live updates</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerButtons}>
                        <button className={styles.importButton}>
                            Import Templates
                        </button>
                        <button
                            onClick={handleCreateTemplate}
                            className={styles.createButton}
                        >
                            Create Template
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className={styles.searchSection}>
                    <div className={styles.searchControls}>
                        <div className={styles.searchInputContainer}>
                            <input
                                type="text"
                                placeholder="Search templates, categories, or use cases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className={styles.searchInput}
                            />
                            <span
                                className={styles.searchIcon}
                                onClick={handleSearch}
                            >
                                🔍
                            </span>
                        </div>
                        <div className={styles.viewControls}>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                            >
                                List
                            </button>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className={styles.sortSelect}
                            >
                                <option value="popular">Popular</option>
                                <option value="recent">Recent</option>
                                <option value="rating">Top Rated</option>
                                <option value="alphabetical">A-Z</option>
                            </select>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className={styles.quickFilters}>
                        <span className={styles.quickFiltersLabel}>
                            Quick Filters:
                        </span>
                        <button
                            onClick={() => handleCategoryFilter('All')}
                            className={`${styles.filterButton} ${selectedCategory === 'All' ? styles.active : ''}`}
                            style={{
                                backgroundColor: selectedCategory === 'All' ? '#667eea' : 'white',
                                borderColor: '#667eea',
                                color: selectedCategory === 'All' ? 'white' : '#667eea'
                            }}
                        >
                            All
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => handleCategoryFilter(category.name)}
                                className={`${styles.filterButton} ${selectedCategory === category.name ? styles.active : ''}`}
                                style={{
                                    backgroundColor: selectedCategory === category.name ? category.color : 'white',
                                    borderColor: category.color,
                                    color: selectedCategory === category.name ? 'white' : category.color
                                }}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className={styles.dashboardGrid}>
                    {/* Popular Categories */}
                    <div className={styles.dashboardCard}>
                        <h3 className={styles.cardTitle}>
                            📊 Popular Categories
                        </h3>
                        {categories.map((category) => (
                            <div
                                key={category.name}
                                className={styles.categoryItem}
                                onClick={() => handleCategoryFilter(category.name)}
                            >
                                <div className={styles.categoryInfo}>
                                    <div
                                        className={styles.categoryDot}
                                        style={{ background: category.color }}
                                    />
                                    <span className={styles.categoryName}>
                                        {category.name}
                                    </span>
                                </div>
                                <span className={styles.categoryCount}>
                                    {category.count} templates
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Recent Updates */}
                    <div className={styles.dashboardCard}>
                        <h3 className={styles.cardTitle}>
                            🔄 Recent Updates
                        </h3>
                        {(dashboardStats?.recent_updates || []).map((update, index) => (
                            <div key={index} className={styles.updateItem}>
                                <div className={styles.updateTitle}>
                                    • {update.title}
                                </div>
                                <div className={styles.updateMeta}>
                                    {update.time} • {update.variants && `${update.variants} new variants`}
                                    {update.type === 'community' && 'Community contributed'}
                                    {update.type === 'optimized' && 'SEO optimized'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* My Templates */}
                    <div className={styles.dashboardCard}>
                        <h3 className={styles.cardTitle}>
                            👤 My Templates
                        </h3>
                        <div className={styles.myTemplatesStats}>
                            <div className={styles.mainStat}>
                                {dashboardStats?.user_stats?.created || 0}
                            </div>
                            <div className={styles.mainStatLabel}>
                                created
                            </div>
                            <div className={styles.subStatsGrid}>
                                <div>
                                    <div className={`${styles.subStat} ${styles.saved}`}>
                                        {dashboardStats?.user_stats?.saved || 0}
                                    </div>
                                    <div className={styles.subStatLabel}>
                                        saved
                                    </div>
                                </div>
                                <div>
                                    <div className={`${styles.subStat} ${styles.uses}`}>
                                        {dashboardStats?.user_stats?.total_uses || 0}
                                    </div>
                                    <div className={styles.subStatLabel}>
                                        total uses
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Rated */}
                    <div className={styles.dashboardCard}>
                        <h3 className={styles.cardTitle}>
                            ⭐ Top Rated
                        </h3>
                        {(dashboardStats?.top_rated || []).map((item, index) => (
                            <div key={index} className={styles.ratedItem}>
                                <div className={styles.ratedTitle}>
                                    {item.title}
                                </div>
                                <div className={styles.ratingInfo}>
                                    <div className={styles.stars}>
                                        {'⭐'.repeat(Math.floor(item.rating))}
                                        <span className={styles.ratingScore}>
                                            {item.rating}
                                        </span>
                                    </div>
                                    <span>({item.reviews} reviews)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Templates Section */}
                <div className={styles.featuredSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2 className={styles.featuredTitle}>
                                {showAllTemplates ? 'All Templates' : 'Featured Templates'}
                            </h2>
                            <p className={styles.featuredSubtitle}>
                                {showAllTemplates
                                    ? `Showing ${templates.length} templates`
                                    : 'Curated collection of high-performing prompts'
                                }
                            </p>
                        </div>
                        <div className={styles.sectionActions}>
                            <button
                                onClick={() => {
                                    console.log('🔄 Toggle button clicked. Current state:', showAllTemplates);
                                    setShowAllTemplates(!showAllTemplates);

                                    // Force reload data when toggling
                                    console.log('🔄 Reloading data after toggle...');
                                    loadInitialData();
                                }}
                                className={styles.toggleButton}
                            >
                                {showAllTemplates ? 'Show Featured Only' : 'Show All Templates'}
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className={styles.loadingState}>
                            Loading templates...
                        </div>
                    ) : (
                        <div className={`${styles.templateGrid} ${viewMode === 'grid' ? styles.gridView : styles.listView}`}>
                            {(showAllTemplates ? templates : featuredTemplates).map((template) => (
                                <div key={template.id} className={styles.templateCard}>
                                    <div className={styles.templateHeader}>
                                        <div
                                            className={styles.categoryBadge}
                                            style={{ background: getCategoryColor(template.category) }}
                                        >
                                            {template.category}
                                        </div>
                                        <div className={styles.templateRating}>
                                            <span>⭐ {template.rating}</span>
                                            <span>({template.review_count})</span>
                                        </div>
                                    </div>

                                    <h3 className={styles.templateTitle}>
                                        {template.title}
                                    </h3>

                                    <p className={styles.templateDescription}>
                                        {template.description}
                                    </p>

                                    <div className={styles.templateContent}>
                                        {template.content}
                                    </div>

                                    <div className={styles.templateMeta}>
                                        <div className={styles.templateTags}>
                                            {template.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className={styles.tag}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className={styles.templateStats}>
                                            Used {template.usage_count} times • Created by {template.creator}
                                        </div>
                                    </div>

                                    <div className={styles.templateActions}>
                                        <button
                                            onClick={() => handleUseTemplate(template)}
                                            className={styles.viewButton}
                                        >
                                            View Template
                                        </button>
                                        <button
                                            onClick={() => handleEditTemplate(template)}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTemplate(template)}
                                            className={styles.deleteButton}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Browse More Section */}
                <div className={styles.browseMore}>
                    <button
                        onClick={() => searchTemplates()}
                        className={styles.browseButton}
                    >
                        Browse All Templates
                    </button>
                </div>

                {/* Template Management Modals */}
                {(showCreateModal || showEditModal) && (
                    <TemplateModal
                        isOpen={showCreateModal || showEditModal}
                        onClose={() => {
                            setShowCreateModal(false);
                            setShowEditModal(false);
                            setEditingTemplate(null);
                        }}
                        onSave={handleSaveTemplate}
                        template={editingTemplate}
                        categories={categories}
                        isEditing={showEditModal}
                    />
                )}

                {/* Template Viewer Modal */}
                {showViewModal && (
                    <TemplateViewModal
                        isOpen={showViewModal}
                        onClose={() => {
                            setShowViewModal(false);
                            setViewingTemplate(null);
                        }}
                        template={viewingTemplate}
                    />
                )}

                {/* Success Modal */}
                {showSuccessModal && (
                    <SuccessModal
                        isOpen={showSuccessModal}
                        onClose={() => setShowSuccessModal(false)}
                        message={successMessage}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <DeleteConfirmModal
                        isOpen={showDeleteModal}
                        onClose={() => {
                            setShowDeleteModal(false);
                            setDeletingTemplate(null);
                        }}
                        onConfirm={confirmDeleteTemplate}
                        templateTitle={deletingTemplate?.title || ''}
                    />
                )}
            </div>
        </div>
    );
};

// Template Modal Component
interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (templateData: any) => void;
    template?: PromptTemplate | null;
    categories: Category[];
    isEditing: boolean;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
    isOpen,
    onClose,
    onSave,
    template,
    categories,
    isEditing
}) => {
    const [formData, setFormData] = useState({
        title: template?.title || '',
        description: template?.description || '',
        content: template?.content || '',
        category: template?.category || 'General',
        tags: template?.tags?.join(', ') || '',
        is_public: template?.is_public || false,
        is_featured: template?.is_featured || false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const templateData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        };

        onSave(templateData);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>{isEditing ? 'Edit Template' : 'Create New Template'}</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="Enter template title"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what this template does"
                            rows={3}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Template Content *</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                            placeholder="Enter your prompt template here. Use [VARIABLE] for placeholders."
                            rows={6}
                            className={styles.contentTextarea}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="General">General</option>
                                {categories.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Tags</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="marketing, email, conversion (comma-separated)"
                            />
                        </div>
                    </div>

                    <div className={styles.formCheckboxes}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={formData.is_public}
                                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                            />
                            Make this template public
                        </label>

                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={formData.is_featured}
                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            />
                            Feature this template
                        </label>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            {isEditing ? 'Update Template' : 'Create Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromptLibraryPage;
