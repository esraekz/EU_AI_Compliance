// frontend/src/components/InvoiceChatPage/ChatPanel.tsx

import React, { useState } from 'react';
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
}

const ChatPanel: React.FC<ChatPanelProps> = ({
    selectedDocuments,
    isVisualizationPanelOpen,
    onOpenVisualization
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
            // *** IMPORTANT: Add debugging here ***
            console.log('=== FRONTEND DEBUG ===');
            console.log('Asking question:', question);
            console.log('Selected documents from props:', selectedDocuments);
            console.log('Selected documents type:', typeof selectedDocuments);
            console.log('Selected documents length:', selectedDocuments.length);

            // *** CRITICAL FIX: Make sure we're sending the correct data ***
            const documentIdsToSend = selectedDocuments && selectedDocuments.length > 0 ? selectedDocuments : undefined;

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
                text: 'Sorry, I encountered an error while processing your question. Please try again.'
            };

            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${styles.chatPanel} ${isVisualizationPanelOpen ? styles.narrow : ''}`}>
            <div className={styles.header}>
                <h2>Invoice Assistant</h2>

                {/* Visualization toggle button */}
                {!isVisualizationPanelOpen && (
                    <button
                        className={styles.visualizeButton}
                        onClick={onOpenVisualization}
                        title="Open visualization panel"
                    >
                        📊
                    </button>
                )}
            </div>

            <div className={styles.contextIndicator}>
                Analyzing {selectedDocuments.length} selected documents
                {/* Debug info */}
                <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                    IDs: {selectedDocuments.length > 0 ? selectedDocuments.join(', ') : 'None selected'}
                </div>
            </div>

            {/* Chat messages area */}
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

            {/* Quick questions section at bottom */}
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
        </div>
    );
};

export default ChatPanel;
