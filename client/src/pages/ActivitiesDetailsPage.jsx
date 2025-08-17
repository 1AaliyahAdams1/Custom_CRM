//ActivityDetailsPage.js

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

import { fetchActivityById } from "../services/activityService";

function ActivityDetailsPage() {
  const { id } = useParams(); // Get activity ID from route params
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null); // Holds activity details data
  const [loading, setLoading] = useState(true); // Loading state for spinner
  const [error, setError] = useState(null); // Error message

  // Fetch activity details on component mount or when id changes
  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchActivityById(id); // API call returns array or object
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
  const formatDate = (str) => (str ? new Date(str).toLocaleString() : "-");

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
            {activity.activity_name || "Activity Details"}
          </Typography>

          {/* Grid layout */}
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Tooltip title="Activity ID" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Activity ID:</strong> {activity.ActivityID || "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Name of the activity" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Activity Name:</strong>{" "}
                    {activity.activity_name || "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Type of activity" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Type:</strong> {activity.type || "-"}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Tooltip title="Activity date" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Date:</strong> {formatDate(activity.date)}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Record creation timestamp" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Created At:</strong>{" "}
                    {formatDate(activity.CreatedAt)}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Last update timestamp" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Updated At:</strong>{" "}
                    {formatDate(activity.UpdatedAt)}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ActivityDetailsPage;
