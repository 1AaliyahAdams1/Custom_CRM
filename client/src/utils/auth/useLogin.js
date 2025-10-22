// src/utils/auth/useLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../../services/auth/authService";
import { fetchActiveAccountsByUser } from "../../services/accountService";

export default function useLogin() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (identifier, password) => {
    setError("");
    try {
      // Call backend login
      const response = await loginService(identifier, password);

      // Fetch accounts owned by this user and extract only IDs
      let ownedAccountIds = [];
      try {
        const accounts = await fetchActiveAccountsByUser(response.user.UserID);
        ownedAccountIds = accounts.map(account => account.id);
        console.log("Owned account IDs:", ownedAccountIds);
      } catch (err) {
        console.error("Failed to fetch owned accounts:", err);
      }

      // Build user object for localStorage
      const userToStore = {
        ...response.user,
        token: response.token,
        roles: Array.isArray(response.roles) ? response.roles : [], // always array
        RoleNames: Array.isArray(response.roles) ? response.roles.join(", ") : "",
        ownedAccountIds,
      };

      // Save in localStorage
      localStorage.setItem("token", response.token); // always save token
      localStorage.setItem("user", JSON.stringify(userToStore));

      // Trigger storage event so other components refresh
      window.dispatchEvent(new Event("storage"));

      // Redirect based on role - ALL roles now go to dashboard
      // Sales Reps see Activities chart, Management sees other charts
      window.location.href = "/dashboard";

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
