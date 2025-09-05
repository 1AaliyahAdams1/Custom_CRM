import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ActivitiesPage from "../../pages/Activities/ActivitiesPage";
import {
  getAllActivities,
  fetchActivitiesByUser,
  deactivateActivity,
} from "../../services/activityService";
import { 
  createNote, 
  updateNote, 
  deleteNote, 
  getNotesByEntity 
} from "../../services/noteService";
import { 
  uploadAttachment, 
  getAttachmentsByEntity, 
  deleteAttachment, 
  downloadAttachment 
} from "../../services/attachmentService";
import { getAllAccounts } from "../../services/accountService";
import { activityTypeService, priorityLevelService } from "../../services/dropdownServices";
import ConfirmDialog from "../../components/ConfirmDialog";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";

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

  // ---------------- SELECTION ----------------
  const handleSelectClick = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );

  const handleSelectAllClick = (e) =>
    setSelected(e.target.checked ? activities.map((a) => a.ActivityID) : []);

  // ---------------- NOTES ----------------
  const handleAddNote = (activity) => {
    setSelectedActivity(activity);
    setNotesPopupOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const notePayload = {
        EntityID: selectedActivity.ActivityID,
        EntityType: "Activity",
        Content: noteData.Content,
      };
      await createNote(notePayload);
      setSuccessMessage("Note added successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setError(err.message || "Failed to save note");
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await updateNote(noteData.NoteID, noteData);
      setSuccessMessage("Note updated successfully!");
      setRefreshFlag((f) => !f);
    } catch (err) {
      setError(err.message || "Failed to update note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setSuccessMessage("Note deleted successfully!");
      setRefreshFlag((f) => !f);
    } catch (err) {
      setError(err.message || "Failed to delete note");
    }
  };

  // ---------------- ATTACHMENTS ----------------
  const handleAddAttachment = (activity) => {
    setSelectedActivity(activity);
    setAttachmentsPopupOpen(true);
  };

  const handleUploadAttachment = async (files) => {
    try {
      const uploadPromises = files.map(file => 
        uploadAttachment({
          file,
          entityId: selectedActivity.ActivityID,
          entityTypeName: "Activity"
        })
      );
      await Promise.all(uploadPromises);
      setSuccessMessage(`${files.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setError(err.message || "Failed to upload attachments");
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      setSuccessMessage("Attachment deleted successfully!");
      setRefreshFlag((f) => !f);
    } catch (err) {
      setError(err.message || "Failed to delete attachment");
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      await downloadAttachment(attachment);
    } catch (err) {
      setError(err.message || "Failed to download attachment");
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
        onSelectClick={handleSelectClick}
        onSelectAllClick={handleSelectAllClick}
        onDeactivate={handleDeactivateClick}
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
        clearFilters={clearFilters}
        totalCount={activities.length}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        entityType="Activity"
        entityId={selectedActivity?.ActivityID}
        entityName={selectedActivity?.ActivityType}
        showExistingNotes={true}
      />

      {/* Attachments Popup */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        entityType="Activity"
        entityId={selectedActivity?.ActivityID}
        entityName={selectedActivity?.ActivityType}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
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