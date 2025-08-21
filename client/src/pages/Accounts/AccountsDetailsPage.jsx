import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Tabs, Tab, Alert, Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import AccountDetailsForm from "../../components/forms/AccountDetailsForm";
import ContactDetailsForm from "../../components/forms/ContactDetailsForm";
import ActivityDetailsForm from "../../components/forms/ActivityDetailsForm";
import DealDetailsForm from "../../components/forms/DealDetailsForm";
import NotesForm from "../../components/forms/NoteDetailsForm";
import AttachmentsForm from "../../components/forms/AttachmentDetailsForm";

import { fetchAccountById, deactivateAccount } from "../../services/accountService";

export default function AccountDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Contacts", "Deals", "Activities", "Notes", "Attachments"];

  const refreshAccount = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAccountById(parseInt(id, 10));
      setAccount(data?.data || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load account details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError("No account ID provided");
      setLoading(false);
      return;
    }
    refreshAccount();
  }, [id, refreshAccount]);

  const handleBack = () => navigate("/accounts");

  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  const renderTabContent = () => {
    if (!account) return null;
    switch (tabs[activeTab]) {
      case "Contacts":
        return <ContactDetailsForm accountId={id} />;
      case "Deals":
        return <DealDetailsForm dealId={id} mainFields={[]} />;
      case "Activities":
        return <ActivityDetailsForm accountId={id} />;
      case "Notes":
        return <NotesForm entityType="account" entityId={account.AccountID} onSaved={refreshAccount} />;
      case "Attachments":
        return <AttachmentsForm entityType="account" entityId={account.AccountID} onUploaded={refreshAccount} />;
      default:
        return null;
    }
  };

  if (loading) return <Typography>Loading account details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!account) return <Alert severity="warning">Account not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {/* Back Button */}
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
          Back to Accounts
        </Button>
      </Box>
      {/* Account Panel */}
      <Card sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <AccountDetailsForm accountId={id} />
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

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
    </Box>
  );
}
