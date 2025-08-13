//PAGE : Main Activity Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";


import { useNavigate } from "react-router-dom";
import ActivitiesTable from "../components/ActivitiesTable";

import {
  getAllActivities,
  deactivateActivity,
} from "../services/activityService";

const ActivitiesPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch activities from backend API
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllActivities(true);
      setActivities(data);
    } catch (err) {
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load activities once when component mounts
  useEffect(() => {
    fetchActivities();
  }, []);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Navigate to create acctivity page
  const handleOpenCreate = () => {
    navigate("/activities/create");
  };
  // Handle edit action
  const handleEdit = (activity) => {
  navigate(`/activities/edit/${activity.ActivityID}`);
  };

  // Handle deleting an activity
  const handleDeactivate = async (id) => {
    // Confirm before deleting
    const confirmDelete = window.confirm("Are you sure you want to delete this activity?");
    if (!confirmDelete) return;

    setError(null);
    try {
      await deactivateActivity(id);
      setSuccessMessage("Activity deleted successfully.");
      await fetchActivities(); 
    } catch (err) {
      setError("Failed to delete activity. Please try again.");
    }
  };

  return (
    <Box p={4}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Activities
      </Typography>

      {/* Show error alert if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Show success alert if any */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Button to add a new activity */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenCreate}
        sx={{ mb: 2 }}
        disabled={loading}
      >
        Add Activity
      </Button>

      {/* Show loading spinner or the activities table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <ActivitiesTable
          activities={activities}
          loading={loading}
          onEdit={handleEdit} 
          onDelete={handleDeactivate}
        />
      )}
    </Box>
  );



};

export default ActivitiesPage;