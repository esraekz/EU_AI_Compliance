// Updated ChatPanel.tsx - With Custom Confirmation Modals

import React, { useEffect, useRef, useState } from 'react';
import { useGlobalChatState } from '../../hooks/useGlobalChatState';
import { ChatSession, qaApi } from '../../services/api';
import ChatHistoryModal from './ChatHistoryModal';
import styles from './ChatPanel.module.css';
import ConfirmationModal from './ConfirmationModal'; // NEW: Import custom modal

interface ChatPanelProps {
    visualizationPanelWidth?: number;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
    visualizationPanelWidth = 400
}) => {
    // Use global state with session management
    const {
        messages,
        selectedDocuments,
        isVisualizationPanelOpen,
        currentSessionId,
        addMessage,
        setVisualizationPanelOpen,
        clearMessages,
        resetPageState,
        setSelectedDocuments,
        createNewSession,
        loadSession
    } = useGlobalChatState();

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // NEW: Confirmation modal states
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        confirmColor: 'primary' | 'danger';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'OK',
        confirmColor: 'primary',
        onConfirm: () => { }
    });

    // Handle client-side hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Resize functionality for when visualization panel is open
    const [isResizing, setIsResizing] = useState(false);
    const chatPanelRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages are added
    const chatAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Helper function to show confirmation modal
    const showConfirmation = (
        title: string,
        message: string,
        onConfirm: () => void,
        confirmText: string = 'OK',
        confirmColor: 'primary' | 'danger' = 'primary'
    ) => {
        setConfirmationModal({
            isOpen: true,
            title,
            message,
            confirmText,
            confirmColor,
            onConfirm: () => {
                onConfirm();
                setConfirmationModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Chat management functions - UPDATED with custom modals
    const handleNewChat = async () => {
        showConfirmation(
            'Start New Chat',
            'This will clear current messages but keep selected documents. Are you sure?',
            () => {
                clearMessages();
                addMessage({
                    type: 'system',
                    text: '🆕 Started new chat session. Ask me anything about your selected documents!'
                });
            },
            'Start New',
            'primary'
        );
    };

    const handleClearAll = () => {
        showConfirmation(
            'Clear Everything',
            'This will reset all messages and document selections. This action cannot be undone.',
            () => {
                resetPageState();
                addMessage({
                    type: 'system',
                    text: '🧹 Everything has been cleared. Select documents and start a new conversation!'
                });
            },
            'Clear All',
            'danger'
        );
    };

    const handleShowHistory = () => {
        setIsHistoryModalOpen(true);
    };

    // Load session from history
    const handleLoadSession = (session: ChatSession & { messages?: any[] }) => {
        try {
            console.log('📖 Loading session:', session);

            // Convert messages to our format
            const formattedMessages = [];

            if (session.messages && session.messages.length > 0) {
                session.messages.forEach((msg: any) => {
                    formattedMessages.push({
                        id: Date.now() + Math.random(),
                        type: msg.type === 'user' ? 'user' : 'system',
                        text: msg.text || msg.content || 'Message content not available',
                        timestamp: msg.timestamp || Date.now()
                    });
                });
            }

            // Load the session using global state
            loadSession(
                session.id,
                formattedMessages,
                session.selected_documents || []
            );

            // Add confirmation message
            setTimeout(() => {
                addMessage({
                    type: 'system',
                    text: `✅ Loaded session: "${session.title}" with ${formattedMessages.length} messages and ${session.selected_documents?.length || 0} documents.`
                });
            }, 100);

            console.log('✅ Session loaded successfully');

        } catch (error) {
            console.error('❌ Error loading session:', error);
            addMessage({
                type: 'error',
                text: 'Failed to load chat session. Please try again.'
            });
        }
    };

    // Mouse events for resizing (only when visualization panel is open)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isVisualizationPanelOpen) return;
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !isVisualizationPanelOpen) return;
            // Resize logic can be implemented here if needed
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, isVisualizationPanelOpen]);

    // Quick questions for the bottom section
    const quickQuestions = [
        'Summarize documents',
        'Extract total amounts',
        'Find invoice dates',
        'Extract vendor details'
    ];

    // Send question to backend with automatic session creation
    const askQuestion = async (question: string) => {
        if (!question.trim() || isLoading) return;

        // Check if documents are selected
        if (!selectedDocuments || selectedDocuments.length === 0) {
            addMessage({
                type: 'error',
                text: 'Please select at least one document before asking questions.'
            });
            return;
        }

        // Add user message to chat
        addMessage({
            type: 'user',
            text: question
        });

        setInput('');
        setIsLoading(true);

        try {
            console.log('=== CHAT SESSION DEBUG ===');
            console.log('Current session ID:', currentSessionId);
            console.log('Question:', question);
            console.log('Selected documents:', selectedDocuments);

            // Create session if this is the first message (no current session)
            let sessionId = currentSessionId;
            if (!sessionId) {
                console.log('🆕 No current session, creating new one...');
                sessionId = await createNewSession(question);
                if (!sessionId) {
                    console.log('❌ Failed to create session, continuing without session');
                }
            }

            // Ensure we're sending an array of strings
            const documentIdsToSend = Array.isArray(selectedDocuments) && selectedDocuments.length > 0
                ? selectedDocuments.filter(id => id && typeof id === 'string')
                : undefined;

            console.log('📡 Sending to API:', {
                question,
                documentIds: documentIdsToSend,
                sessionId
            });

            // Send question to backend with session ID
            const response = await qaApi.askQuestion(question, documentIdsToSend, sessionId || undefined);

            console.log('📡 Response from backend:', response);

            // Add AI response to chat
            addMessage({
                type: 'system',
                text: response.answer || 'No answer was provided'
            });

            // If backend returned a session ID and we don't have one, use it
            if (response.session_id && !currentSessionId) {
                console.log('🔄 Backend returned session ID:', response.session_id);
            }

        } catch (err) {
            console.error('💥 Error asking question:', err);

            // Add error message to chat
            addMessage({
                type: 'error',
                text: `Sorry, I encountered an error while processing your question. Please try again. ${err instanceof Error ? err.message : ''}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenVisualization = () => {
        setVisualizationPanelOpen(true);
    };

    return (
        <>
            <div
                className={`${styles.chatPanel} ${isVisualizationPanelOpen ? styles.withVisualization : ''}`}
                ref={chatPanelRef}
            >
                {/* Header with chat management buttons */}
                <div className={styles.header}>
                    <h2>Invoice Assistant</h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Chat Management Buttons */}
                        <button
                            onClick={handleShowHistory}
                            style={{
                                background: 'none',
                                border: '1px solid #d0d0d0',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: '#5b42f3',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            title="Chat History"
                        >
                            📋 History
                        </button>

                        <button
                            onClick={handleNewChat}
                            style={{
                                background: '#5b42f3',
                                color: 'white',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            title="Start New Chat"
                        >
                            ➕ New Chat
                        </button>

                        <button
                            onClick={handleClearAll}
                            style={{
                                background: 'none',
                                border: '1px solid #e53935',
                                color: '#e53935',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            title="Clear Everything"
                        >
                            🗑️ Clear
                        </button>

                        {/* Visualization button */}
                        <button
                            className={`${styles.visualizeButton} ${isVisualizationPanelOpen ? styles.active : ''}`}
                            onClick={handleOpenVisualization}
                            title={isVisualizationPanelOpen ? "Visualization panel is open" : "Open visualization panel"}
                        >
                            📊
                        </button>
                    </div>
                </div>

                {/* Context indicator */}
                <div className={styles.contextIndicator}>
                    {selectedDocuments.length === 0 ? (
                        <span style={{ color: '#ff6b6b' }}>⚠️ No documents selected - Please select documents to analyze</span>
                    ) : selectedDocuments.length === 1 ? (
                        <span>🔍 Analyzing 1 selected document</span>
                    ) : (
                        <span>🔍 Analyzing {selectedDocuments.length} selected documents</span>
                    )}

                    {/* Session debug info */}
                    {currentSessionId && (
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                            Session: {currentSessionId.substring(0, 8)}...
                        </div>
                    )}
                </div>

                {/* Chat messages area */}
                <div className={styles.chatArea} ref={chatAreaRef}>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${styles.message} ${message.type === 'user'
                                ? styles.userMessage
                                : message.type === 'error'
                                    ? styles.errorMessage
                                    : styles.systemMessage
                                }`}
                        >
                            <p>{message.text}</p>
                            {message.timestamp && isClient && (
                                <small style={{
                                    opacity: 0.7,
                                    fontSize: '10px',
                                    display: 'block',
                                    marginTop: '4px'
                                }}>
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </small>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className={styles.loadingIndicator}>
                            <p>Thinking...</p>
                        </div>
                    )}
                </div>

                {/* Quick questions section */}
                <div className={styles.quickQuestions}>
                    <h3>Quick Questions</h3>
                    <div className={styles.questionPills}>
                        {quickQuestions.map((question, index) => (
                            <button
                                key={index}
                                className={styles.questionPill}
                                onClick={() => askQuestion(question)}
                                disabled={isLoading}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input area */}
                <div className={styles.inputArea}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Ask about your documents..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && askQuestion(input)}
                        disabled={isLoading}
                    />
                    <button
                        className={`${styles.sendButton} ${isLoading ? styles.disabledButton : ''}`}
                        onClick={() => askQuestion(input)}
                        disabled={isLoading}
                    >
                        →
                    </button>
                </div>

                {/* Resize handle */}
                {isVisualizationPanelOpen && (
                    <div
                        className={styles.resizeHandle}
                        onMouseDown={handleMouseDown}
                    />
                )}
            </div>

            {/* Chat History Modal */}
            <ChatHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                onLoadSession={handleLoadSession}
            />

            {/* NEW: Custom Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmText={confirmationModal.confirmText}
                confirmColor={confirmationModal.confirmColor}
                onConfirm={confirmationModal.onConfirm}
                onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
};

export default ChatPanel;
