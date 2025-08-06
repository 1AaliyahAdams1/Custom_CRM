//PAGE : Main Deal Page
//Combines the UI components onto one page

//IMPORTS
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";

import DealsTable from "../components/DealsTable";          

import {
  getAllDeals,
  deactivateDeal,
} from "../services/dealService";

const DealsPage = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch deals from backend API
  const fetchDeals = async () => {
    setLoading(true);    
    setError(null);      
    try {
      const data = await getAllDeals(true);
      setDeals(data);     
    } catch (err) {
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false); 
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

  // Navigate to create deal page
  const handleOpenCreate = () => {
    navigate("/deals/create");
  };
  // Handle edit action
  const handleEdit = (deal) => {
  navigate(`/deals/edit/${deal.DealID}`);
  };

  // Delete a deal after user confirmation and refresh list
  const handleDeactivate = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this deal?");
    if (!confirmDelete) return; // Abort if user cancels

    setError(null);
    try {
      await deactivateDeal(id);        // Call API to delete deal
      setSuccessMessage("Deal deleted successfully."); // Show success feedback
      await fetchDeals();          // Refresh deals list
    } catch (err) {
      setError("Failed to delete deal. Please try again."); // Show error on failure
    }
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
              disabled={loading} // Disable while loading
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
          loading={loading}
          onEdit={handleEdit} 
          onDelete={handleDeactivate}
        />
      )}

    </Box>
  );

};

export default DealsPage;
