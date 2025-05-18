// frontend/src/components/InvoiceChatPage/DocumentSelectionPanel.tsx
import React from 'react';
import styles from './DocumentSelectionPanel.module.css';

interface DocumentSelectionPanelProps {
    documents: any[];
    isLoading: boolean;
    error: string | null;
    selectedDocuments: string[];
    setSelectedDocuments: (docs: string[]) => void;
    expandedDocumentId: string | null;
    setExpandedDocumentId: (id: string | null) => void;
}

const DocumentSelectionPanel: React.FC<DocumentSelectionPanelProps> = ({
    documents,
    isLoading,
    error,
    selectedDocuments,
    setSelectedDocuments,
    expandedDocumentId,
    setExpandedDocumentId
}) => {
    // Toggle document selection
    const toggleDocumentSelection = (documentId: string) => {
        if (selectedDocuments.includes(documentId)) {
            setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
        } else {
            setSelectedDocuments([...selectedDocuments, documentId]);
        }
    };

    // Toggle document expansion
    const toggleDocumentExpansion = (documentId: string) => {
        if (expandedDocumentId === documentId) {
            setExpandedDocumentId(null);
        } else {
            setExpandedDocumentId(documentId);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return <div className={styles.loadingState}>Loading documents...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>{error}</div>;
    }

    if (documents.length === 0) {
        return <div className={styles.emptyState}>No processed documents found</div>;
    }

    return (
        <div className={styles.documentPanel}>
            <h2 className={styles.panelTitle}>Processed Documents</h2>

            <div className={styles.documentList}>
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className={`${styles.documentItem}
                       ${selectedDocuments.includes(doc.id) ? styles.selected : ''}
                       ${expandedDocumentId === doc.id ? styles.expanded : ''}`}
                    >
                        <div
                            className={styles.documentHeader}
                            onClick={() => toggleDocumentExpansion(doc.id)}
                        >
                            <div className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={selectedDocuments.includes(doc.id)}
                                    onChange={() => toggleDocumentSelection(doc.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div className={styles.documentInfo}>
                                <div className={styles.documentName}>{doc.filename}</div>
                                <div className={styles.documentDate}>{formatDate(doc.uploadDate)}</div>
                                <div className={`${styles.documentStatus} ${styles.processed}`}>
                                    Processed
                                </div>
                            </div>
                        </div>

                        {/* Expanded document preview */}
                        {expandedDocumentId === doc.id && (
                            <div className={styles.documentPreview}>
                                <div className={styles.previewIcon}>
                                    {doc.fileType === 'pdf' ? 'PDF' : 'IMG'}
                                </div>
                                <div className={styles.previewDetails}>
                                    <div className={styles.previewInfo}>Invoice #: {doc.invoiceNumber || 'N/A'}</div>
                                    <div className={styles.previewInfo}>Total: ${doc.total || 'N/A'}</div>
                                    <div className={styles.previewInfo}>Vendor: {doc.vendor || 'N/A'}</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedDocuments.length > 0 && (
                <div className={styles.selectionSummary}>
                    <span>{selectedDocuments.length} documents selected</span>
                    <button className={styles.askButton}>
                        Ask Questions
                    </button>
                </div>
            )}
        </div>
    );
};

export default DocumentSelectionPanel;
