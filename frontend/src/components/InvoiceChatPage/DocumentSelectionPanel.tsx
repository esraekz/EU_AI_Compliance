// Updated DocumentSelectionPanel.tsx - MINIMAL CHANGES, keep original styling

import React, { useEffect, useRef, useState } from 'react';
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
    // ONLY ADD RESIZE FUNCTIONALITY - keep everything else the same
    const [panelWidth, setPanelWidth] = useState(250); // Use original default width
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Mouse events for resizing
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const newWidth = e.clientX;

            // Set minimum and maximum width constraints
            const minWidth = 250;
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

    // KEEP ALL ORIGINAL FUNCTIONS UNCHANGED
    const toggleDocumentSelection = (documentId: string) => {
        if (selectedDocuments.includes(documentId)) {
            setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
        } else {
            setSelectedDocuments([...selectedDocuments, documentId]);
        }
    };

    const toggleDocumentExpansion = (documentId: string) => {
        if (expandedDocumentId === documentId) {
            setExpandedDocumentId(null);
        } else {
            setExpandedDocumentId(documentId);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // KEEP ORIGINAL LOADING/ERROR STATES - just add width style
    if (isLoading) {
        return (
            <div className={styles.documentPanel} style={{ width: panelWidth }}>
                <div className={styles.loadingState}>Loading documents...</div>
                <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.documentPanel} style={{ width: panelWidth }}>
                <div className={styles.errorState}>{error}</div>
                <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className={styles.documentPanel} style={{ width: panelWidth }}>
                <div className={styles.emptyState}>No processed documents found</div>
                <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
            </div>
        );
    }

    // KEEP ORIGINAL JSX STRUCTURE - just add width style and resize handle
    return (
        <div
            className={styles.documentPanel}
            style={{ width: panelWidth }}
            ref={panelRef}
        >
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

            {/* ONLY ADD THIS - the resize handle */}
            <div
                className={styles.resizeHandle}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
};

export default DocumentSelectionPanel;
