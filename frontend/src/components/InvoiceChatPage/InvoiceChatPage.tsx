// frontend/src/components/InvoiceChatPage/InvoiceChatPage.tsx
import React, { useEffect, useState } from 'react';
import { invoiceApi } from '../../services/api';
import ChatPanel from './ChatPanel';
import DocumentSelectionPanel from './DocumentSelectionPanel';
import styles from './InvoiceChatPage.module.css';
import VisualizationPanel from './VisualizationPanel';

const InvoiceChatPage: React.FC = () => {
    // State for documents and selection
    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);
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
                sortDir: 'desc',
                status: 'Processed' // Only get processed documents
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

    return (
        <div className={styles.container}>
            {/* Left panel - Document selection */}
            <DocumentSelectionPanel
                documents={documents}
                isLoading={isLoading}
                error={error}
                selectedDocuments={selectedDocuments}
                setSelectedDocuments={setSelectedDocuments}
                expandedDocumentId={expandedDocumentId}
                setExpandedDocumentId={setExpandedDocumentId}
            />

            {/* Middle panel - Chat interface */}
            <ChatPanel
                selectedDocuments={selectedDocuments}
                isVisualizationPanelOpen={isVisualizationPanelOpen}
                onOpenVisualization={() => setVisualizationPanelOpen(true)}
            />

            {/* Right panel - Visualization (conditionally rendered) */}
            {isVisualizationPanelOpen && (
                <VisualizationPanel
                    onClose={() => setVisualizationPanelOpen(false)}
                    selectedDocuments={selectedDocuments}
                />
            )}
        </div>
    );
};

export default InvoiceChatPage;
