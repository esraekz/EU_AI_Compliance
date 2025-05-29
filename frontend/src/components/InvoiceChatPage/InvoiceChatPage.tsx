// Updated InvoiceChatPage.tsx - With Enhanced Debugging

import React, { useEffect, useState } from 'react';
import { useGlobalChatState } from '../../hooks/useGlobalChatState';
import { invoiceApi } from '../../services/api';
import styles from './InvoiceChatPage.module.css';

import ChatPanel from './ChatPanel';
import DocumentSelectionPanel from './DocumentSelectionPanel';
import VisualizationPanel from './VisualizationPanel';

const InvoiceChatPage: React.FC = () => {
    // Document loading state (local to this page)
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get global state
    const {
        selectedDocuments,
        isVisualizationPanelOpen,
        setVisualizationPanelOpen,
        clearMessages,
        resetPageState
    } = useGlobalChatState();

    // Add debugging for component state
    useEffect(() => {
        console.log('🏠 InvoiceChatPage Debug:');
        console.log('- documents:', documents);
        console.log('- documents.length:', documents.length);
        console.log('- isLoading:', isLoading);
        console.log('- error:', error);
        console.log('- selectedDocuments from global:', selectedDocuments);
    }, [documents, isLoading, error, selectedDocuments]);

    useEffect(() => {
        console.log('🚀 InvoiceChatPage mounted, calling fetchDocuments...');
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        console.log('🔄 Starting fetchDocuments...');
        setIsLoading(true);
        setError(null);

        try {
            console.log('📡 Making API call to invoiceApi.getInvoices...');
            console.log('📡 API URL would be:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

            const response = await invoiceApi.getInvoices({
                sortBy: 'upload_date',
                sortDir: 'desc'
            });

            console.log('📡 Raw API Response:', response);
            console.log('📡 Response type:', typeof response);
            console.log('📡 Response.success:', response?.success);
            console.log('📡 Response.data:', response?.data);

            if (response && response.success && response.data) {
                console.log('✅ API call successful');
                console.log('✅ Invoices received:', response.data.invoices);
                console.log('✅ Number of invoices:', response.data.invoices?.length || 0);

                if (response.data.invoices && Array.isArray(response.data.invoices)) {
                    console.log('✅ Setting documents to:', response.data.invoices);
                    setDocuments(response.data.invoices);
                    console.log('✅ Documents set, new length should be:', response.data.invoices.length);
                } else {
                    console.log('❌ Invoices is not an array:', response.data.invoices);
                    setDocuments([]);
                }
            } else {
                console.log('❌ API returned success=false or no data');
                console.log('❌ Response.message:', response?.message);
                setError(response?.message || 'Failed to fetch documents');
                setDocuments([]);
            }
        } catch (err: any) {
            console.error('💥 fetchDocuments error:', err);
            console.error('💥 Error message:', err?.message);
            console.error('💥 Error response:', err?.response);
            console.error('💥 Error response data:', err?.response?.data);
            console.error('💥 Error response status:', err?.response?.status);

            setError(`Failed to fetch documents: ${err?.message || 'Unknown error'}`);
            setDocuments([]);
        } finally {
            console.log('🏁 fetchDocuments complete');
            setIsLoading(false);
        }
    };

    const handleCloseVisualization = () => {
        setVisualizationPanelOpen(false);
    };

    // Add page visibility handler to refresh documents when returning to the page
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('👁️ Page became visible, refreshing documents...');
                fetchDocuments();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Add handlers for clearing state
    const handleClearChat = () => {
        if (window.confirm('Clear all chat messages?')) {
            clearMessages();
        }
    };

    const handleResetAll = () => {
        if (window.confirm('Reset all data (messages, selections, etc.)?')) {
            resetPageState();
        }
    };

    // Add manual refresh handler
    const handleManualRefresh = () => {
        console.log('🔄 Manual refresh triggered');
        fetchDocuments();
    };

    return (
        <div className={`${styles.container} ${isVisualizationPanelOpen ? styles.threePanel : styles.twoPanel}`}>
            <DocumentSelectionPanel
                documents={documents}
                isLoading={isLoading}
                error={error}
            />

            <ChatPanel />

            {isVisualizationPanelOpen && (
                <VisualizationPanel
                    onClose={handleCloseVisualization}
                    selectedDocuments={selectedDocuments}
                />
            )}

            {/* Enhanced debug panel */}
            {false && (
                <div style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    zIndex: 1000,
                    maxWidth: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div><strong>📊 Debug Info:</strong></div>
                    <div>Local Documents: {documents.length}</div>
                    <div>Global Selected: {selectedDocuments.length}</div>
                    <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                    <div>Error: {error ? 'Yes' : 'No'}</div>
                    <div>Viz Panel: {isVisualizationPanelOpen ? 'Open' : 'Closed'}</div>
                    {error && <div style={{ color: '#ff6b6b' }}>Error: {error}</div>}

                    {/* Control buttons */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleManualRefresh}
                            style={{
                                background: '#00aa44',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Refresh Docs
                        </button>
                        <button
                            onClick={handleClearChat}
                            style={{
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Clear Chat
                        </button>
                        <button
                            onClick={handleResetAll}
                            style={{
                                background: '#ff8800',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Reset All
                        </button>
                        <button
                            onClick={() => {
                                console.log('🐛 Manual debug dump:');
                                console.log('Documents:', documents);
                                console.log('Selected:', selectedDocuments);
                                console.log('Loading:', isLoading);
                                console.log('Error:', error);
                            }}
                            style={{
                                background: '#5b42f3',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Debug Log
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceChatPage;
