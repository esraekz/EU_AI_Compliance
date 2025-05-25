// Updated InvoiceChatPage.tsx with 3-panel resizable layout

import React, { useEffect, useState } from 'react';
import { invoiceApi } from '../../services/api';
import styles from './InvoiceChatPage.module.css';

// Import the updated components
import ChatPanel from './ChatPanel';
import DocumentSelectionPanel from './DocumentSelectionPanel';
import VisualizationPanel from './VisualizationPanel';

const InvoiceChatPage: React.FC = () => {
    // State for documents and selection
    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);

    // State for visualization panel
    const [isVisualizationPanelOpen, setVisualizationPanelOpen] = useState(false);

    // Fetch documents when the component mounts
    useEffect(() => {
        fetchDocuments();
    }, []);

    // Function to fetch documents
    const fetchDocuments = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await invoiceApi.getInvoices({
                sortBy: 'upload_date',
                sortDir: 'desc'
            });

            if (response.success && response.data) {
                setDocuments(response.data.invoices);
            } else {
                setError(response.message || 'Failed to fetch documents');
            }
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError('Failed to fetch documents. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle opening visualization panel
    const handleOpenVisualization = () => {
        if (!isVisualizationPanelOpen) {
            setVisualizationPanelOpen(true);
        }
    };

    // Handle closing visualization panel
    const handleCloseVisualization = () => {
        setVisualizationPanelOpen(false);
    };

    return (
        <div className={`${styles.container} ${isVisualizationPanelOpen ? styles.threePanel : styles.twoPanel}`}>
            {/* Left panel - Document selection (resizable) */}
            <DocumentSelectionPanel
                documents={documents}
                isLoading={isLoading}
                error={error}
                selectedDocuments={selectedDocuments}
                setSelectedDocuments={setSelectedDocuments}
                expandedDocumentId={expandedDocumentId}
                setExpandedDocumentId={setExpandedDocumentId}
            />

            {/* Middle panel - Chat interface (resizable when visualization is open) */}
            <ChatPanel
                selectedDocuments={selectedDocuments}
                isVisualizationPanelOpen={isVisualizationPanelOpen}
                onOpenVisualization={handleOpenVisualization}
            />

            {/* Right panel - Visualization (conditionally rendered, resizable) */}
            {isVisualizationPanelOpen && (
                <VisualizationPanel
                    onClose={handleCloseVisualization}
                    selectedDocuments={selectedDocuments}
                />
            )}
        </div>
    );
};

export default InvoiceChatPage;
