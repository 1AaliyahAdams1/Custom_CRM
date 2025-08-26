<<<<<<< HEAD
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
import { fetchDealById} from "../../services/dealService"; // API call to get deal details

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
=======
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Tabs, Tab, Alert, Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import DealDetailsForm from "../../components/forms/DealDetailsForm";
import AccountDetailsForm from "../../components/forms/AccountDetailsForm";
import ContactDetailsForm from "../../components/forms/ContactDetailsForm";
import ActivityDetailsForm from "../../components/forms/ActivityDetailsForm";
import NotesForm from "../../components/forms/NoteDetailsForm";
import AttachmentsForm from "../../components/forms/AttachmentDetailsForm";

import { fetchDealById } from "../../services/dealService";

export default function DealDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Accounts", "Contacts", "Activities", "Notes", "Attachments"];

  const refreshDeal = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDealById(parseInt(id, 10));
      setDeal(data?.data || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load deal details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError("No deal ID provided");
      setLoading(false);
      return;
    }
    refreshDeal();
  }, [id, refreshDeal]);

  const handleBack = () => navigate("/deals");
  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  const renderTabContent = () => {
    if (!deal) return null;
    switch (tabs[activeTab]) {
      case "Accounts":
        return (
          <AccountDetailsForm
            accountId={deal.AccountID}
            setFormData={(updatedAccount) => setDeal({ ...deal, Account: updatedAccount })}
          />
        );
      case "Contacts":
        return (
          <ContactDetailsForm
            contacts={deal.Contacts || []}
            setFormData={(updatedContacts) => setDeal({ ...deal, Contacts: updatedContacts })}
          />
        );
      case "Activities":
        return (
          <ActivityDetailsForm
            activities={deal.Activities || []}
            setFormData={(updatedActivities) => setDeal({ ...deal, Activities: updatedActivities })}
          />
        );
      case "Notes":
        return (
          <NotesForm
            entityType="deal"
            entityId={deal.DealID}
            onSaved={refreshDeal}
          />
        );
      case "Attachments":
        return (
          <AttachmentsForm
            entityType="deal"
            entityId={deal.DealID}
            onUploaded={refreshDeal}
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <Typography>Loading deal details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!deal) return <Alert severity="warning">Deal not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", display: "flex", flexDirection: "column", gap: 2 }}>

      {/* Back Button */}
      <Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{
            color: "#000",          // Text color
            borderColor: "#000",    // Border color
            "&:hover": {
              backgroundColor: "#000", // Black background on hover
              color: "#fff",           // White text on hover
              borderColor: "#000",
            },
          }}
        >
          Back to Deals
        </Button>
      </Box>

      {/* Deal Form */}
      <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
        <CardContent sx={{ p: 3 }}>
          <DealDetailsForm
            dealId={id}
            dealData={deal}
            setFormData={(updatedDeal) => setDeal({ ...deal, ...updatedDeal })}
          />
        </CardContent>
      </Card>

      {/* Related Tabs */}
      <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabs.map((tab, idx) => (
            <Tab key={idx} label={tab} />
          ))}
        </Tabs>
        <Box sx={{ p: 2 }}>{renderTabContent()}</Box>
      </Card>
    </Box>
  );
}
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
