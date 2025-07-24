//PAGE : Deals Details
//Shows all details related to an individual deal

//IMPORTS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Box,
} from "@mui/material";
import { getDealDetails } from "../services/dealService"; // API call to get deal details

function DealsDetailsPage() {
  const { id } = useParams();       // Get deal ID from URL params
  const navigate = useNavigate();   // Hook to programmatically navigate

  // State to hold deal data
  const [deal, setDeal] = useState(null);
  // Loading state for spinner
  const [loading, setLoading] = useState(true);
  // Error state for displaying fetch errors
  const [error, setError] = useState(null);

  // Helper function to format date strings into local date format, fallback "-"
  const formatDate = (str) => (str ? new Date(str).toLocaleDateString() : "-");

  useEffect(() => {
    async function fetchDeal() {
      setLoading(true);   // Show loading spinner
      setError(null);     // Clear previous errors
      try {
        const data = await getDealDetails(id);      // Fetch deal by ID
        const deal = Array.isArray(data) ? data[0] : data;  // Handle if data is array
        if (!deal) throw new Error("Deal not found");        // Throw if no deal
        setDeal(deal);                        // Save deal data to state
      } catch (err) {
        setError(err.message || "Failed to fetch deal details"); // Show error message
      } finally {
        setLoading(false);                    // Hide loading spinner
      }
    }
    fetchDeal();  // Fetch data on component mount or when id changes
  }, [id]);

  // Loading spinner
  if (loading) return <CircularProgress />;
  // Display error message if any
  if (error) return <Typography color="error">{error}</Typography>;
  // Show message if no deal found (edge case)
  if (!deal) return <Typography>No deal found.</Typography>;

  return (
    <Box p={4}>
      {/* Back button to navigate back to deals list */}
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        &larr; Back to Deals
      </Button>

      <Card elevation={3}>
        <CardContent>
          {/* Deal header */}
          <Typography variant="h5" gutterBottom>
            Deal #{deal.DealID}
          </Typography>

          {/* Deal details in two-column grid */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography><strong>Account:</strong> {deal.Account || "-"}</Typography>
              <Typography><strong>Deal Stage:</strong> {deal.StageName || "-"}</Typography>
              <Typography><strong>Progression:</strong> {deal.Progression ?? "-"}</Typography>
              <Typography><strong>Deal Name:</strong> {deal.DealName || "-"}</Typography>
              <Typography><strong>Value:</strong> {deal.Value ?? "-"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Close Date:</strong> {formatDate(deal.CloseDate)}</Typography>
              <Typography><strong>Created At:</strong> {formatDate(deal.CreatedAt)}</Typography>
              <Typography><strong>Updated At:</strong> {formatDate(deal.UpdatedAt)}</Typography>
            </Grid>
          </Grid>

          {/* Products section */}
          <Typography variant="h6" mt={4}>
            Products
          </Typography>

          {/* Conditional rendering of product(s) */}
          {deal.ProductName ? (
            <ul>
              {/* If ProductName is an array, map each product with its price */}
              {Array.isArray(deal.ProductName) ? (
                deal.ProductName.map((product, index) => (
                  <li key={index}>
                    {product} - Price at time: {deal.PriceAtTime && deal.PriceAtTime[index] ? deal.PriceAtTime[index] : "-"}
                  </li>
                ))
              ) : (
                // If single product, display directly
                <li>{deal.ProductName} - Price at time: {deal.PriceAtTime || "-"}</li>
              )}
            </ul>
          ) : (
            // No products found message
            <Typography>No products found for this deal.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default DealsDetailsPage;