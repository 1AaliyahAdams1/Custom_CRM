//PAGE : Main Accounts Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";


// Syncfusion component imports
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { MessageComponent } from "@syncfusion/ej2-react-notifications";

import AccountsTable from "../components/AccountsTable";
import AccountFormDialog from "../components/AccountsFormDialog";

import {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../services/accountService";

const AccountsPage = () => {
  // State for list of accounts fetched from backend
  const [accounts, setAccounts] = useState([]);
  // Loading indicator for data fetching or mutations
  const [loading, setLoading] = useState(false);
  // Controls whether the create/edit dialog is visible
  const [dialogOpen, setDialogOpen] = useState(false);
  // Holds the account data being edited, or null when creating new
  const [selectedAccount, setSelectedAccount] = useState(null);
  // Error message string (empty or null means no error)
  const [error, setError] = useState(null);
  // Success message shown after create/update/delete
  const [successMessage, setSuccessMessage] = useState("");

  // Function to fetch accounts data from backend API
  const fetchAccounts = async () => {
    setLoading(true);      // Start loading spinner
    setError(null);        // Clear any previous errors
    try {
      const data = await getAllAccounts();  // API call to get accounts
      console.log("Fetched accounts:", data);
      setAccounts(data);    // Save fetched data to state
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError("Failed to load accounts. Please try again.");  // Show error alert
    } finally {
      setLoading(false);    // Stop loading spinner
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

  // Open the dialog in "create" mode (no selected account)
  const handleOpenCreate = () => {
    setSelectedAccount(null);
    setDialogOpen(true);
  };

  // Open the dialog in "edit" mode with the selected account data
  const handleOpenEdit = (account) => {
    console.log("Opening edit dialog for:", account);
    setSelectedAccount(account);
    setDialogOpen(true);
  };

  // Delete an account after user confirmation, then refresh data
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this account?");
    if (!confirm) return; // Cancel delete if user says no

    setError(null);
    try {
      console.log("Deleting account with ID:", id);
      await deleteAccount(id);    // Call backend delete API
      setSuccessMessage("Account deleted successfully.");
      await fetchAccounts();      // Refresh accounts list after delete
    } catch (error) {
      console.error("Delete failed:", error);
      setError("Failed to delete account. Please try again.");
    }
  };

  // Handle form submission for both create and update operations
  const handleSave = async (accountData) => {
    setError(null);
    try {
      console.log("Saving account data:", accountData);

      if (accountData.AccountID) {
        // If AccountID exists, update the existing account
        await updateAccount(accountData.AccountID, accountData);
        setSuccessMessage("Account updated successfully.");
      } else {
        // Otherwise, create a new account
        await createAccount(accountData);
        setSuccessMessage("Account created successfully.");
      }

      setDialogOpen(false);  // Close the form dialog after success
      await fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      console.error("Save failed:", error);
      setError("Failed to save account. Please try again.");
    }
  };

  // Close the form dialog and clear selected account state
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAccount(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Title */}
      <h1 style={{ 
        fontSize: '2.125rem', 
        fontWeight: 400, 
        lineHeight: 1.235, 
        marginBottom: '16px',
        margin: '0 0 16px 0'
      }}>
        Accounts
      </h1>

      {/* Display error alert if any error */}
      {error && (
        <div style={{ marginBottom: '16px' }}>
          <MessageComponent 
            severity="Error" 
            showCloseIcon={true}
            closed={() => setError(null)}
          >
            {error}
          </MessageComponent>
        </div>
      )}

      {/* Display success alert on successful operation */}
      {successMessage && (
        <div style={{ marginBottom: '16px' }}>
          <MessageComponent 
            severity="Success" 
            showCloseIcon={true}
            closed={() => setSuccessMessage("")}
          >
            {successMessage}
          </MessageComponent>
        </div>
      )}

      {/* Button to add a new account */}
      <div style={{ marginBottom: '16px' }}>
        <ButtonComponent 
          isPrimary={true}
          onClick={handleOpenCreate}
          disabled={loading}  // Disable button while loading
        >
          Add Account
        </ButtonComponent>
      </div>

      {/* Show loading spinner or accounts table depending on loading state */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '32px' 
        }}>
          {/* Simple CSS loading spinner since CircularProgress needs a different approach */}
          <div className="loading-spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 2s linear infinite'
          }}></div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      ) : (
        <AccountsTable
          accounts={accounts}
          onEdit={handleOpenEdit}   // Edit button callback
          onDelete={handleDelete}    // Delete button callback
        />
      )}

      {/* Dialog for adding/editing an account */}
      <AccountFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        account={selectedAccount}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default AccountsPage;
