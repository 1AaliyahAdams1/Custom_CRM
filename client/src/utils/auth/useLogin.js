import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../../services/auth/authService";

export default function useLogin() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (identifier, password) => {
    setError("");
    try {
      const response = await loginService(identifier, password);
      
      console.log("=== Login Response Debug ===");
      console.log("Full response:", response);
      console.log("Token:", response.token);
      console.log("User:", response.user);
      console.log("Roles:", response.roles);

      // Save token
      localStorage.setItem("token", response.token);
      
      // Store user with roles in multiple formats for compatibility
      const userToStore = {
        ...response.user,
        roles: response.roles || [], // Array format for AuthContext
        RoleNames: Array.isArray(response.roles) 
          ? response.roles.join(", ") // String format for backward compatibility
          : (response.roles || "")
      };
      
      console.log("Storing user data:", userToStore);
      localStorage.setItem("user", JSON.stringify(userToStore));

      // Verify what was stored
      console.log("Verification - stored user:", JSON.parse(localStorage.getItem("user")));
      console.log("Verification - stored token:", localStorage.getItem("token"));

      // Trigger storage event for Header component and other listeners
      window.dispatchEvent(new Event('storage'));

      console.log("Navigating to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      setError("Invalid username/email or password.");
      throw err;
    }
  };

  return { login, error, setError };
}