import React, { useEffect, useState } from 'react';
import { invoiceApi } from '../../services/api';
import InvoiceAssistant from '../InvoiceAssistant/InvoiceAssistant';
import styles from './InvoiceChatPage.module.css';

// Types for our component
interface InvoiceChatPageProps {
    className?: string;
}

const InvoiceChatPage: React.FC<InvoiceChatPageProps> = ({ className }) => {
    // State for documents and selection
    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Show only processed documents by default
    const [activeTab, setActiveTab] = useState<'uploaded' | 'processed'>('processed');

    // Fetch documents when the component mounts
    useEffect(() => {
        fetchDocuments();
    }, [activeTab]);

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
                // Filter documents based on active tab
                const filteredDocs = response.data.invoices.filter(doc =>
                    activeTab === 'processed' ? doc.status === 'Processed' : doc.status !== 'Processed'
                );
                setDocuments(filteredDocs);
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

    // Handle document selection
    const toggleDocumentSelection = (documentId: string) => {
        setSelectedDocuments(prevSelected => {
            if (prevSelected.includes(documentId)) {
                return prevSelected.filter(id => id !== documentId);
            } else {
                return [...prevSelected, documentId];
            }
        });
    };

    // Determine if a document can be selected (only processed documents can be used for QA)
    const canSelectDocument = (doc: any) => {
        return doc.status === 'Processed';
    };

    return (
        <div className={`${styles.container} ${className || ''}`}>
            {/* Left panel - Document selection */}
            <div className={styles.documentPanel}>
                <h2 className={styles.panelTitle}>Documents</h2>

                {/* Tab navigation */}
                <div className={styles.tabNavigation}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'uploaded' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('uploaded')}
                    >
                        Uploaded
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'processed' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('processed')}
                    >
                        Processed
                    </button>
                </div>

                {/* Document list */}
                <div className={styles.documentList}>
                    {isLoading ? (
                        <div className={styles.loadingState}>Loading documents...</div>
                    ) : error ? (
                        <div className={styles.errorState}>{error}</div>
                    ) : documents.length === 0 ? (
                        <div className={styles.emptyState}>
                            No {activeTab} documents found
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div
                                key={doc.id}
                                className={`${styles.documentItem}
                                    ${selectedDocuments.includes(doc.id) ? styles.selected : ''}
                                    ${!canSelectDocument(doc) ? styles.disabled : ''}`}
                                onClick={() => canSelectDocument(doc) ? toggleDocumentSelection(doc.id) : null}
                            >
                                <div className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={selectedDocuments.includes(doc.id)}
                                        onChange={() => { }} // Controlled by the onClick of the parent div
                                        disabled={!canSelectDocument(doc)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className={styles.documentInfo}>
                                    <div className={styles.documentName}>{doc.filename}</div>
                                    <div className={styles.documentDate}>
                                        {new Date(doc.upload_date).toLocaleDateString()}
                                    </div>
                                    <div className={`${styles.documentStatus} ${styles[doc.status.toLowerCase()]}`}>
                                        {doc.status}
                                        {doc.status === 'Uploaded' && ' (Converting...)'}
                                        {doc.status === 'Error' && ' (Failed to process)'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Document selection summary */}
                {selectedDocuments.length > 0 && (
                    <div className={styles.selectionSummary}>
                        {selectedDocuments.length} document(s) selected
                    </div>
                )}

                {/* Help text for unprocessed documents */}
                {activeTab === 'uploaded' && documents.length > 0 && (
                    <div className={styles.helpText}>
                        <p>Documents must be processed before they can be used for questions.</p>
                        <p>Processing typically takes a few seconds.</p>
                    </div>
                )}
            </div>

            {/* Right panel - Chat interface */}
            <div className={styles.chatPanel}>
                <InvoiceAssistant documentIds={selectedDocuments.length > 0 ? selectedDocuments : undefined} />
            </div>
        </div>
    );
};

export default InvoiceChatPage;
