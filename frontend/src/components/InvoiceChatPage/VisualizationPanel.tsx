// Complete Working VisualizationPanel.tsx - All Charts Enabled

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './VisualizationPanel.module.css';

interface VisualizationOption {
    id: string;
    icon: string;
    title: string;
    description: string;
}

interface VisualizationPanelProps {
    selectedDocuments: string[];
    onClose: () => void;
}

interface DocumentData {
    id: string;
    filename: string;
    vendor?: string;
    total: number;
    invoiceDate: string;
    category?: string;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
    selectedDocuments,
    onClose
}) => {
    const [panelWidth, setPanelWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);
    const [selectedChart, setSelectedChart] = useState<string | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Create realistic mock data using the selected document IDs
    const mockDocuments: DocumentData[] = useMemo(() => {
        return selectedDocuments.map((id, index) => {
            // Generate realistic vendor names
            const vendors = ['Acme Corp', 'Tech Solutions', 'Office Supplies Inc', 'Utilities Co', 'Consulting Group', 'Marketing Agency'];
            const categories = ['Office', 'IT', 'Consulting', 'Utilities', 'Marketing', 'Operations'];

            // Generate realistic amounts (between $100 and $2000)
            const amount = Math.round((Math.random() * 1900 + 100) * 100) / 100;

            // Generate realistic dates (last 6 months)
            const monthsAgo = Math.floor(Math.random() * 6);
            const date = new Date();
            date.setMonth(date.getMonth() - monthsAgo);
            date.setDate(Math.floor(Math.random() * 28) + 1);

            return {
                id: id,
                filename: `Document_${index + 1}.pdf`,
                vendor: vendors[index % vendors.length],
                total: amount,
                invoiceDate: date.toISOString().split('T')[0],
                category: categories[index % categories.length]
            };
        });
    }, [selectedDocuments]);

    // Filter documents based on selection
    const selectedDocumentData = useMemo(() => {
        const filtered = mockDocuments.filter(doc => selectedDocuments.includes(doc.id));
        console.log('📊 Document data ready:', filtered.length, 'documents');
        return filtered;
    }, [selectedDocuments, mockDocuments]);

    // Colors for charts
    const PIE_COLORS = ['#5b42f3', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];

    // Data processing functions
    const processDataForChart = (chartId: string) => {
        if (selectedDocumentData.length === 0) return [];

        switch (chartId) {
            case 'monthly-trend':
                return processMonthlyTrendData();
            case 'pie-expenses':
                return processVendorBreakdownData();
            case 'vendor-comparison':
                return processVendorComparisonData();
            case 'category-analysis':
                return processCategoryAnalysisData();
            case 'amount-distribution':
                return processAmountDistributionData();
            case 'date-analysis':
                return processDateAnalysisData();
            default:
                return [];
        }
    };

    const processMonthlyTrendData = () => {
        const monthlyData: { [key: string]: number } = {};

        selectedDocumentData.forEach(doc => {
            const date = new Date(doc.invoiceDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + doc.total;
        });

        return Object.entries(monthlyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, total]) => ({
                month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                amount: Number(total.toFixed(2))
            }));
    };

    const processVendorBreakdownData = () => {
        const vendorData: { [key: string]: number } = {};

        selectedDocumentData.forEach(doc => {
            const vendor = doc.vendor || 'Unknown';
            vendorData[vendor] = (vendorData[vendor] || 0) + doc.total;
        });

        return Object.entries(vendorData).map(([vendor, total]) => ({
            name: vendor,
            value: Number(total.toFixed(2))
        }));
    };

    const processVendorComparisonData = () => {
        const vendorData: { [key: string]: { total: number, count: number } } = {};

        selectedDocumentData.forEach(doc => {
            const vendor = doc.vendor || 'Unknown';
            if (!vendorData[vendor]) {
                vendorData[vendor] = { total: 0, count: 0 };
            }
            vendorData[vendor].total += doc.total;
            vendorData[vendor].count += 1;
        });

        return Object.entries(vendorData).map(([vendor, data]) => ({
            vendor,
            total: Number(data.total.toFixed(2)),
            count: data.count,
            average: Number((data.total / data.count).toFixed(2))
        }));
    };

    const processCategoryAnalysisData = () => {
        const categoryData: { [key: string]: number } = {};

        selectedDocumentData.forEach(doc => {
            const category = doc.category || 'Uncategorized';
            categoryData[category] = (categoryData[category] || 0) + doc.total;
        });

        return Object.entries(categoryData).map(([category, total]) => ({
            category,
            amount: Number(total.toFixed(2))
        }));
    };

    const processAmountDistributionData = () => {
        const ranges = [
            { range: '$0-250', min: 0, max: 250 },
            { range: '$250-500', min: 250, max: 500 },
            { range: '$500-1000', min: 500, max: 1000 },
            { range: '$1000+', min: 1000, max: Infinity }
        ];

        return ranges.map(({ range, min, max }) => ({
            range,
            count: selectedDocumentData.filter(doc => doc.total >= min && doc.total < max).length
        }));
    };

    const processDateAnalysisData = () => {
        return selectedDocumentData
            .sort((a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime())
            .map((doc, index) => ({
                date: new Date(doc.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                amount: doc.total,
                vendor: doc.vendor,
                index: index + 1
            }));
    };

    // Chart rendering function
    const renderChart = () => {
        if (!selectedChart || selectedDocumentData.length === 0) return null;

        const chartData = processDataForChart(selectedChart);
        if (chartData.length === 0) return null;

        switch (selectedChart) {
            case 'monthly-trend':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: any) => [`$${value}`, 'Amount']} />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#5b42f3"
                                strokeWidth={3}
                                dot={{ fill: '#5b42f3', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'pie-expenses':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`$${value}`, 'Amount']} />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'vendor-comparison':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="vendor" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={80} />
                            <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: any) => [`$${value}`, 'Total Amount']} />
                            <Bar dataKey="total" fill="#5b42f3" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'category-analysis':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: any) => [`$${value}`, 'Amount']} />
                            <Bar dataKey="amount" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'amount-distribution':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: any) => [`${value}`, 'Count']} />
                            <Bar dataKey="count" fill="#a855f7" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'date-analysis':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value: any, name: any) => [`$${value}`, 'Amount']}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#c084fc"
                                strokeWidth={2}
                                dot={{ fill: '#c084fc', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Chart type "{selectedChart}" is not implemented yet
                    </div>
                );
        }
    };

    // Handle visualization selection
    const selectVisualization = (visualizationId: string) => {
        setSelectedChart(visualizationId);
        console.log(`✅ Selected: ${visualizationId} | Documents: ${selectedDocumentData.length}`);
    };

    // Mouse events for resizing
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            const minWidth = 300;
            const maxWidth = 600;
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
        } else {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isResizing]);

    // All visualization options - now all working!
    const visualizationOptions: VisualizationOption[] = [
        {
            id: 'pie-expenses',
            icon: '🥧',
            title: 'Expense Breakdown',
            description: 'Show expenses in pie chart'
        },
        {
            id: 'monthly-trend',
            icon: '📈',
            title: 'Monthly Trend',
            description: 'Track amounts over time'
        },
        {
            id: 'vendor-comparison',
            icon: '📊',
            title: 'Vendor Comparison',
            description: 'Compare by suppliers'
        },
        {
            id: 'category-analysis',
            icon: '📉',
            title: 'Category Analysis',
            description: 'Breakdown by categories'
        },
        {
            id: 'amount-distribution',
            icon: '💰',
            title: 'Amount Distribution',
            description: 'Show amount ranges'
        },
        {
            id: 'date-analysis',
            icon: '📅',
            title: 'Date Analysis',
            description: 'Analyze by invoice dates'
        }
    ];

    const getSelectedChartInfo = () => {
        return visualizationOptions.find(opt => opt.id === selectedChart) || null;
    };

    return (
        <div
            className={styles.visualizationPanel}
            style={{ width: panelWidth }}
            ref={panelRef}
        >
            {/* Resize Handle */}
            <div
                className={styles.resizeHandle}
                onMouseDown={handleMouseDown}
            />

            {/* Header */}
            <div className={styles.header}>
                <h3 className={styles.title}>Data Visualization</h3>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    title="Close visualization panel"
                >
                    ×
                </button>
            </div>

            {/* Chart Selection */}
            <div className={styles.chartQuestions}>
                <h4 className={styles.questionsTitle}>
                    <span className={styles.sparkle}>✨</span>
                    Ready-to-use Charts
                </h4>
                <div className={styles.questionsGrid}>
                    {visualizationOptions.map(option => (
                        <div
                            key={option.id}
                            className={`${styles.questionCard} ${selectedChart === option.id ? styles.selected : ''}`}
                            onClick={() => selectVisualization(option.id)}
                        >
                            <div className={styles.questionIcon}>{option.icon}</div>
                            <div className={styles.questionContent}>
                                <div className={styles.questionTitle}>{option.title}</div>
                                <div className={styles.questionDescription}>{option.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Display Area */}
            <div className={styles.chartArea}>
                {selectedChart ? (
                    <div className={styles.chartContent}>
                        <div className={styles.chartHeader}>
                            <h4>{getSelectedChartInfo()?.title}</h4>
                            <span className={styles.documentCount}>
                                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
                            </span>
                        </div>

                        {selectedDocumentData.length > 0 ? (
                            <div>
                                {/* Interactive Charts */}
                                <div style={{
                                    background: 'white',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {renderChart()}
                                </div>

                                {/* Chart Summary */}
                                <div style={{
                                    marginTop: '15px',
                                    padding: '10px',
                                    backgroundColor: '#f8f9ff',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    textAlign: 'center'
                                }}>
                                    <strong>📊 Summary:</strong> Total: ${selectedDocumentData.reduce((sum, doc) => sum + doc.total, 0).toFixed(2)} •
                                    {selectedDocumentData.length} document{selectedDocumentData.length !== 1 ? 's' : ''} analyzed
                                </div>
                            </div>
                        ) : (
                            <div className={styles.chartPlaceholder}>
                                <div className={styles.chartIcon}>⚠️</div>
                                <div className={styles.chartMessage}>
                                    No data available for selected documents
                                    <br />
                                    <small>Please select documents in the left panel first</small>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.noChartSelected}>
                        <div className={styles.noChartIcon}>📊</div>
                        <div className={styles.noChartMessage}>
                            Select a chart type above to visualize your data
                        </div>
                        <div className={styles.noChartSubtext}>
                            {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} ready for analysis
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualizationPanel;
