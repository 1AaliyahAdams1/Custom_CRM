//PAGE : Main Accounts Page
//Combines the UI components onto one page

//IMPORTS
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";


import AccountsTable from "../components/AccountsTable";

import {
  getAllAccounts,
  deactivateAccount,
} from "../services/accountService";

const AccountsPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Function to fetch accounts data from backend API
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllAccounts();
      console.log("Fetched accounts:", response.data);
      setAccounts(response.data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounts once when component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Cleanup timer if component unmounts or successMessage changes
      return () => clearTimeout(timer);
    }
  }, [successMessage]);


  // Navigate to create account page
  const handleOpenCreate = () => {
    navigate("/accounts/create");
  };



  // Deactivates an account 
  const handleDeactivate = async (id) => {
  const confirm = window.confirm("Are you sure you want to delete this account? This will deactivate it.");
  if (!confirm) return;

  setError(null);
  try {
    console.log("Deactivating (soft deleting) account with ID:", id);
    await deactivateAccount(id);
    setSuccessMessage("Account deleted successfully.");  // message visible to user
    await fetchAccounts();
  } catch (error) {
    console.log("Deactivating (soft deleting) account with ID:", id);
    console.error("Delete failed:", error);
    setError("Failed to delete account. Please try again.");
  }
};

  return (
    <Box p={4}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Accounts
      </Typography>

      {/* Display error alert if any error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Display success alert on successful operation */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Button to add a new account */} 
      <Button
         variant="contained"
         color="primary"
        onClick={handleOpenCreate}
        sx={{ mb: 2 }}
        disabled={loading}
      >
        Add Account
    </Button>

      {/* Show loading spinner or accounts table depending on loading state */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <AccountsTable
          accounts={accounts}
          onDeactivate={handleDeactivate}    
        />
      )}


    </Box>
  );


};

export default AccountsPage;
