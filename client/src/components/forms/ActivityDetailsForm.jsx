import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/DetailsView";
import { fetchActivityById, updateActivity } from "../../services/activityService";

// Main fields configuration for activities
const activityMainFields = [
  { key: "TypeName", label: "Activity Type", required: true, type: "select", options: ["Call","Meeting","Email","Task","Follow-up","Demo","Presentation","Other"], width: { xs: 12, md: 6 } },
  { key: "AccountName", label: "Account", type: "text", disabled: true, width: { xs: 12, md: 6 } },
  { key: "Description", label: "Description", type: "textarea", rows: 3, width: { xs: 12 } },
  { key: "ContactID", label: "Contact", type: "select", width: { xs: 12, md: 6 } },
  { key: "Due_date", label: "Due Date & Time", type: "datetime-local", width: { xs: 12, md: 6 } },
  { key: "PriorityLevelName", label: "Priority", type: "select", options: ["Low","Medium","High","Urgent"], width: { xs: 12, md: 6 } },
  { key: "Completed", label: "Completed", type: "boolean", width: { xs: 12, md: 6 } },
];

export default function ActivityDetailsForm({ activities = [] }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      if (!Array.isArray(activities)) throw new Error("Invalid activities data");
      setActivityData(activities);
    } catch (err) {
      setError(err.message || "Failed to load activity records");
    } finally {
      setLoading(false);
    }
  }, [activities]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleSave = async (formData, index) => {
    try {
      const updatedActivities = [...activityData];
      updatedActivities[index] = formData;
      setActivityData(updatedActivities);
      await updateActivity(formData.ActivityID, formData);
      setSuccessMessage("Activity updated successfully!");
    } catch (err) {
      setError("Failed to save activity. Please try again.");
    }
  };

  const handleBack = () => navigate("/activities");

  const handleTabChange = (_, newIndex) => setActiveIndex(newIndex);

  if (loading) return <Typography>Loading activity details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!activityData || !activityData.length) return <Alert severity="warning">No activity records found.</Alert>;

  const multipleRecords = activityData.length > 1;
  const currentActivity = activityData[activeIndex];

  const headerChips = currentActivity
    ? [{ label: currentActivity.Completed ? "Completed" : "Pending", color: currentActivity.Completed ? "#10b981" : "#f59e0b", textColor: "#fff" }]
    : [];

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {multipleRecords && (
        <Tabs value={activeIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
          {activityData.map((act, idx) => (
            <Tab key={idx} label={`${act.TypeName || "Activity"} #${act.ActivityID}`} />
          ))}
        </Tabs>
      )}

      <UniversalDetailView
        title={currentActivity?.TypeName || "Activity Details"}
        subtitle={currentActivity?.ActivityID ? `ID: ${currentActivity.ActivityID}` : undefined}
        item={currentActivity}
        mainFields={activityMainFields}
        // onBack={handleBack}
        onSave={(formData) => handleSave(formData, activeIndex)}
        loading={loading}
        entityType="activity"
        headerChips={headerChips}
      />
    </Box>
  );
}
