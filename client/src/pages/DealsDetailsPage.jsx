//PAGE : Deal Details
//Shows all details related to an individual deal

//IMPORTS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Grid,
  CircularProgress,
  Button,
  Box,
  Paper,
  Alert,
  Divider,
  Chip,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Edit, Delete, ArrowBack } from "@mui/icons-material";
import { getDealById } from "../services/dealService"; // API call to get deal details
import theme from "../components/Theme";

function DealDetailsPage() {
  const { id } = useParams(); // Get deal ID from URL params
  const navigate = useNavigate(); // Hook to programmatically navigate

  // State to hold deal data
  const [deal, setDeal] = useState(null);
  // Loading state for spinner
  const [loading, setLoading] = useState(true);
  // Error state for displaying fetch errors
  const [error, setError] = useState(null);

  // Helper function to format date strings into local date format, fallback "-"
  const formatDate = (str) => (str ? new Date(str).toLocaleDateString() : "-");

  // Helper function to format currency value
  const formatCurrency = (value, symbol = "$") => {
    return value ? `${symbol}${Number(value).toLocaleString()}` : "-";
  };

  useEffect(() => {
    async function fetchDeal() {
      setLoading(true); // Show loading spinner
      setError(null); // Clear previous errors
      try {
        const response = await getDealById(id); // Fetch deal by ID
        const dealData = response.data || response; // Handle different response structures
        const deal = Array.isArray(dealData) ? dealData[0] : dealData; // Handle if data is array
        if (!deal) throw new Error("Deal not found"); // Throw if no deal
        setDeal(deal); // Save deal data to state
      } catch (err) {
        console.error("Failed to fetch deal:", err);
        setError(err.message || "Failed to fetch deal details"); // Show error message
      } finally {
        setLoading(false); // Hide loading spinner
      }
    }
    fetchDeal(); // Fetch data on component mount or when id changes
  }, [id]);

  // Handle edit navigation
  const handleEdit = () => {
    navigate(`/deals/${id}/edit`);
  };

  // Handle delete (placeholder)
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      // Implement delete functionality
      console.log("Delete deal:", id);
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: "100%",
            backgroundColor: "#fafafa",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 1000,
            mx: "auto",
            p: 4,
            border: "0px solid #e5e5e5",
            borderRadius: "8px",
          }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* No deal found */}
          {!deal && !loading && !error && (
            <Alert severity="info" sx={{ mb: 3 }}>
              No deal found.
            </Alert>
          )}

          {deal && (
            <>
              {/* Header with title and actions */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                  flexWrap: "wrap",
                  gap: 2,
                }}>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "#050505", fontWeight: 600 }}>
                    {deal.DealName || `Deal #${deal.DealID}`}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#666666", mt: 1 }}>
                    Deal ID: {deal.DealID}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/deals")}
                    sx={{
                      borderColor: "#e0e0e0",
                      color: "#666666",
                      "&:hover": { borderColor: "#050505", color: "#050505" },
                    }}>
                    Back to Deals
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    sx={{
                      borderColor: "#e0e0e0",
                      color: "#666666",
                      "&:hover": { borderColor: "#050505", color: "#050505" },
                    }}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={handleDelete}
                    sx={{
                      borderColor: "#e0e0e0",
                      color: "#d32f2f",
                      "&:hover": {
                        borderColor: "#d32f2f",
                        backgroundColor: "#ffeaea",
                      },
                    }}>
                    Delete
                  </Button>
                </Box>
              </Box>

              {/* Deal Information */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#050505", fontWeight: 600, mb: 2 }}>
                  Deal Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666666", mb: 0.5 }}>
                        Account
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#050505" }}>
                        {deal.AccountName || "-"}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666666", mb: 0.5 }}>
                        Deal Stage
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#050505" }}>
                        {deal.StageName || "-"}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666666", mb: 0.5 }}>
                        Value
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "#050505", fontWeight: 600 }}>
                        {formatCurrency(deal.Value, deal.Symbol)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666666", mb: 0.5 }}>
                        Probability
                      </Typography>
                      <Chip
                        label={`${deal.Probability || 0}%`}
                        size="small"
                        sx={{
                          backgroundColor:
                            deal.Probability >= 75
                              ? "#e8f5e8"
                              : deal.Probability >= 50
                              ? "#fff3cd"
                              : "#ffeaea",
                          color:
                            deal.Probability >= 75
                              ? "#2e7d2e"
                              : deal.Probability >= 50
                              ? "#856404"
                              : "#721c24",
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666666", mb: 0.5 }}>
                        Close Date
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#050505" }}>
                        {formatDate(deal.CloseDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666666", mb: 0.5 }}>
                        Created At
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#050505" }}>
                        {formatDate(deal.CreatedAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666666", mb: 0.5 }}>
                        Updated At
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#050505" }}>
                        {formatDate(deal.UpdatedAt)}
                      </Typography>
                    </Box>
                    {deal.Progression !== undefined && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "#666666", mb: 0.5 }}>
                          Progression
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#050505" }}>
                          {deal.Progression || "-"}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Products Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#050505", fontWeight: 600, mb: 2 }}>
                  Products
                </Typography>
                {deal.ProductName ? (
                  <Box sx={{ pl: 2 }}>
                    {Array.isArray(deal.ProductName) ? (
                      deal.ProductName.map((product, idx) => (
                        <Box key={idx} sx={{ mb: 1 }}>
                          <Typography variant="body1" sx={{ color: "#050505" }}>
                            • {product}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#666666", pl: 2 }}>
                            Price at time: {deal.PriceAtTime?.[idx] || "-"}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body1" sx={{ color: "#050505" }}>
                          • {deal.ProductName}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#666666", pl: 2 }}>
                          Price at time: {deal.PriceAtTime || "-"}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ color: "#666666", fontStyle: "italic" }}>
                    No products found for this deal.
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Attachments Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#050505", fontWeight: 600, mb: 2 }}>
                  Attachments
                </Typography>
                {deal.attachments?.length > 0 ? (
                  deal.attachments.map((att) => (
                    <Box
                      key={att.AttachmentID}
                      sx={{
                        mb: 2,
                        p: 2,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 1,
                      }}>
                      <Typography
                        variant="body1"
                        sx={{ color: "#050505", mb: 0.5 }}>
                        <a
                          href={att.FilePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#050505", textDecoration: "none" }}>
                          📎 {att.FileName}
                        </a>
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#666666" }}>
                        Uploaded: {new Date(att.UploadedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ color: "#666666", fontStyle: "italic" }}>
                    No attachments found for this deal.
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Notes Section */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: "#050505", fontWeight: 600, mb: 2 }}>
                  Notes
                </Typography>
                {deal.notes?.length > 0 ? (
                  deal.notes.map((note) => (
                    <Box
                      key={note.NoteID}
                      sx={{
                        mb: 2,
                        p: 2,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 1,
                      }}>
                      <Typography
                        variant="body1"
                        sx={{ color: "#050505", mb: 0.5 }}>
                        {note.Content}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#666666" }}>
                        Created: {new Date(note.CreatedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ color: "#666666", fontStyle: "italic" }}>
                    No notes found for this deal.
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default DealDetailsPage;
