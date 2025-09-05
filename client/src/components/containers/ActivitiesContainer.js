import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ActivitiesPage from "../../pages/Activities/ActivitiesPage";
import {
  getAllActivities,
  fetchActivitiesByUser,
  deactivateActivity,
} from "../../services/activityService";
import { noteService } from "../../services/noteService";
import { attachmentService } from "../../services/attachmentService";
import { getAllAccounts } from "../../services/accountService";
import { activityTypeService, priorityLevelService } from "../../services/dropdownServices";
import ConfirmDialog from "../../components/ConfirmDialog"; 

const ActivitiesContainer = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Lookups
  const [accounts, setAccounts] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  // ---------------- FETCH LOOKUPS ----------------
  const fetchLookups = async () => {
    try {
      const [accountsData, activityTypesData, priorityLevelsData] = await Promise.all([
        getAllAccounts(),
        activityTypeService.getAll(),
        priorityLevelService.getAll(),
      ]);
      setAccounts(accountsData);
      setActivityTypes(activityTypesData);
      setPriorityLevels(priorityLevelsData);
    } catch {
      setError("Failed to load lookups.");
    }
  };

  // ---------------- FETCH ACTIVITIES ----------------
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      let activitiesData = [];
      if (isCLevel) {
        activitiesData = await getAllActivities(true);
      } else if (isSalesRep && userId) {
        activitiesData = await fetchActivitiesByUser(userId);
      }
      setActivities(activitiesData || []);
    } catch {
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookups();
    fetchActivities();
  }, [refreshFlag]);

  // ---------------- FILTERED ACTIVITIES ----------------
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesSearch =
        !searchTerm ||
        a.AccountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.ActivityType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        !statusFilter || (statusFilter === "completed" ? a.Completed : !a.Completed);
      const matchesPriority =
        !priorityFilter || a.PriorityLevelName === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [activities, searchTerm, statusFilter, priorityFilter]);

  // ---------------- HANDLERS ----------------
  const handleDeactivateClick = (activity) => {
    setActivityToDelete(activity);
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!activityToDelete) return;
    try {
      await deactivateActivity(activityToDelete.ActivityID);
      setSuccessMessage("Activity deleted successfully.");
      setRefreshFlag((f) => !f);
    } catch {
      setError("Failed to delete activity. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
    }
  };

  const handleEdit = (activity) =>
    navigate(`/activities/edit/${activity.ActivityID}`, { state: { activity } });

  const handleView = (activity) => navigate(`/activities/${activity.ActivityID}`);

  const handleCreate = () => navigate("/activities/create");

  // ---------------- NOTES / ATTACHMENTS ----------------
  const handleAddNote = (activity) => {
    setSelectedActivity(activity);
    setNotesPopupOpen(true);
    setPopupError(null);
  };

  const handleAddAttachment = (activity) => {
    setSelectedActivity(activity);
    setAttachmentsPopupOpen(true);
    setPopupError(null);
  };

  const handleSaveNote = async (noteData) => {
    try {
      setPopupLoading(true);
      await noteService.createNote(noteData);
      setSuccessMessage("Note added successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setPopupError(err.message || "Failed to save note");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleUploadAttachment = async (attachments) => {
    try {
      setPopupLoading(true);
      for (const attachment of attachments) {
        await attachmentService.uploadAttachment(attachment);
      }
      setSuccessMessage(`${attachments.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setPopupError(err.message || "Failed to upload attachments");
    } finally {
      setPopupLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  return (
    <>
      <ActivitiesPage
        activities={filteredActivities}
        loading={loading}
        error={error}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        selected={selected}
        onSelectClick={(id) =>
          setSelected((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
          )
        }
        onSelectAllClick={(e) =>
          setSelected(e.target.checked ? activities.map((a) => a.ActivityID) : [])
        }
        onDeactivate={handleDeactivateClick} // ✅ use dialog
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        notesPopupOpen={notesPopupOpen}
        setNotesPopupOpen={setNotesPopupOpen}
        attachmentsPopupOpen={attachmentsPopupOpen}
        setAttachmentsPopupOpen={setAttachmentsPopupOpen}
        selectedActivity={selectedActivity}
        popupLoading={popupLoading}
        popupError={popupError}
        handleSaveNote={handleSaveNote}
        handleUploadAttachment={handleUploadAttachment}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
        clearFilters={clearFilters}
        totalCount={activities.length}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Activity"
        description={`Are you sure you want to delete this activity${
          activityToDelete?.ActivityType
            ? ` (${activityToDelete.ActivityType})`
            : ""
        }?`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default ActivitiesContainer;
