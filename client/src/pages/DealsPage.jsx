//PAGE : Main Deal Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";


// Syncfusion component imports
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { MessageComponent } from "@syncfusion/ej2-react-notifications";

import DealsTable from "../components/DealsTable";          // Table component to display deals list
import DealFormDialog from "../components/DealsFormDialog";  // Dialog component for add/edit form

import {
  getDeals,       // Fetch all deals API service
  createDeal,     // Create new deal API service
  updateDeal,     // Update existing deal API service
  deleteDeal,     // Delete deal API service
} from "../services/dealService";

const DealsPage = () => {
  // State to store list of deals
  const [deals, setDeals] = useState([]);
  // Loading state to show spinner during API calls
  const [loading, setLoading] = useState(false);
  // Controls visibility of the form dialog (create/edit)
  const [dialogOpen, setDialogOpen] = useState(false);
  // Currently selected deal for editing; null means create mode
  const [selectedDeal, setSelectedDeal] = useState(null);
  // Error message state to display errors
  const [error, setError] = useState(null);
  // Success message state for user feedback
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch deals from backend API
  const fetchDeals = async () => {
    setLoading(true);    // Show loading spinner
    setError(null);      // Clear previous errors
    try {
      const data = await getDeals(); // Fetch all deals
      setDeals(data);     // Save deals to state
    } catch (err) {
      setError("Failed to load deals. Please try again."); // Show error if fetch fails
    } finally {
      setLoading(false);  // Hide loading spinner
    }
  };

  // Fetch deals once on component mount
  useEffect(() => {
    fetchDeals();
  }, []);

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer); // Cleanup timeout if component unmounts or message changes
    }
  }, [successMessage]);

  // Open form dialog for creating a new deal
  const handleOpenCreate = () => {
    setSelectedDeal(null); // Clear selected deal (create mode)
    setError(null);        // Clear errors
    setDialogOpen(true);   // Show dialog
  };

  // Open form dialog for editing an existing deal
  const handleOpenEdit = (deal) => {
    setSelectedDeal(deal); // Set selected deal for editing
    setError(null);        // Clear errors
    setDialogOpen(true);   // Show dialog
  };

  // Delete a deal after user confirmation and refresh list
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this deal?");
    if (!confirmDelete) return; // Abort if user cancels

    setError(null);
    try {
      await deleteDeal(id);        // Call API to delete deal
      setSuccessMessage("Deal deleted successfully."); // Show success feedback
      await fetchDeals();          // Refresh deals list
    } catch (err) {
      setError("Failed to delete deal. Please try again."); // Show error on failure
    }
  };

  // Save new or updated deal and refresh list
  const handleSave = async (dealData) => {
    setError(null);
    try {
      if (dealData.DealID) {
        // Update existing deal
        await updateDeal(dealData.DealID, dealData);
        setSuccessMessage("Deal updated successfully.");
      } else {
        // Create new deal
        await createDeal(dealData);
        setSuccessMessage("Deal created successfully.");
      }
      setDialogOpen(false);  // Close form dialog
      await fetchDeals();    // Refresh deals list
    } catch (err) {
      setError("Failed to save deal. Please try again."); // Show error on failure
    }
  };

  // Close the form dialog and reset selected deal
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDeal(null);
  };

  // Render the DealsPage component
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
        Deals
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

      {/* Button to add a new deal */}
      <div style={{ marginBottom: '16px' }}>
        <ButtonComponent 
          isPrimary={true}
          onClick={handleOpenCreate}
          disabled={loading}  // Disable button while loading
        >
          Add Deal
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
        <DealsTable
          deals={deals}
          onEdit={handleOpenEdit}   // Edit button callback
          onDelete={handleDelete}    // Delete button callback
        />
      )}

      {/* Dialog for adding/editing a deal */}
      <DealFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        deal={selectedDeal}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default DealsPage;
