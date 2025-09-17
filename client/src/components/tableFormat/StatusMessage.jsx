import React, { useEffect } from "react";

const StatusMessage = ({ message, severity = "success", onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`status-message ${severity}`}
      style={{
        padding: "12px 20px",
        borderRadius: "8px",
        color: "#fff",
        backgroundColor:
          severity === "success"
            ? "#4caf50"
            : severity === "error"
            ? "#f44336"
            : "#2196f3",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        width: "100%", // take full width of container
        marginBottom: "16px", // spacing below
      }}
    >
      {message}
      <button
        onClick={onClose}
        style={{
          marginLeft: "12px",
          background: "transparent",
          border: "none",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
};

export default StatusMessage;
