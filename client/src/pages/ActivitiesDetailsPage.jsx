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


import { getActivityDetails } from "../services/activityService"; // Make sure this function exists

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
        const data = await getActivityDetails(id);  // API call returns array or object
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

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Activity #{activity.ActivityID}
          </Typography>

          <Grid container spacing={2}>

            {/* Left column with main activity info */}
            <Grid item xs={6}>
              <Tooltip title="Associated Account">
                <Typography><strong>Account:</strong> {activity.AccountName || "-"}</Typography>
              </Tooltip>

              <Tooltip title="Type of activity (e.g., Call, Meeting)">
                <Typography><strong>Type:</strong> {activity.TypeName || "-"}</Typography>
              </Tooltip>

              <Tooltip title="Detailed description of the activity type">
                <Typography><strong>Description:</strong> {activity.TypeDescription || "-"}</Typography>
              </Tooltip>

              <Tooltip title="Kind of interaction performed">
                <Typography><strong>Interaction:</strong> {activity.InteractionType || "-"}</Typography>
              </Tooltip>
            </Grid>

            {/* Right column with contact and timestamps */}
            <Grid item xs={6}>
              <Tooltip title="Contact person involved in this activity">
                <Typography><strong>Contact:</strong> {activity.Contact || "-"}</Typography>
              </Tooltip>

              <Tooltip title="Date and time when the activity occurred">
                <Typography><strong>Date & Time:</strong> {formatDate(activity.DateTime)}</Typography>
              </Tooltip>

              <Tooltip title="Record creation timestamp">
                <Typography><strong>Created At:</strong> {formatDate(activity.CreatedAt)}</Typography>
              </Tooltip>

              <Tooltip title="Last update timestamp">
                <Typography><strong>Updated At:</strong> {formatDate(activity.UpdatedAt)}</Typography>
              </Tooltip>
            </Grid>

          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ActivitiesDetailsPage;