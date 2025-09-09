import React, { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Box, 
  Alert, 
  Typography, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText 
} from "@mui/material";
import { 
  Cancel, 
  CheckCircle, 
  HourglassEmpty, 
  Schedule 
} from "@mui/icons-material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";

import { fetchActivityById, updateActivity, deactivateActivity } from "../../services/activityService";
import { priorityLevelService, activityTypeService } from '../../services/dropdownServices';

// Status options configuration with icons
const statusOptions = [
  { 
    value: "incomplete", 
    label: "Incomplete", 
    color: "#f44336",
    icon: Cancel
  },
  { 
    value: "complete", 
    label: "Complete", 
    color: "#4caf50",
    icon: CheckCircle
  },
  { 
    value: "in-progress", 
    label: "In Progress", 
    color: "#ff9800",
    icon: HourglassEmpty
  },
  { 
    value: "pending", 
    label: "Pending", 
    color: "#2196f3",
    icon: Schedule
  }
];

const activityMainFields = [
  { key: "TypeID", label: "Activity Type", required: true, type: "dropdown", service: activityTypeService, displayField: "TypeName", valueField: "TypeID", width: { xs: 12, md: 6 } },
  { key: "AccountName", label: "Account", type: "text", disabled: true, width: { xs: 12, md: 6 } },
  { key: "PriorityLevelID", label: "Priority", type: "dropdown", service: priorityLevelService, displayField: "PriorityLevelName", valueField: "PriorityLevelID", width: { xs: 12, md: 6 } },
  { key: "DueToStart", label: "Due To Start", type: "date", width: { xs: 12, md: 6 } },
  { key: "DueToEnd", label: "Due To End", type: "date", width: { xs: 12, md: 6 } },
  { key: "PriorityLevelID", label: "Priority", type: "dropdown", service: priorityLevelService, displayField: "PriorityLevelName", valueField: "PriorityLevelID", width: { xs: 12, md: 6 } },
  { key: "DueToStart", label: "Due To Start", type: "date", width: { xs: 12, md: 6 } },
  { key: "DueToEnd", label: "Due To End", type: "date", width: { xs: 12, md: 6 } },
  { key: "Completed", label: "Completed", type: "boolean", width: { xs: 12, md: 6 } },
  { key: "CreatedAt", label: "Created", type: "datetime", disabled: true, width: { xs: 12, md: 6 } },
  { key: "UpdatedAt", label: "Updated", type: "datetime", disabled: true, width: { xs: 12, md: 6 } },
  { key: "CreatedAt", label: "Created", type: "datetime", disabled: true, width: { xs: 12, md: 6 } },
  { key: "UpdatedAt", label: "Updated", type: "datetime", disabled: true, width: { xs: 12, md: 6 } },
];

export default function ActivityDetailsForm({ 
  activityId, 
  onActivityUpdate, 
  onSuccessMessage, 
  onError 
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use activityId prop if provided, otherwise use URL param
  const currentActivityId = activityId || id;

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
        setError(null);
        const data = await fetchActivityById(id);
        console.log("Debug: fetchActivityById response:", data);
        
        const activityData = data?.data || data;
        if (!activityData) {
          throw new Error("Activity not found");
        }
        
        setActivity(activityData);
        
        const activityData = data?.data || data;
        if (!activityData) {
          throw new Error("Activity not found");
        }
        
        setActivity(activityData);
      } catch (err) {
        console.error("Error loading activity:", err);
        setError(err.message || "Failed to load activity details");
        setError(err.message || "Failed to load activity details");
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  const refreshActivity = async () => {
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

  const handleSave = async (formData) => {
    try {
      console.log("Debug: Saving activity:", formData);
      setError(null);
      
      // Optimistic UI update
      setActivity(formData);
      
      const activityId = formData.ActivityID || id;
      await updateActivity(activityId, formData);
      setError(null);
      
      // Optimistic UI update
      setActivity(formData);
      
      const activityId = formData.ActivityID || id;
      await updateActivity(activityId, formData);
      setSuccessMessage("Activity updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
      
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

  // Status change handlers
  const handleStatusClick = (event) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const updatedActivity = { ...activity, Status: newStatus };
      
      // Optimistic update
      setActivity(updatedActivity);
      
      // Update on server
      await updateActivity(activity.ActivityID, updatedActivity);
      
      const message = `Status updated to ${statusOptions.find(s => s.value === newStatus)?.label}`;
      setSuccessMessage(message);
      
      // Call parent callbacks if provided
      if (onSuccessMessage) onSuccessMessage(message);
      if (onActivityUpdate) onActivityUpdate();
      
    } catch (err) {
      console.error("Error updating status:", err);
      const errorMessage = "Failed to update status";
      setError(errorMessage);
      if (onError) onError(errorMessage);
      
      // Revert optimistic update
      await refreshActivity();
    } finally {
      setUpdatingStatus(false);
      setStatusMenuAnchor(null);
    }
  };

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
        onDelete={handleDelete}
        entityType="activity"
        headerChips={headerChips}
      />

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          }
        }}
      >
        {statusOptions.map((option) => {
          const IconComponent = option.icon;
          const isCurrentStatus = activity.Status === option.value;
          
          return (
            <MenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={updatingStatus || isCurrentStatus}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: isCurrentStatus ? `${option.color}20` : "transparent",
                "&:hover": {
                  backgroundColor: isCurrentStatus ? `${option.color}30` : `${option.color}10`,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <IconComponent 
                  sx={{ 
                    color: option.color,
                    fontSize: 20
                  }} 
                />
              </ListItemIcon>
              <ListItemText 
                primary={option.label}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontWeight: isCurrentStatus ? 600 : 400,
                    color: isCurrentStatus ? option.color : "inherit",
                  }
                }}
              />
              {isCurrentStatus && (
                <Typography variant="caption" sx={{ color: option.color, ml: 1 }}>
                  Current
                </Typography>
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}