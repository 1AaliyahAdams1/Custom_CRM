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
import { fetchDealById, getDealDetails } from "../services/dealService"; // API call to get deal details

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
        const data = await fetchDealById(id);      // Fetch deal by ID
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
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        ← Back to Deals
      </Button>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Deal #{deal.DealID}
          </Typography>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Account:</strong> {deal.AccountName || "-"}</Typography>
              <Typography><strong>Deal Stage:</strong> {deal.StageName || "-"}</Typography>
              <Typography><strong>Progression:</strong> {deal.Progression ?? "-"}</Typography>
              <Typography><strong>Deal Name:</strong> {deal.DealName || "-"}</Typography>
              <Typography><strong>Value:</strong> {deal.Value ?? "-"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Close Date:</strong> {formatDate(deal.CloseDate)}</Typography>
              <Typography><strong>Created At:</strong> {formatDate(deal.CreatedAt)}</Typography>
              <Typography><strong>Updated At:</strong> {formatDate(deal.UpdatedAt)}</Typography>
            </Grid>
          </Grid>

          {/* Products Section */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Products</Typography>
            {deal.ProductName ? (
              <ul style={{ paddingLeft: 20 }}>
                {Array.isArray(deal.ProductName) ? (
                  deal.ProductName.map((product, idx) => (
                    <li key={idx}>
                      {product} — Price at time: {deal.PriceAtTime?.[idx] ?? "-"}
                    </li>
                  ))
                ) : (
                  <li>
                    {deal.ProductName} — Price at time: {deal.PriceAtTime ?? "-"}
                  </li>
                )}
              </ul>
            ) : (
              <Typography>No products found for this deal.</Typography>
            )}
          </Box>

          {/* Attachments Section */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Attachments</Typography>
            {deal.attachments?.length > 0 ? (
              deal.attachments.map((att) => (
                <Box key={att.AttachmentID} mb={1}>
                  <Typography>
                    <strong>File:</strong>{" "}
                    <a href={att.FilePath} target="_blank" rel="noopener noreferrer">
                      {att.FileName}
                    </a>
                  </Typography>
                  <Typography variant="body2">
                    Uploaded: {new Date(att.UploadedAt).toLocaleString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No attachments found for this deal.</Typography>
            )}
          </Box>

          {/* Notes Section */}
          <Box>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            {deal.notes?.length > 0 ? (
              deal.notes.map((note) => (
                <Box key={note.NoteID} mb={1}>
                  <Typography><strong>Note:</strong> {note.Content}</Typography>
                  <Typography variant="body2">
                    Created: {new Date(note.CreatedAt).toLocaleString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No notes found for this deal.</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DealsDetailsPage;