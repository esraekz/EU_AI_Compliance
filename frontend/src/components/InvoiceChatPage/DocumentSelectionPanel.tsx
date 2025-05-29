// Complete Updated DocumentSelectionPanel.tsx - With Debugging

import React, { useEffect, useRef, useState } from 'react';
import { useGlobalChatState } from '../../hooks/useGlobalChatState';
import styles from './DocumentSelectionPanel.module.css';

interface DocumentSelectionPanelProps {
    documents: any[];
    isLoading: boolean;
    error: string | null;
}

const DocumentSelectionPanel: React.FC<DocumentSelectionPanelProps> = ({
    documents,
    isLoading,
    error
}) => {
    // Add debugging to see what's happening
    useEffect(() => {
        console.log('📋 DocumentSelectionPanel Debug:');
        console.log('- isLoading:', isLoading);
        console.log('- error:', error);
        console.log('- documents:', documents);
        console.log('- documents.length:', documents.length);
        if (documents.length > 0) {
            console.log('- first document:', documents[0]);
        }
    }, [documents, isLoading, error]);

    // Use global state instead of props
    const {
        selectedDocuments,
        expandedDocumentId,
        setSelectedDocuments,
        setExpandedDocumentId
    } = useGlobalChatState();

    // Add debugging for global state
    useEffect(() => {
        console.log('🌐 Global State Debug:');
        console.log('- selectedDocuments:', selectedDocuments);
        console.log('- selectedDocuments.length:', selectedDocuments.length);
        console.log('- expandedDocumentId:', expandedDocumentId);
    }, [selectedDocuments, expandedDocumentId]);

    // Panel resizing state (local)
    const [panelWidth, setPanelWidth] = useState(300);
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

    // Document selection functions
    const toggleDocumentSelection = (documentId: string) => {
        console.log('📌 Toggling document selection:', documentId);
        if (selectedDocuments.includes(documentId)) {
            setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
        } else {
            setSelectedDocuments([...selectedDocuments, documentId]);
        }
    };

    const toggleDocumentExpansion = (documentId: string) => {
        console.log('📖 Toggling document expansion:', documentId);
        if (expandedDocumentId === documentId) {
            setExpandedDocumentId(null);
        } else {
            setExpandedDocumentId(documentId);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return 'Invalid Date';
        }
    };

    // Clear selection handler
    const clearSelection = () => {
        console.log('🧹 Clearing selection');
        setSelectedDocuments([]);
        setExpandedDocumentId(null);
    };

    // Select all handler
    const selectAll = () => {
        console.log('📑 Selecting all documents');
        const allIds = documents.map(doc => doc.id);
        console.log('All document IDs:', allIds);
        setSelectedDocuments(allIds);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.documentPanel} style={{ width: panelWidth }}>
                <div className={styles.panelTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Processed Documents</span>
                    <small style={{ fontSize: '10px', color: '#666' }}>
                        Loading...
                    </small>
                </div>
                <div className={styles.loadingState}>
                    Loading documents...
                    <br />
                    <small style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        If this persists, check console for errors (F12)
                    </small>
                </div>
                <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.documentPanel} style={{ width: panelWidth }}>
                <div className={styles.panelTitle}>Processed Documents</div>
                <div className={styles.errorState}>
                    {error}
                    <br />
                    <small style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        Check network tab (F12) for API errors
                    </small>
                </div>
                <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
            </div>
        );
    }

    // Empty state
    if (documents.length === 0) {
        return (
            <div className={styles.documentPanel} style={{ width: panelWidth }}>
                <div className={styles.panelTitle}>Processed Documents</div>
                <div className={styles.emptyState}>
                    No processed documents found
                    <br />
                    <small style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        Upload documents and wait for processing to complete
                    </small>
                </div>
                <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
            </div>
        );
    }

    return (
        <div
            className={styles.documentPanel}
            style={{ width: panelWidth }}
            ref={panelRef}
        >
            <div className={styles.panelTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Processed Documents</span>
                {/* Add debug info and selection controls */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <small style={{ fontSize: '10px', color: '#666' }}>
                        {documents.length} docs
                    </small>
                    <button
                        onClick={selectAll}
                        style={{
                            background: 'none',
                            border: '1px solid #5b42f3',
                            color: '#5b42f3',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        All
                    </button>
                    <button
                        onClick={clearSelection}
                        style={{
                            background: 'none',
                            border: '1px solid #666',
                            color: '#666',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>

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
                                <div className={styles.documentDate}>
                                    {formatDate(doc.uploadDate || doc.upload_date)}
                                </div>
                                <div className={`${styles.documentStatus} ${styles.processed}`}>
                                    {doc.status || 'Processed'}
                                </div>
                            </div>
                        </div>

                        {/* Expanded document preview */}
                        {expandedDocumentId === doc.id && (
                            <div className={styles.documentPreview}>
                                <div className={styles.previewIcon}>
                                    {doc.fileType === 'pdf' || doc.filename?.endsWith('.pdf') ? 'PDF' : 'IMG'}
                                </div>
                                <div className={styles.previewDetails}>
                                    <div className={styles.previewInfo}>Status: {doc.status || 'Processed'}</div>
                                    <div className={styles.previewInfo}>Supplier: {doc.supplier || 'N/A'}</div>
                                    <div className={styles.previewInfo}>ID: {doc.id?.substring(0, 8)}...</div>
                                    <div className={styles.previewInfo}>
                                        User: {doc.user_id?.substring(0, 12) || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Enhanced selection summary */}
            {selectedDocuments.length > 0 && (
                <div className={styles.selectionSummary}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className={styles.askButton}
                                onClick={clearSelection}
                                style={{
                                    background: 'transparent',
                                    color: '#5b42f3',
                                    border: '1px solid #5b42f3'
                                }}
                            >
                                Clear
                            </button>
                            <button className={styles.askButton}>
                                Ready to Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help text when no documents are selected */}
            {selectedDocuments.length === 0 && (
                <div className={styles.helpText}>
                    <p>💡 Select documents to start analyzing</p>
                    <p>Check the boxes next to documents you want to analyze with AI</p>
                    {/* Debug info */}
                    <details style={{ fontSize: '10px', marginTop: '8px' }}>
                        <summary style={{ cursor: 'pointer', color: '#666' }}>Debug Info</summary>
                        <div style={{ marginTop: '4px', color: '#999' }}>
                            <div>Available documents: {documents.length}</div>
                            <div>Selected documents: {selectedDocuments.length}</div>
                            <div>Global state working: {selectedDocuments ? '✅' : '❌'}</div>
                        </div>
                    </details>
                </div>
            )}

            {/* Resize handle */}
            <div
                className={styles.resizeHandle}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
};

export default DocumentSelectionPanel;
