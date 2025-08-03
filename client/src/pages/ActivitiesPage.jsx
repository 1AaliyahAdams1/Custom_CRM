//PAGE : Main Activity Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";


import { useNavigate } from "react-router-dom";
import ActivitiesTable from "../components/ActivitiesTable";
// import ActivityFormDialog from "../components/ActivitiesFormDialog";

import {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../services/activityService";

const ActivitiesPage = () => {
  const navigate = useNavigate();
  // State to hold activities data
  const [activities, setActivities] = useState([]);
  // Loading spinner state
  const [loading, setLoading] = useState(false);
  // Controls visibility of the create/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  // Stores currently selected activity for editing
  const [selectedActivity, setSelectedActivity] = useState(null);
  // Stores any error messages for display
  const [error, setError] = useState(null);
  // Stores success messages for user feedback
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch activities from backend API
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllActivities();
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

  // // Open dialog for creating a new activity
  // const handleOpenCreate = () => {
  //   setSelectedActivity(null); // clear any selected activity
  //   setError(null);
  //   setDialogOpen(true);
  // };
  // Navigate to create acctivity page
  const handleOpenCreate = () => {
    navigate("/activities/create");
  };


  // Open dialog for editing an existing activity
  const handleOpenEdit = (activity) => {
    setSelectedActivity(activity); // set selected activity to edit
    setError(null);
    setDialogOpen(true);
  };

  // Handle deleting an activity
  const handleDelete = async (id) => {
    // Confirm before deleting
    const confirmDelete = window.confirm("Are you sure you want to delete this activity?");
    if (!confirmDelete) return;

    setError(null);
    try {
      await deleteActivity(id);
      setSuccessMessage("Activity deleted successfully.");
      await fetchActivities(); // refresh list after deletion
    } catch (err) {
      setError("Failed to delete activity. Please try again.");
    }
  };

  // Handle saving (creating or updating) an activity
  const handleSave = async (activityData) => {
    setError(null);
    try {
      if (activityData.ActivityID) {
        // Update existing
        await updateActivity(activityData.ActivityID, activityData);
        setSuccessMessage("Activity updated successfully.");
      } else {
        // Create new
        await createActivity(activityData);
        setSuccessMessage("Activity created successfully.");
      }
      setDialogOpen(false);
      await fetchActivities(); // refresh list
    } catch (err) {
      setError("Failed to save activity. Please try again.");
    }
  };

  // // Close the dialog and clear selected activity
  // const handleCloseDialog = () => {
  //   setDialogOpen(false);
  //   setSelectedActivity(null);
  // };

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
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Dialog for creating/editing activity
      <ActivityFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        activity={selectedActivity}
        onSubmit={handleSave}
      /> */}
    </Box>
  );



};

export default ActivitiesPage;
