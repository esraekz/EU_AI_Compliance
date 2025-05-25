import React, { useEffect, useState } from 'react';
import { invoiceApi } from '../../services/api';
import styles from './InvoiceChatPage.module.css';

import ChatPanel from './ChatPanel';
import DocumentSelectionPanel from './DocumentSelectionPanel';
import VisualizationPanel from './VisualizationPanel';

const InvoiceChatPage: React.FC = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);
    const [isVisualizationPanelOpen, setVisualizationPanelOpen] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

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
            setError('Failed to fetch documents.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenVisualization = () => {
        setVisualizationPanelOpen(true);
    };

    const handleCloseVisualization = () => {
        setVisualizationPanelOpen(false);
    };

    return (
        <div className={`${styles.container} ${isVisualizationPanelOpen ? styles.threePanel : styles.twoPanel}`}>
            <DocumentSelectionPanel
                documents={documents}
                isLoading={isLoading}
                error={error}
                selectedDocuments={selectedDocuments}
                setSelectedDocuments={setSelectedDocuments}
                expandedDocumentId={expandedDocumentId}
                setExpandedDocumentId={setExpandedDocumentId}
            />

            <ChatPanel
                selectedDocuments={selectedDocuments}
                isVisualizationPanelOpen={isVisualizationPanelOpen}
                onOpenVisualization={handleOpenVisualization}
            />

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
