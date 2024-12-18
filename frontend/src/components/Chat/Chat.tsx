import React, { useState } from "react";
import styles from "./Chat.module.css";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: "user", text: "What information can you extract from the document?" },
    {
      id: 2,
      type: "system",
      text: "I can help you extract key information from your document. Please let me know what specific details you're looking for.",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: messages.length + 1, type: "user", text: input }]);
      setInput("");
    }
  };

  return (
    <div className={styles.chatPage}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Chat</h1>
      </header>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.type === "user" ? styles.userMessage : styles.systemMessage
            }`}
          >
            <p>{message.text}</p>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.input}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
