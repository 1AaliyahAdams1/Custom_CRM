import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Tabs, Tab, Alert, Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import ActivityDetailsForm from "../../components/forms/ActivityDetailsForm";
import AccountDetailsForm from "../../components/forms/AccountDetailsForm";
import ContactDetailsForm from "../../components/forms/ContactDetailsForm";
import DealDetailsForm from "../../components/forms/DealDetailsForm";
import NotesForm from "../../components/forms/NoteDetailsForm";
import AttachmentsForm from "../../components/forms/AttachmentDetailsForm";

import { fetchActivityById, deactivateActivity } from "../../services/activityService";

export default function ActivitiesDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Accounts", "Contacts", "Deals", "Notes", "Attachments"];

  const refreshActivity = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchActivityById(parseInt(id, 10));
      
      // Handle data migration from old boolean Completed to new Status field
      let activityData = data?.data || data;
      if (activityData && !activityData.Status && typeof activityData.Completed === 'boolean') {
        // Migrate old boolean completed field to new status
        activityData.Status = activityData.Completed ? 'complete' : 'incomplete';
      }
      
      setActivity(activityData);
    } catch (err) {
      console.error(err);
      setError("Failed to load activity details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError("No activity ID provided");
      setLoading(false);
      return;
    }
    refreshActivity();
  }, [id, refreshActivity]);

  const handleBack = () => navigate("/activities");

  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  const renderTabContent = () => {
    if (!activity) return null;
    switch (tabs[activeTab]) {
      case "Accounts":
        return <AccountDetailsForm accountId={activity.AccountID} />;
      case "Contacts":
        return <ContactDetailsForm contactId={activity.ContactID} />;
      case "Deals":
        return <DealDetailsForm dealId={activity.DealID} mainFields={[]} />;
      case "Notes":
        return <NotesForm entityType="activity" entityId={activity.ActivityID} onSaved={refreshActivity} />;
      case "Attachments":
        return <AttachmentsForm entityType="activity" entityId={activity.ActivityID} onUploaded={refreshActivity} />;
      default:
        return null;
    }
  };

  if (loading) return <Typography>Loading activity details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!activity) return <Alert severity="warning">Activity not found.</Alert>;

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
          Back to Activities
        </Button>
      </Box>

      <Card sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <ActivityDetailsForm 
            activityId={id} 
            onActivityUpdate={refreshActivity}
            onSuccessMessage={setSuccessMessage}
            onError={setError}
          />
        </CardContent>
      </Card>

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

      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
    </Box>
  );
}