import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Tabs, Tab, Alert, Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import ContactDetailsForm from "../../components/forms/ContactDetailsForm";
import DealDetailsForm from "../../components/forms/DealDetailsForm";
import ActivityDetailsForm from "../../components/forms/ActivityDetailsForm";
import NotesForm from "../../components/forms/NoteDetailsForm";
import AttachmentsForm from "../../components/forms/AttachmentDetailsForm";

import { getContactDetails, deactivateContact } from "../../services/contactService";

export default function ContactDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Deals", "Activities", "Notes", "Attachments"];

  const refreshContact = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getContactDetails(id);
      setContact(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load contact details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError("No contact ID provided");
      setLoading(false);
      return;
    }
    refreshContact();
  }, [id, refreshContact]);

  const handleTabChange = (_, newValue) => setActiveTab(newValue);
  const handleBack = () => navigate("/contacts");

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate this contact?")) return;
    try {
      await deactivateContact(id);
      setSuccessMessage("Contact deactivated successfully!");
      setTimeout(() => navigate("/contacts"), 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to deactivate contact");
    }
  };

  const renderTabContent = () => {
    if (!contact) return null;
    switch (tabs[activeTab]) {
      case "Deals":
        return <DealDetailsForm dealId={id} mainFields={[]} />;
      case "Activities":
        return <ActivityDetailsForm contactId={id} />;
      case "Notes":
        return (
          <NotesForm
            entityType="contact"
            entityId={contact.ContactID}
            onSaved={refreshContact}
          />
        );
      case "Attachments":
        return (
          <AttachmentsForm
            entityType="contact"
            entityId={contact.ContactID}
            onUploaded={refreshContact}
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <Typography>Loading contact details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!contact) return <Alert severity="warning">Contact not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
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
          Back to Contacts
        </Button>
      </Box>

      {/* Contact Panel */}
      <Card sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <ContactDetailsForm contactId={id} />
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
