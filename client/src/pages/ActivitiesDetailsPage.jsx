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


import { fetchActivityById } from "../services/activityService"; // Make sure this function exists

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