import React, { useState, useRef, useEffect } from "react";
import { sendMessageToAI, parseAIResponse } from "../services/chatService";
import { useTheme } from "@mui/material/styles";

export default function Chatbot({ userId = "guest" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastRequestType, setLastRequestType] = useState(null);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          sender: "bot", 
          text: "👋 Hi! I'm your AI CRM Assistant. I can help you with:\n\n• Managing your tasks and activities\n• Drafting emails\n• Finding contacts and accounts\n• Analyzing your pipeline\n• Providing business insights\n\nWhat can I help you with today?",
          type: "greeting"
        }
      ]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { sender: "user", text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Call enhanced API with full response
      const data = await sendMessageToAI(input, userId);
      const parsed = parseAIResponse(data);
      
      // Store request type for context
      setLastRequestType(parsed.type);

      // Create bot message with metadata
      const botMessage = {
        sender: "bot",
        text: parsed.text,
        type: parsed.type,
        metadata: {
          isEmailDraft: parsed.isEmailDraft,
          isTaskQuery: parsed.isTaskQuery,
          isInsights: parsed.isInsights,
          contextCounts: parsed.contextCounts
        }
      };

      setMessages([...newMessages, botMessage]);

      // Log context for debugging (optional)
      if (parsed.hasContext) {
        console.log("Context found:", parsed.contextCounts);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages, 
        { 
          sender: "bot", 
          text: "Sorry, I'm having trouble responding right now. Please try again.",
          type: "error"
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Add badge for special message types
  const getMessageBadge = (message) => {
    if (message.sender !== "bot" || !message.metadata) return null;
    
    if (message.metadata.isEmailDraft) {
      return <span style={{ 
        fontSize: 10, 
        background: theme.palette.success.main, 
        color: "white",
        padding: "2px 6px",
        borderRadius: 8,
        marginLeft: 6,
        fontWeight: "bold"
      }}>✉️ EMAIL DRAFT</span>;
    }
    
    if (message.metadata.isInsights) {
      return <span style={{ 
        fontSize: 10, 
        background: theme.palette.info.main, 
        color: "white",
        padding: "2px 6px",
        borderRadius: 8,
        marginLeft: 6,
        fontWeight: "bold"
      }}>📊 INSIGHTS</span>;
    }
    
    if (message.metadata.isTaskQuery) {
      return <span style={{ 
        fontSize: 10, 
        background: theme.palette.warning.main, 
        color: "white",
        padding: "2px 6px",
        borderRadius: 8,
        marginLeft: 6,
        fontWeight: "bold"
      }}>✓ TASKS</span>;
    }

    return null;
  };

  // Format message text with line breaks preserved
  const formatMessageText = (text) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (isMinimized) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: theme.palette.primary.main,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 9999,
          transition: "all 0.3s ease"
        }}
        onClick={() => setIsMinimized(false)}
      >
        <span style={{ fontSize: 24, color: theme.palette.primary.contrastText }}>💬</span>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      width: 350,
      height: 500,
      borderRadius: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      background: theme.palette.background.paper,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 9999,
      border: `1px solid ${theme.palette.divider}`,
      transition: "all 0.3s ease"
    }}>
      {/* Header */}
      <div style={{
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <div style={{ fontWeight: "bold" }}>AI Assistant</div>
            <div style={{ fontSize: 10, opacity: 0.9 }}>Enhanced CRM Helper</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: "transparent",
              border: "none",
              color: theme.palette.primary.contrastText,
              cursor: "pointer",
              fontSize: 20,
              padding: 4
            }}
            title="Minimize"
          >
            −
          </button>
          <button
            onClick={() => setMessages([{
              sender: "bot",
              text: "👋 Chat cleared! How can I help you?",
              type: "greeting"
            }])}
            style={{
              background: "transparent",
              border: "none",
              color: theme.palette.primary.contrastText,
              cursor: "pointer",
              fontSize: 16,
              padding: 4
            }}
            title="Clear chat"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: 16,
        overflowY: "auto",
        background: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
              animation: "slideIn 0.3s ease"
            }}
          >
            <div style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "75%",
              gap: 4
            }}>
              {/* Message badge (for bot messages with metadata) */}
              {m.sender === "bot" && getMessageBadge(m)}
              
              {/* Message bubble */}
              <div style={{
                background: m.sender === "user" ? theme.palette.primary.main : theme.palette.background.paper,
                color: m.sender === "user" ? theme.palette.primary.contrastText : theme.palette.text.primary,
                padding: "10px 14px",
                borderRadius: m.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                wordBreak: "break-word",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: m.sender === "bot" ? `1px solid ${theme.palette.divider}` : "none",
                fontSize: 14,
                lineHeight: 1.5
              }}>
                {formatMessageText(m.text)}
              </div>

              {/* Context info (optional, for debugging) */}
              {m.sender === "bot" && m.metadata && m.metadata.contextCounts && (
                Object.values(m.metadata.contextCounts).some(count => count > 0) && (
                  <div style={{
                    fontSize: 10,
                    color: theme.palette.text.secondary,
                    paddingLeft: 8
                  }}>
                    {m.metadata.contextCounts.tasks > 0 && `${m.metadata.contextCounts.tasks} tasks • `}
                    {m.metadata.contextCounts.deals > 0 && `${m.metadata.contextCounts.deals} deals • `}
                    {m.metadata.contextCounts.accounts > 0 && `${m.metadata.contextCounts.accounts} accounts • `}
                    {m.metadata.contextCounts.contacts > 0 && `${m.metadata.contextCounts.contacts} contacts`}
                  </div>
                )
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{
            display: "flex",
            justifyContent: "flex-start"
          }}>
            <div style={{
              background: theme.palette.background.paper,
              padding: "10px 14px",
              borderRadius: "16px 16px 16px 4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              gap: 4,
              alignItems: "center"
            }}>
              <div className="typing-dot" style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: theme.palette.text.secondary,
                animation: "typing 1.4s infinite"
              }} />
              <div className="typing-dot" style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: theme.palette.text.secondary,
                animation: "typing 1.4s infinite 0.2s"
              }} />
              <div className="typing-dot" style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: theme.palette.text.secondary,
                animation: "typing 1.4s infinite 0.4s"
              }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex",
        padding: 12,
        borderTop: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        gap: 8
      }}>
        <input
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 20,
            border: `1px solid ${theme.palette.divider}`,
            outline: "none",
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            fontSize: 14,
            transition: "border 0.2s ease"
          }}
          placeholder="Ask about tasks, deals, contacts..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={isTyping}
          onFocus={(e) => e.target.style.borderColor = theme.palette.primary.main}
          onBlur={(e) => e.target.style.borderColor = theme.palette.divider}
        />
        <button
          style={{
            padding: "10px 16px",
            borderRadius: 20,
            border: "none",
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            cursor: isTyping ? "not-allowed" : "pointer",
            fontSize: 16,
            transition: "all 0.2s ease",
            opacity: isTyping ? 0.6 : 1
          }}
          onClick={sendMessage}
          disabled={isTyping}
        >
          ➤
        </button>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}