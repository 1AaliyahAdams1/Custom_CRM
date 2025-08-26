<<<<<<< HEAD
//PAGE : Activity Details
//Shows all details related to an individual activity

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
  Tooltip,
} from "@mui/material";


import { fetchActivityById } from "../../services/activityService"; // Make sure this function exists

function ActivitiesDetailsPage() {
  const { id } = useParams(); // Get activity ID from route params
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);  // Holds activity details data
  const [loading, setLoading] = useState(true);    // Loading state for spinner
  const [error, setError] = useState(null);        // Error message

  // Fetch activity details on component mount or when id changes
  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchActivityById(id);  // API call returns array or object
        const activity = Array.isArray(data) ? data[0] : data;
        if (!activity) throw new Error("Activity not found");
        setActivity(activity);
      } catch (err) {
        setError(err.message || "Failed to fetch activity details");
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, [id]);

  // Helper to format date/time string or show placeholder
  const formatDate = (str) =>
    str ? new Date(str).toLocaleString() : "-";

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!activity) return <Typography>No activity found.</Typography>;

  return (
    <Box p={4}>
      {/* Back button to go to previous page */}
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        &larr; Back to Activities
      </Button>

      {/* Activity Details Card */}
      <Card elevation={3}>
        <CardContent>
          {/* Title */}
          <Typography variant="h5" gutterBottom>
            {activity.TypeName || "Activity Details"}
          </Typography>

          {/* Grid layout */}
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Tooltip title="Associated Account" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Account:</strong> {activity.AccountName || "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Type of activity (e.g., Call, Meeting)" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Type:</strong> {activity.TypeName || "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Detailed description of the activity type" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Description:</strong> {activity.Description || "-"}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Tooltip title="Contact person involved in this activity" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Contact:</strong>{" "}
                    {activity.ContactID
                      ? `${activity.Title || ""} ${activity.first_name || ""} ${activity.middle_name || ""} ${activity.surname || ""}`.trim()
                      : "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Date and time when the activity occurred" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Date & Time:</strong> {formatDate(activity.Due_date)}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Record creation timestamp" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Created At:</strong> {formatDate(activity.CreatedAt)}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Last update timestamp" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Updated At:</strong> {formatDate(activity.UpdatedAt)}
                  </Typography>
                </Box>
              </Tooltip>

              {/* Attachments */}
              <Tooltip title="Files uploaded for this activity" placement="top">
                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Attachments
                  </Typography>
                  {activity.attachments?.length > 0 ? (
                    activity.attachments.map((att) => (
                      <Box key={att.AttachmentID} mb={1}>
                        <Typography variant="body2">{att.FileName}</Typography>
                        <Typography variant="caption">
                          Uploaded: {new Date(att.CreatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2">
                      No attachments available for this activity.
                    </Typography>
                  )}
                </Box>
              </Tooltip>

              {/* Notes */}
              <Tooltip title="Internal notes for this activity" placement="top">
                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Notes
                  </Typography>
                  {activity.notes?.length > 0 ? (
                    activity.notes.map((note) => (
                      <Box key={note.NoteID} mb={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {note.Content}
                        </Typography>
                        <Typography variant="caption">
                          Created: {new Date(note.CreatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2">
                      No notes available for this activity.
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ActivitiesDetailsPage;
=======
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
      setActivity(data?.data || data);
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
          <ActivityDetailsForm activityId={id} />
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
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
