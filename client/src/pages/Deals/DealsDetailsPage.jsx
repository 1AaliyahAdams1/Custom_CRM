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
