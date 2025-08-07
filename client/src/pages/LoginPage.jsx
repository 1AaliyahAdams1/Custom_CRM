import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const response = await login(identifier, password);

    // Log user info here:
    console.log("Logged in user:", response.user || response);

    localStorage.setItem("user", JSON.stringify(response.user || response));
    navigate("/dashboard");
  } catch (err) {
    setError("Invalid username/email or password.");
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email or Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginPage;
