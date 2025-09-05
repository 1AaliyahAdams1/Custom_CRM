// src/utils/auth/useLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../../services/auth/authService";
import { fetchActiveAccountsByUser } from "../../services/accountService"; // ✅ existing service

export default function useLogin() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (identifier, password) => {
    setError("");
    try {
      // Call backend login
      const response = await loginService(identifier, password);

      console.log("=== Login Response Debug ===");
      console.log("Full response:", response);

      // Save token
      localStorage.setItem("token", response.token);

      // Fetch accounts owned by this user and extract only IDs
      let ownedAccountIds = [];
      try {
        const accounts = await fetchActiveAccountsByUser(response.user.UserID);
        ownedAccountIds = accounts.map(account => account.id); // ✅ map to IDs
        console.log("Owned account IDs:", ownedAccountIds);
      } catch (err) {
        console.error("Failed to fetch owned accounts:", err);
      }

      // Build user object for localStorage
      const userToStore = {
        ...response.user,
        roles: response.roles || [],
        RoleNames: Array.isArray(response.roles)
          ? response.roles.join(", ")
          : (response.roles || ""),
        ownedAccountIds, // ✅ store only IDs
      };

      console.log("Storing user data:", userToStore);

      // Save in localStorage
      localStorage.setItem("user", JSON.stringify(userToStore));

      // Trigger storage event so other components refresh
      window.dispatchEvent(new Event("storage"));

      // Redirect to dashboard
      //Changed to accounts for now
      window.location.href = "/accounts";

      return true;
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      setError("Invalid username/email or password.");
      return false;
    }
  };

  return { login, error, setError };
}
