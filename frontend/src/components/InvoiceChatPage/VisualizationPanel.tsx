// Updated VisualizationPanel.tsx with side-by-side questions and resize functionality

import React, { useEffect, useRef, useState } from 'react';
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

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
    selectedDocuments,
    onClose
}) => {
    // State for panel resizing
    const [panelWidth, setPanelWidth] = useState(400); // Default width
    const [isResizing, setIsResizing] = useState(false);
    const [selectedChart, setSelectedChart] = useState<string | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Mouse events for resizing
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            // Calculate width from the right edge of the screen
            const newWidth = window.innerWidth - e.clientX;

            // Set minimum and maximum width constraints
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

    // Visualization options - ready-to-use chart questions
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

    // Handle visualization selection
    const selectVisualization = (visualizationId: string) => {
        setSelectedChart(visualizationId);
        console.log(`Selected visualization: ${visualizationId} for documents:`, selectedDocuments);

        // Here you would implement the logic to generate the visualization
        // For now, we'll just show which chart was selected
    };

    const getSelectedChartInfo = () => {
        const selected = visualizationOptions.find(opt => opt.id === selectedChart);
        return selected || null;
    };

    return (
        <div
            className={styles.visualizationPanel}
            style={{ width: panelWidth }}
            ref={panelRef}
        >
            {/* Resize Handle - positioned on the left edge */}
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

            {/* Ready-to-use Chart Questions - Side by Side Layout */}
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
                        <div className={styles.chartPlaceholder}>
                            <div className={styles.chartIcon}>{getSelectedChartInfo()?.icon}</div>
                            <div className={styles.chartMessage}>
                                Generating {getSelectedChartInfo()?.title.toLowerCase()}...
                                <br />
                                <small>Chart will appear here</small>
                            </div>
                        </div>
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
