import React, { useState, useEffect, useRef } from "react";
import styles from "./InvoiceAssistant.module.css";
import { qaApi } from "../../services/api"; // Import the QA API service

// Types
interface Message {
  id: number;
  type: "user" | "system" | "error";
  text: string;
}

interface InvoiceAssistantProps {
  // Optional prop to specify which document(s) to query
  documentIds?: string[];
}

const InvoiceAssistant: React.FC<InvoiceAssistantProps> = ({ documentIds }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "system",
      text: "I can help you extract key information from your document. Please let me know what specific details you're looking for.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for auto-scrolling to bottom of chat
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send question to backend API
  const askQuestion = async (question: string) => {
    setIsLoading(true);
    
    try {
      // Use the qaApi.askQuestion method from our API service
      const response = await qaApi.askQuestion(question, documentIds);
      
      // Add AI response to chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          type: "system",
          text: response.answer
        }
      ]);
      
    } catch (err) {
      console.error("Error asking question:", err);
      
      // Add error message to chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          type: "error",
          text: "Sorry, I encountered an error while processing your question. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      // Add user message to chat
      const userMessage: Message = { 
        id: messages.length + 1, 
        type: "user", 
        text: input 
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Clear input field
      const question = input.trim();
      setInput("");
      
      // Send to backend
      await askQuestion(question);
    }
  };

  return (
    <div className={styles.chatPage}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Invoice Assistant</h1>
        {documentIds && documentIds.length > 0 && (
          <div className={styles.contextIndicator}>
            Answering questions about {documentIds.length} selected document(s)
          </div>
        )}
      </header>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.type === "user" 
                ? styles.userMessage 
                : message.type === "error" 
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.input}
          placeholder="Ask about your document..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <button 
          className={`${styles.sendButton} ${isLoading ? styles.disabledButton : ''}`} 
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default InvoiceAssistant;