import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    let errors = {};
    if (!identifier.trim()) {
      errors.identifier = "Please enter your username or email.";
    } else if (
      identifier.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
    ) {
      errors.identifier = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      errors.password = "Please enter your password.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const response = await login(identifier, password);

      console.log("Logged in user:", response.user || response);
      localStorage.setItem("user", JSON.stringify(response.user || response));
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username/email or password.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#fff",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#111",
          padding: "40px",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          width: "350px",
          boxShadow: "0 0 25px rgba(255, 255, 255, 0.1)",
          animation: "fadeIn 0.8s ease",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            fontWeight: "bold",
            fontSize: "1.5rem",
            animation: "fadeInDown 0.8s ease",
          }}
        >
          Welcome to FM Entertainment CRM
        </h2>

        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
              marginBottom: "15px",
              animation: "fadeIn 0.4s ease",
            }}
          >
            {error}
          </p>
        )}

        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email or Username"
          style={{
            padding: "12px",
            marginBottom: "6px",
            borderRadius: "6px",
            border: "1px solid #555",
            backgroundColor: "#222",
            color: "#fff",
            outline: "none",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
          onFocus={(e) => (e.target.style.boxShadow = "0 0 8px #fff")}
          onBlur={(e) => (e.target.style.boxShadow = "none")}
          required
        />
        {fieldErrors.identifier && (
          <span
            style={{
              color: "red",
              fontSize: "0.85em",
              marginBottom: "10px",
              animation: "fadeIn 0.4s ease",
            }}
          >
            {fieldErrors.identifier}
          </span>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            padding: "12px",
            marginBottom: "6px",
            borderRadius: "6px",
            border: "1px solid #555",
            backgroundColor: "#222",
            color: "#fff",
            outline: "none",
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
          onFocus={(e) => (e.target.style.boxShadow = "0 0 8px #fff")}
          onBlur={(e) => (e.target.style.boxShadow = "none")}
          required
        />
        {fieldErrors.password && (
          <span
            style={{
              color: "red",
              fontSize: "0.85em",
              marginBottom: "10px",
              animation: "fadeIn 0.4s ease",
            }}
          >
            {fieldErrors.password}
          </span>
        )}

        <button
          type="submit"
          style={{
            backgroundColor: "#fff",
            color: "#000",
            padding: "12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            marginTop: "15px",
            fontWeight: "bold",
            transition: "background-color 0.3s, transform 0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#ccc";
            e.target.style.transform = "scale(1.03)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#fff";
            e.target.style.transform = "scale(1)";
          }}
        >
          Login
        </button>
      </form>

      {/* Keyframe animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};
