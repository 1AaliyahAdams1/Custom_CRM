import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { fetchActivityById, updateActivity, deactivateActivity } from "../../services/activityService";
import { priorityLevelService, activityTypeService } from '../../services/dropdownServices';

const activityMainFields = [
  { key: "TypeID", label: "Activity Type", required: true, type: "dropdown", service: activityTypeService, displayField: "TypeName", valueField: "TypeID", width: { xs: 12, md: 6 } },
  { key: "AccountName", label: "Account", type: "text", disabled: true, width: { xs: 12, md: 6 } },
  { key: "PriorityLevelID", label: "Priority", type: "dropdown", service: priorityLevelService, displayField: "PriorityLevelName", valueField: "PriorityLevelID", width: { xs: 12, md: 6 } },
  { key: "DueToStart", label: "Due To Start", type: "date", width: { xs: 12, md: 6 } },
  { key: "DueToEnd", label: "Due To End", type: "date", width: { xs: 12, md: 6 } },
  { key: "Completed", label: "Completed", type: "boolean", width: { xs: 12, md: 6 } },
  { key: "CreatedAt", label: "Created", type: "datetime", disabled: true, width: { xs: 12, md: 6 } },
  { key: "UpdatedAt", label: "Updated", type: "datetime", disabled: true, width: { xs: 12, md: 6 } },
];

export default function ActivityDetailsForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadActivity = async () => {
      if (!id) {
        setError("No activity ID provided in the route.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchActivityById(id);
        console.log("Debug: fetchActivityById response:", data);
        
        const activityData = data?.data || data;
        if (!activityData) {
          throw new Error("Activity not found");
        }
        
        setActivity(activityData);
      } catch (err) {
        console.error("Error loading activity:", err);
        setError(err.message || "Failed to load activity details");
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  const handleSave = async (formData) => {
    try {
      console.log("Debug: Saving activity:", formData);
      setError(null);
      
      // Optimistic UI update
      setActivity(formData);
      
      const activityId = formData.ActivityID || id;
      await updateActivity(activityId, formData);
      setSuccessMessage("Activity updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving activity:", err);
      setError(err.message || "Failed to save activity.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    
    try {
      setError(null);
      await deactivateActivity(id);
      setSuccessMessage("Activity deleted successfully!");
      setTimeout(() => navigate("/activities"), 1500);
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError(err.message || "Failed to delete activity.");
    }
  };

  const handleBack = () => navigate("/activities");

  if (loading) return <Typography>Loading activity details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!activity) return <Alert severity="warning">Activity not found.</Alert>;

  const getActivityDisplayName = (a) =>
    a.TypeName ? `${a.TypeName} Activity` : `Activity #${a.ActivityID}`;

  const headerChips = [
    {
      label: activity.Completed ? "Completed" : "Pending",
      color: activity.Completed ? "#10b981" : "#f59e0b",
      textColor: "#fff",
    },
  ];

  if (activity.PriorityLevelName) {
    const priorityColors = {
      'High': '#ef4444',
      'Medium': '#f59e0b', 
      'Low': '#10b981'
    };
    headerChips.push({
      label: activity.PriorityLevelName,
      color: priorityColors[activity.PriorityLevelName] || '#6b7280',
      textColor: '#fff'
    });
  }

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <UniversalDetailView
        title={getActivityDisplayName(activity)}
        subtitle={activity?.ActivityID ? `ID: ${activity.ActivityID}` : undefined}
        item={activity}
        mainFields={activityMainFields}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        entityType="activity"
        headerChips={headerChips}
      />
    </Box>
  );
}