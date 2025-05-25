// Simplified ChatPanel.tsx - Direct Layout (no mainContent wrapper)

import React, { useEffect, useRef, useState } from 'react';
import { qaApi } from '../../services/api';
import styles from './ChatPanel.module.css';

interface Message {
    id: number;
    type: 'user' | 'system' | 'error';
    text: string;
}

interface ChatPanelProps {
    selectedDocuments: string[];
    isVisualizationPanelOpen: boolean;
    onOpenVisualization: () => void;
    visualizationPanelWidth?: number;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
    selectedDocuments,
    isVisualizationPanelOpen,
    onOpenVisualization,
    visualizationPanelWidth = 400
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: 'system',
            text: 'I can help you analyze your documents. What would you like to know?'
        }
    ]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Resize functionality for when visualization panel is open
    const [isResizing, setIsResizing] = useState(false);
    const chatPanelRef = useRef<HTMLDivElement>(null);

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
    }, [isResizing, isVisualizationPanelOpen]);

    // Quick questions for the bottom section
    const quickQuestions = [
        'Summarize documents',
        'Extract total amounts',
        'Find invoice dates',
        'Extract vendor details'
    ];

    // Send question to backend with selected document IDs
    const askQuestion = async (question: string) => {
        if (!question.trim() || isLoading) return;

        // Check if documents are selected
        if (!selectedDocuments || selectedDocuments.length === 0) {
            const errorMessage: Message = {
                id: Date.now(),
                type: 'error',
                text: 'Please select at least one document before asking questions.'
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
            return;
        }

        // Add user message to chat
        const userMessage: Message = {
            id: Date.now(),
            type: 'user',
            text: question
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            console.log('=== FRONTEND DEBUG ===');
            console.log('Asking question:', question);
            console.log('Selected documents from props:', selectedDocuments);
            console.log('Selected documents length:', selectedDocuments?.length || 0);

            // Ensure we're sending an array of strings
            const documentIdsToSend = Array.isArray(selectedDocuments) && selectedDocuments.length > 0
                ? selectedDocuments.filter(id => id && typeof id === 'string')
                : undefined;

            console.log('Document IDs being sent to API:', documentIdsToSend);

            // Send selected document IDs to backend
            const response = await qaApi.askQuestion(question, documentIdsToSend);

            console.log('Response from backend:', response);

            // Add AI response to chat
            const aiMessage: Message = {
                id: Date.now() + 1,
                type: 'system',
                text: response.answer || 'No answer was provided'
            };

            setMessages(prevMessages => [...prevMessages, aiMessage]);
        } catch (err) {
            console.error('Error asking question:', err);

            // Add error message to chat
            const errorMessage: Message = {
                id: Date.now() + 1,
                type: 'error',
                text: `Sorry, I encountered an error while processing your question. Please try again. ${err instanceof Error ? err.message : ''}`
            };

            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`${styles.chatPanel} ${isVisualizationPanelOpen ? styles.withVisualization : ''}`}
            ref={chatPanelRef}
        >
            {/* Header - Fixed at top */}
            <div className={styles.header}>
                <h2>Invoice Assistant</h2>
                <button
                    className={`${styles.visualizeButton} ${isVisualizationPanelOpen ? styles.active : ''}`}
                    onClick={onOpenVisualization}
                    title={isVisualizationPanelOpen ? "Visualization panel is open" : "Open visualization panel"}
                >
                    📊
                </button>
            </div>

            {/* Context indicator - Fixed below header */}
            <div className={styles.contextIndicator}>
                {selectedDocuments.length === 0 ? (
                    <span style={{ color: '#ff6b6b' }}>⚠️ No documents selected - Please select documents to analyze</span>
                ) : selectedDocuments.length === 1 ? (
                    <span>🔍 Analyzing 1 selected document</span>
                ) : (
                    <span>🔍 Analyzing {selectedDocuments.length} selected documents</span>
                )}

                {/* Debug info - you can remove this later */}
                <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                    IDs: {selectedDocuments.length > 0 ? selectedDocuments.join(', ') : 'None selected'}
                </div>
            </div>

            {/* Chat messages area - Scrollable middle section */}
            <div className={styles.chatArea}>
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
                    </div>
                ))}

                {isLoading && (
                    <div className={styles.loadingIndicator}>
                        <p>Thinking...</p>
                    </div>
                )}
            </div>

            {/* Quick questions section - Fixed above input */}
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

            {/* Input area - Fixed at bottom */}
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

            {/* Resize handle (only visible when visualization panel is open) */}
            {isVisualizationPanelOpen && (
                <div
                    className={styles.resizeHandle}
                    onMouseDown={handleMouseDown}
                />
            )}
        </div>
    );
};

export default ChatPanel;
