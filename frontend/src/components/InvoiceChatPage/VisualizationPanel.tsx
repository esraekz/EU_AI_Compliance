// frontend/src/components/InvoiceChatPage/VisualizationPanel.tsx
import React from 'react';
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
    // Visualization options
    const visualizationOptions: VisualizationOption[] = [
        {
            id: 'monthly',
            icon: '📊',
            title: 'Monthly Trend',
            description: 'Track over time'
        },
        {
            id: 'compare',
            icon: '📈',
            title: 'Compare Totals',
            description: 'Side by side'
        },
        {
            id: 'categories',
            icon: '📉',
            title: 'Categories',
            description: 'Breakdown'
        },
        {
            id: 'custom',
            icon: '🔍',
            title: 'Custom',
            description: 'Analysis'
        },
    ];

    // Handle visualization selection
    const selectVisualization = (visualizationId: string) => {
        // Here you would implement the logic to generate the visualization
        console.log(`Selected visualization: ${visualizationId} for documents:`, selectedDocuments);

        // For now, we'll just show an alert
        alert(`Generating ${visualizationId} visualization for ${selectedDocuments.length} documents`);
    };

    return (
        <div className={styles.visualizationPanel}>
            <div className={styles.header}>
                <h3>Charts</h3>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    title="Close visualization panel"
                >
                    ×
                </button>
            </div>

            <div className={styles.visualizationOptions}>
                {visualizationOptions.map(option => (
                    <div
                        key={option.id}
                        className={styles.visualizationCard}
                        onClick={() => selectVisualization(option.id)}
                    >
                        <div className={styles.visualizationIcon}>{option.icon}</div>
                        <div className={styles.visualizationTitle}>{option.title}</div>
                        <div className={styles.visualizationDescription}>{option.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VisualizationPanel;
