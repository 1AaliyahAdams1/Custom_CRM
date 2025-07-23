//PAGE : Main Activity Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";

// Syncfusion component imports
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { MessageComponent } from "@syncfusion/ej2-react-notifications";


import ActivitiesTable from "../components/ActivitiesTable";
import ActivityFormDialog from "../components/ActivitiesFormDialog";

import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../services/activityService";

const ActivitiesPage = () => {
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
      const data = await getActivities();
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

  // Open dialog for creating a new activity
  const handleOpenCreate = () => {
    setSelectedActivity(null); // clear any selected activity
    setError(null);
    setDialogOpen(true);
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

  // Close the dialog and clear selected activity
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedActivity(null);
  };

 

return (
    <div style={{ padding: '24px' }}>
      {/* Page Title */}
      <h1 style={{ 
        fontSize: '2.125rem', 
        fontWeight: 400, 
        lineHeight: 1.235, 
        marginBottom: '16px',
        margin: '0 0 16px 0'
      }}>
        Activities
      </h1>

      {/* Display error alert if any error */}
      {error && (
        <div style={{ marginBottom: '16px' }}>
          <MessageComponent 
            severity="Error" 
            showCloseIcon={true}
            closed={() => setError(null)}
          >
            {error}
          </MessageComponent>
        </div>
      )}

      {/* Display success alert on successful operation */}
      {successMessage && (
        <div style={{ marginBottom: '16px' }}>
          <MessageComponent 
            severity="Success" 
            showCloseIcon={true}
            closed={() => setSuccessMessage("")}
          >
            {successMessage}
          </MessageComponent>
        </div>
      )}

      {/* Button to add a new activity */}
      <div style={{ marginBottom: '16px' }}>
        <ButtonComponent 
          isPrimary={true}
          onClick={handleOpenCreate}
          disabled={loading}  // Disable button while loading
        >
          Add Activity
        </ButtonComponent>
      </div>

      {/* Show loading spinner or accounts table depending on loading state */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '32px' 
        }}>
          {/* Simple CSS loading spinner since CircularProgress needs a different approach */}
          <div className="loading-spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 2s linear infinite'
          }}></div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      ) : (
        <ActivitiesTable
          activities={activities}
          onEdit={handleOpenEdit}   // Edit button callback
          onDelete={handleDelete}    // Delete button callback
        />
      )}

      {/* Dialog for adding/editing an activity */}
      <ActivityFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        activity={selectedActivity}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default ActivitiesPage;
