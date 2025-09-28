import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ActivitiesPage from "../../pages/Activities/ActivitiesPage";
import {
  getAllActivities,
  fetchActivitiesByUser,
  deactivateActivity,
  bulkMarkActivitiesIncomplete,
  bulkUpdateActivityDueDates,
  bulkMarkActivitiesComplete
} from "../../services/activityService";
import {
  getAllAccounts,
  fetchActiveAccountsByUser,
  fetchActiveUnassignedAccounts,
} from "../../services/accountService";
import { createNote, updateNote, deleteNote } from "../../services/noteService";
import { uploadAttachment, deleteAttachment, downloadAttachment } from "../../services/attachmentService";
import { activityTypeService, priorityLevelService } from "../../services/dropdownServices";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { ROUTE_ACCESS } from "../../utils/auth/routesAccess";

const ActivitiesContainer = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [accountOwnership, setAccountOwnership] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // ---------------- USER & ROLES ----------------
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  // ---------------- ROLE ACCESS ----------------
  const canAccess = (routeKey) => {
    const allowedRoles = ROUTE_ACCESS[routeKey] || [];
    return roles.some(role => allowedRoles.includes(role));
  };

  const canView = canAccess("activities");

  // ---------------- FILTER LOGIC ----------------
  const applyFilter = (activities, filterType) => {
    let filtered;
    switch (filterType) {
      case "my":
        filtered = activities.filter(a => accountOwnership.get(a.AccountID) === "owned");
        break;

      case "team":
        filtered = roles.includes("C-level") || roles.includes("Sales Manager")
          ? activities
          : activities.filter(a => {
              const status = accountOwnership.get(a.AccountID);
              return status === "owned" || status === "unowned";
            });
        break;

      case "unassigned":
        filtered = activities.filter(a => accountOwnership.get(a.AccountID) === "unowned");
        break;

      case "all":
      default:
        filtered = activities;
        break;
    }
    return filtered;
  };

  // ---------------- FETCH ACCOUNT OWNERSHIP ----------------
  const fetchAccountOwnership = async () => {
    try {
      const map = new Map();
      if (canAccess("accounts")) {
        const allAccounts = await getAllAccounts();
        const assigned = await fetchActiveAccountsByUser(userId);
        const unassigned = await fetchActiveUnassignedAccounts();

        const assignedIds = new Set((assigned || []).map(a => a.AccountID));
        const unassignedIds = new Set((unassigned || []).map(a => a.AccountID));

        (allAccounts || []).forEach(acc => {
          if (assignedIds.has(acc.AccountID)) map.set(acc.AccountID, "owned");
          else if (unassignedIds.has(acc.AccountID)) map.set(acc.AccountID, "unowned");
          else map.set(acc.AccountID, "unknown");
        });
      }
      setAccountOwnership(map);
      return map;
    } catch (err) {
      setError("Failed to load account ownership");
      return new Map();
    }
  };

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
      await fetchAccountOwnership();
      let activitiesData = [];

      if (canView) {
        activitiesData = await getAllActivities(true);
      } else {
        activitiesData = await fetchActivitiesByUser(userId);
      }

      setAllActivities(activitiesData || []);
      setFilteredActivities(applyFilter(activitiesData || [], currentFilter));
    } catch {
      setError("Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchLookups();
    fetchActivities();
  }, [refreshFlag]);

  useEffect(() => {
    if (allActivities.length && accountOwnership.size) {
      setFilteredActivities(applyFilter(allActivities, currentFilter));
    }
  }, [allActivities, currentFilter, accountOwnership]);

  // ---------------- FILTER & SELECTION HANDLERS ----------------
  const handleFilterChange = (filterType) => {
    setCurrentFilter(filterType);
    setFilteredActivities(applyFilter(allActivities, filterType));
    setSelected([]);
  };

  const handleSelectClick = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);

  const handleSelectAllClick = (e) =>
    setSelected(e.target.checked ? filteredActivities.map(a => a.ActivityID) : []);

  const handleDeactivateClick = (activity) => {
    setActivityToDelete(activity);
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!activityToDelete) return;
    try {
      await deactivateActivity(activityToDelete.ActivityID);
      setSuccessMessage("Activity deleted successfully.");
      setRefreshFlag(f => !f);
    } catch {
      setError("Failed to delete activity.");
    } finally {
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
    }
  };

  const handleEdit = (activity) => navigate(`/activities/edit/${activity.ActivityID}`, { state: { activity } });
  const handleView = (activity) => navigate(`/activities/${activity.ActivityID}`);
  const handleCreate = () => navigate("/activities/create");

  // ---------------- NOTES & ATTACHMENTS ----------------
  const handleAddNote = (activity) => { setSelectedActivity(activity); setNotesPopupOpen(true); };
  const handleSaveNote = async (noteData) => {
    try {
      await createNote({ EntityID: selectedActivity.ActivityID, EntityType: "Activity", Content: noteData.Content });
      setSuccessMessage("Note added successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag(f => !f);
    } catch (err) { setError(err.message || "Failed to save note"); }
  };

  const handleEditNote = async (noteData) => { try { await updateNote(noteData.NoteID, noteData); setSuccessMessage("Note updated!"); setRefreshFlag(f => !f); } catch { setError("Failed to update note"); } };
  const handleDeleteNote = async (noteId) => { try { await deleteNote(noteId); setSuccessMessage("Note deleted!"); setRefreshFlag(f => !f); } catch { setError("Failed to delete note"); } };

  const handleAddAttachment = (activity) => { setSelectedActivity(activity); setAttachmentsPopupOpen(true); };
  const handleUploadAttachment = async (files) => { 
    try { 
      await Promise.all(files.map(f => uploadAttachment({ file: f, entityId: selectedActivity.ActivityID, entityTypeName: "Activity" }))); 
      setSuccessMessage(`${files.length} attachment(s) uploaded!`); 
      setAttachmentsPopupOpen(false); 
      setRefreshFlag(f => !f); 
    } catch { setError("Failed to upload attachments"); }
  };
  const handleDeleteAttachment = async (id) => { try { await deleteAttachment(id); setSuccessMessage("Attachment deleted"); setRefreshFlag(f => !f); } catch { setError("Failed to delete attachment"); } };
  const handleDownloadAttachment = async (attachment) => { try { await downloadAttachment(attachment); } catch { setError("Failed to download attachment"); } };

  const clearFilters = () => { setSearchTerm(""); setStatusFilter(""); setPriorityFilter(""); };

  // ---------------- FINAL FILTERED ACTIVITIES ----------------
  const finalFilteredActivities = useMemo(() => {
    return filteredActivities.filter(a => {
      const matchesSearch = !searchTerm || a.AccountName?.toLowerCase().includes(searchTerm.toLowerCase()) || a.ActivityType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || (statusFilter === "completed" ? a.Completed : !a.Completed);
      const matchesPriority = !priorityFilter || a.PriorityLevelName === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [filteredActivities, searchTerm, statusFilter, priorityFilter]);

  // ---------------- BULK ACTIONS ----------------
  const handleBulkMarkComplete = async (selectedActivities) => {
    try {
      const incomplete = selectedActivities.filter(a => !a.Completed);
      if (incomplete.length === 0) { setError('No incomplete activities selected'); return; }
      await bulkMarkActivitiesComplete(incomplete.map(a => a.ActivityID));
      setSuccessMessage(`Marked ${incomplete.length} activit${incomplete.length===1?'y':'ies'} complete`);
      setSelected([]);
      setRefreshFlag(f => !f);
    } catch { setError('Failed to mark activities complete'); }
  };

  const handleBulkMarkIncomplete = async (selectedActivities) => {
    try {
      const complete = selectedActivities.filter(a => a.Completed);
      if (complete.length === 0) { setError('No complete activities selected'); return; }
      await bulkMarkActivitiesIncomplete(complete.map(a => a.ActivityID));
      setSuccessMessage(`Marked ${complete.length} activit${complete.length===1?'y':'ies'} incomplete`);
      setSelected([]);
      setRefreshFlag(f => !f);
    } catch { setError('Failed to mark activities incomplete'); }
  };

  const handleBulkUpdateDueDates = async (selectedActivities) => { console.log('Bulk update due dates initiated', selectedActivities.length); };
  const handleConfirmDueDatesUpdate = async (dateData) => {
    try {
      const ids = selected;
      if (!ids.length) { setError("No activities selected"); return; }
      await bulkUpdateActivityDueDates(ids, dateData.dueToStart, dateData.dueToEnd);
      setSuccessMessage(`Updated due dates for ${ids.length} activit${ids.length===1?'y':'ies'}`);
      setSelected([]);
      setRefreshFlag(f => !f);
    } catch { setError("Failed to update due dates"); }
  };

  // ---------------- RENDER ----------------
  if (!canView) {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <>
      <ActivitiesPage
        activities={finalFilteredActivities}
        loading={loading}
        error={error}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        selected={selected}
        onClearSelection={() => setSelected([])}
        userRole={roles}
        onBulkMarkComplete={handleBulkMarkComplete}
        onBulkMarkIncomplete={handleBulkMarkIncomplete}
        onBulkUpdateDueDates={handleBulkUpdateDueDates}
        onConfirmDueDatesUpdate={handleConfirmDueDatesUpdate}
        onSelectClick={handleSelectClick}
        onSelectAllClick={handleSelectAllClick}
        onDeactivate={handleDeactivateClick}
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
        clearFilters={clearFilters}
        totalCount={allActivities.length}
        currentFilter={currentFilter}
      />

      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        entityType="Activity"
        entityId={selectedActivity?.ActivityID}
        entityName={selectedActivity?.ActivityType}
        showExistingNotes
      />

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

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Activity"
        description={`Are you sure you want to delete this activity${activityToDelete?.ActivityType ? ` (${activityToDelete.ActivityType})` : ""}?`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default ActivitiesContainer;