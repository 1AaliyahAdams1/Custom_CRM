//PAGE : Main Deal Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";




import DealsTable from "../components/DealsTable";          // Table component to display deals list
import DealFormDialog from "../components/DealsFormDialog";  // Dialog component for add/edit form

import {
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal
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
      const data = await getAllDeals(); // Fetch all deals
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

 return (
    <Box p={4}>
      {/* Page title */}
      <Typography variant="h4" gutterBottom>
        Deals
      </Typography>

      {/* Show error alert if error exists */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Show success alert if success message exists */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Button to open create deal form */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenCreate}
        sx={{ mb: 2 }}
        disabled={loading}   // Disable button while loading
      >
        Add Deal
      </Button>

      {/* Show loading spinner or deals table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DealsTable
          deals={deals}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Dialog for creating or editing a deal */}
      <DealFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        deal={selectedDeal}
        onSubmit={handleSave}
      />
    </Box>
  );

};

export default DealsPage;
