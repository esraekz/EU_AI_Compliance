// src/components/InvoiceChatPage/ChatHistoryModal.tsx - Updated with Custom Confirmations

import React, { useEffect, useState } from 'react';
import { ChatSession, chatSessionsApi } from '../../services/api';
import ConfirmationModal from './ConfirmationModal'; // Import the custom confirmation modal

interface ChatHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadSession: (session: ChatSession) => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
    isOpen,
    onClose,
    onLoadSession
}) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent');

    // NEW: Confirmation modal for delete
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        sessionId: string;
        sessionTitle: string;
    }>({
        isOpen: false,
        sessionId: '',
        sessionTitle: ''
    });

    // Fetch sessions when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchSessions();
        }
    }, [isOpen]);

    const fetchSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('📡 Fetching chat sessions...');
            const response = await chatSessionsApi.getSessions(50, 0);
            console.log('📡 Sessions response:', response);

            if (response.status === 'success' && response.sessions) {
                console.log('✅ Sessions loaded:', response.sessions.length);
                setSessions(response.sessions);
            } else {
                console.log('❌ Failed to load sessions:', response);
                setError('Failed to load chat history');
            }
        } catch (err) {
            console.error('💥 Error fetching sessions:', err);
            setError('Failed to load chat history. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadSession = async (session: ChatSession) => {
        try {
            console.log('📖 Loading session:', session.id);
            // Get full session with messages
            const response = await chatSessionsApi.getSession(session.id);
            console.log('📖 Session details:', response);

            if (response.status === 'success' && response.session) {
                onLoadSession(response.session);
                onClose();
            } else {
                console.error('❌ Failed to load session details');
                // You could also replace this alert with a custom modal
                alert('Failed to load chat session details');
            }
        } catch (err) {
            console.error('💥 Error loading session:', err);
            // You could also replace this alert with a custom modal
            alert('Failed to load chat session');
        }
    };

    // NEW: Show delete confirmation instead of browser confirm
    const handleDeleteRequest = (sessionId: string, sessionTitle: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setDeleteConfirmation({
            isOpen: true,
            sessionId,
            sessionTitle
        });
    };

    // NEW: Actual delete function
    const handleConfirmDelete = async () => {
        try {
            console.log('🗑️ Deleting session:', deleteConfirmation.sessionId);
            await chatSessionsApi.deleteSession(deleteConfirmation.sessionId);
            console.log('✅ Session deleted');

            // Close confirmation modal
            setDeleteConfirmation({ isOpen: false, sessionId: '', sessionTitle: '' });

            // Refresh sessions list
            fetchSessions();
        } catch (err) {
            console.error('💥 Error deleting session:', err);
            // You could also replace this alert with a custom modal
            alert('Failed to delete session');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const filteredSessions = sessions.filter(session => {
        if (activeTab === 'recent') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(session.updated_at) > weekAgo;
        }
        return true;
    });

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        background: '#5b42f3',
                        color: 'white',
                        padding: '15px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                            📚 Chat History
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '18px',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e9ecef' }}>
                        <button
                            onClick={() => setActiveTab('recent')}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                background: activeTab === 'recent' ? 'white' : '#f8f9fa',
                                color: activeTab === 'recent' ? '#5b42f3' : '#666',
                                borderBottom: activeTab === 'recent' ? '2px solid #5b42f3' : 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: activeTab === 'recent' ? '600' : 'normal'
                            }}
                        >
                            Recent
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                background: activeTab === 'all' ? 'white' : '#f8f9fa',
                                color: activeTab === 'all' ? '#5b42f3' : '#666',
                                borderBottom: activeTab === 'all' ? '2px solid #5b42f3' : 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: activeTab === 'all' ? '600' : 'normal'
                            }}
                        >
                            All Time
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '20px',
                        maxHeight: '60vh',
                        overflowY: 'auto'
                    }}>
                        {isLoading && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                                Loading chat history...
                            </div>
                        )}

                        {error && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#e53935' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
                                {error}
                                <br />
                                <button
                                    onClick={fetchSessions}
                                    style={{
                                        marginTop: '15px',
                                        padding: '8px 16px',
                                        background: '#5b42f3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {!isLoading && !error && filteredSessions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                                <div style={{ fontSize: '16px', marginBottom: '8px' }}>No chat sessions found</div>
                                <div style={{ fontSize: '14px', color: '#999' }}>
                                    {activeTab === 'recent'
                                        ? 'No recent conversations. Try "All Time" or start a new chat.'
                                        : 'Start a conversation to see your chat history here'
                                    }
                                </div>
                            </div>
                        )}

                        {!isLoading && !error && filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => handleLoadSession(session)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: '#f9f9f9'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f0f0f7';
                                    e.currentTarget.style.borderColor = '#5b42f3';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f9f9f9';
                                    e.currentTarget.style.borderColor = '#e9ecef';
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: '600',
                                        marginBottom: '4px',
                                        fontSize: '14px'
                                    }}>
                                        {session.title || 'Untitled Chat'}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#666',
                                        marginBottom: '4px'
                                    }}>
                                        {session.message_count || 0} messages •
                                        {session.selected_documents?.length || 0} documents •
                                        {formatDate(session.updated_at)}
                                    </div>
                                    {session.selected_documents && session.selected_documents.length > 0 && (
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#999',
                                            fontStyle: 'italic'
                                        }}>
                                            Documents: {session.selected_documents.slice(0, 2).join(', ')}
                                            {session.selected_documents.length > 2 && '...'}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLoadSession(session);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#5b42f3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteRequest(session.id, session.title || 'Untitled Chat', e)}
                                        style={{
                                            padding: '6px 8px',
                                            background: 'none',
                                            color: '#e53935',
                                            border: '1px solid #e53935',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    {!isLoading && !error && sessions.length > 0 && (
                        <div style={{
                            padding: '15px 20px',
                            borderTop: '1px solid #e9ecef',
                            background: '#f8f9fa',
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#666'
                        }}>
                            Showing {filteredSessions.length} of {sessions.length} chat sessions
                            {activeTab === 'recent' && sessions.length > filteredSessions.length && (
                                <span> • Switch to "All Time" to see more</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* NEW: Custom Confirmation Modal for Delete */}
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                title="Delete Chat Session"
                message={`Are you sure you want to delete "${deleteConfirmation.sessionTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirmation({ isOpen: false, sessionId: '', sessionTitle: '' })}
            />
        </>
    );
};

export default ChatHistoryModal;
