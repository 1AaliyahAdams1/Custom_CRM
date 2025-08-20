import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/DetailsView";
import { fetchActivityById, updateActivity } from "../../services/activityService";

const activityMainFields = [
  { key: "TypeName", label: "Activity Type", required: true, type: "select", options: ["Call","Meeting","Email","Task","Follow-up","Demo","Presentation","Other"], width: { xs: 12, md: 6 } },
  { key: "AccountName", label: "Account", type: "text", disabled: true, width: { xs: 12, md: 6 } },
  { key: "PriorityLevelName", label: "Priority", type: "select", options: ["Low","Medium","High","Urgent"], width: { xs: 12, md: 6 } },
  { key: "DueToStart", label: "Due To Start", type: "date", width: { xs: 12, md: 6 } }, // new
  { key: "DueToEnd", label: "Due To End", type: "date", width: { xs: 12, md: 6 } }, // new
  { key: "Completed", label: "Completed", type: "boolean", width: { xs: 12, md: 6 } },
  { key: "CreatedAt", label: "Created", type: "datetime", disabled: true, width: { xs: 12, md: 6 } }, // new
  { key: "UpdatedAt", label: "Updated", type: "datetime", disabled: true, width: { xs: 12, md: 6 } }, // new
];

export default function ActivityDetailsForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    console.log("🔍 Debug: useParams() =", { id });

    const loadActivity = async () => {
      if (!id) {
        setError("No activity ID provided in the route.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchActivityById(id);
        console.log("Debug: fetchActivityById response:", data);

        setActivity(data?.data || data || null);
      } catch (err) {
        console.error("Error loading activity:", err);
        setError("Failed to load activity details");
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  const handleSave = async (formData) => {
    try {
      console.log("Debug: Saving activity:", formData);
      setActivity(formData); // optimistic UI update
      await updateActivity(formData.ActivityID, formData);
      setSuccessMessage("Activity updated successfully!");
    } catch (err) {
      console.error("Error saving activity:", err);
      setError("Failed to save activity.");
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
        entityType="activity"
        headerChips={headerChips}
      />
    </Box>
  );
}
