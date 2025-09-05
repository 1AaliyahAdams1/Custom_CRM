import React, { useState, useEffect } from "react";
import ActivityTypePage from "../../pages/ActivityTypes/ActivityTypePage";
import activityTypeService from "../../services/activityTypeService";

const ActivityTypeContainer = () => {
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");
  const [selected, setSelected] = useState([]);

  // ------------------- Fetch Activity Types -------------------
  const fetchActivityTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityTypeService.getAllActivityTypes();

      if (response.success && Array.isArray(response.data)) {
        // Use Active directly
        const mappedData = response.data.map(at => ({
          ...at,
          CreatedAt: at.CreatedAt || "",
          UpdatedAt: at.UpdatedAt || "",
        }));
        setActivityTypes(mappedData);
      } else {
        setError(response.message || "Failed to load activity types");
      }
    } catch (err) {
      setError(err.message || "Failed to load activity types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  // ------------------- Selection -------------------
  const handleSelectClick = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) setSelected(activityTypes.map(at => at.TypeID));
    else setSelected([]);
  };

  // ------------------- Actions -------------------
  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this activity type?")) return;
    const response = await activityTypeService.deactivateActivityType(id);
    if (response.success) {
      setSuccessMessage(response.message);
      fetchActivityTypes();
    } else {
      setError(response.message);
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm("Are you sure you want to reactivate this activity type?")) return;
    const response = await activityTypeService.reactivateActivityType(id);
    if (response.success) {
      setSuccessMessage(response.message);
      fetchActivityTypes();
    } else {
      setError(response.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity type? This action cannot be undone.")) return;
    const response = await activityTypeService.deleteActivityType(id);
    if (response.success) {
      setSuccessMessage(response.message);
      setSelected(prev => prev.filter(s => s !== id));
      fetchActivityTypes();
    } else {
      setError(response.message);
    }
  };

  const handleBulkDeactivate = async () => {
    if (!window.confirm(`Are you sure you want to deactivate ${selected.length} selected activity types?`)) return;
    const response = await activityTypeService.bulkActivateActivityTypes(selected, false);
    if (response.success) {
      setSuccessMessage(response.message);
      setSelected([]);
      fetchActivityTypes();
    } else {
      setError(response.message);
    }
  };

  const handleCreate = async (newActivityType) => {
    const response = await activityTypeService.createActivityType(newActivityType);
    if (response.success) {
      setSuccessMessage(response.message);
      fetchActivityTypes();
    } else {
      setError(response.message);
    }
  };

  const handleEdit = async (updatedActivityType) => {
    const response = await activityTypeService.updateActivityType(updatedActivityType.TypeID, updatedActivityType);
    if (response.success) {
      setSuccessMessage(response.message);
      fetchActivityTypes();
    } else {
      setError(response.message);
    }
  };

  const handleView = (activityType) => {
    console.log("View activity type:", activityType);
  };

  // ------------------- Status Messages -------------------
  const showStatus = (message, severity = "success") => {
    setStatusMessage(message);
    setStatusSeverity(severity);
  };

  return (
    <ActivityTypePage
      activityTypes={activityTypes}
      loading={loading}
      error={error}
      setError={setError}
      successMessage={successMessage}
      setSuccessMessage={setSuccessMessage}
      statusMessage={statusMessage}
      statusSeverity={statusSeverity}
      setStatusMessage={setStatusMessage}
      selected={selected}
      onSelectClick={handleSelectClick}
      onSelectAllClick={handleSelectAllClick}
      onDeactivate={handleDeactivate}
      onReactivate={handleReactivate}
      onDelete={handleDelete}
      onBulkDeactivate={handleBulkDeactivate}
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleCreate}
      showStatus={showStatus}
    />
  );
};

export default ActivityTypeContainer;
