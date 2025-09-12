import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ActivitiesPage from "../../pages/Activities/ActivitiesPage";
import {
  getAllActivities,
  fetchActivitiesByUser,
  deactivateActivity,
  bulkMarkActivitiesComplete,
  bulkMarkActivitiesIncomplete,
  bulkUpdateActivityDueDates
} from "../../services/activityService";
import {
  getAllAccounts,
  fetchActiveAccountsByUser,
  fetchActiveUnassignedAccounts,
} from "../../services/accountService";
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
import { activityTypeService, priorityLevelService } from "../../services/dropdownServices";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import BulkDueDatesDialog from "../../components/BulkDueDatesDialog";

const ActivitiesContainer = () => {
  const navigate = useNavigate();

  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [accountOwnership, setAccountOwnership] = useState(new Map()); // Map of AccountID -> ownerStatus
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Additional filters (search, status, priority)
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

  // ---------------- FILTER LOGIC ----------------
  const applyFilter = (activities, filterType) => {
    console.log('=== ACTIVITIES FILTER DEBUG ===');
    console.log('Applying filter:', filterType, 'to activities:', activities.length);
    console.log('Account ownership map size:', accountOwnership.size);
    
    let filteredActivities;
    switch (filterType) {
      case 'my':
        // Activities from accounts I own
        if (isSalesRep) {
          filteredActivities = activities.filter(activity => {
            const ownerStatus = accountOwnership.get(activity.AccountID);
            console.log(`Activity ${activity.ActivityType} (Account: ${activity.AccountID}) - Owner Status: ${ownerStatus}`);
            return ownerStatus === 'owned';
          });
        } else {
          // Non-sales reps might not have "owned" accounts
          filteredActivities = [];
        }
        break;
        
      case 'team':
        if (isCLevel) {
          // C-level sees all activities
          filteredActivities = activities;
        } else if (isSalesRep) {
          // Sales rep sees activities from owned and unassigned accounts
          filteredActivities = activities.filter(activity => {
            const ownerStatus = accountOwnership.get(activity.AccountID);
            return ownerStatus === 'owned' || ownerStatus === 'unowned';
          });
        } else {
          // Other roles see all activities (adjust as needed)
          filteredActivities = activities;
        }
        break;
        
      case 'unassigned':
        if (isCLevel) {
          // C-level sees activities from unassigned accounts only
          filteredActivities = activities.filter(activity => {
            const ownerStatus = accountOwnership.get(activity.AccountID);
            console.log(`Unassigned filter - Activity ${activity.ActivityType}: ${ownerStatus}`);
            return ownerStatus === 'unowned';
          });
        } else if (isSalesRep) {
          // Sales rep sees activities from unassigned accounts
          filteredActivities = activities.filter(activity => {
            const ownerStatus = accountOwnership.get(activity.AccountID);
            return ownerStatus === 'unowned';
          });
        } else {
          filteredActivities = [];
        }
        break;
        
      case 'all':
      default:
        filteredActivities = activities;
        break;
    }
    
    console.log(`Filter "${filterType}" returned:`, filteredActivities.length, 'activities');
    console.log('=== END ACTIVITIES FILTER DEBUG ===');
    return filteredActivities;
  };

  // ---------------- FETCH ACCOUNT OWNERSHIP ----------------
  const fetchAccountOwnership = async () => {
    console.log('=== FETCHING ACCOUNT OWNERSHIP FOR ACTIVITIES ===');
    try {
      const ownershipMap = new Map();

      if (isCLevel) {
        console.log('Fetching all accounts for C-level user');
        const response = await getAllAccounts();
        const accountsData = response.data || response || [];
        console.log('All accounts received:', accountsData.length);
        
        // For C-level, determine which accounts are assigned vs unassigned
        const assignedRes = await fetchActiveAccountsByUser(userId);
        const assignedAccounts = Array.isArray(assignedRes) ? assignedRes : [];
        const assignedAccountIds = new Set(assignedAccounts.map(acc => acc.AccountID));
        
        const unassignedRes = await fetchActiveUnassignedAccounts();
        const unassignedAccounts = Array.isArray(unassignedRes) ? unassignedRes : [];
        const unassignedAccountIds = new Set(unassignedAccounts.map(acc => acc.AccountID));
        
        // Mark each account appropriately
        accountsData.forEach(acc => {
          if (assignedAccountIds.has(acc.AccountID)) {
            ownershipMap.set(acc.AccountID, 'owned');
          } else if (unassignedAccountIds.has(acc.AccountID)) {
            ownershipMap.set(acc.AccountID, 'unowned');
          } else {
            ownershipMap.set(acc.AccountID, 'unknown');
          }
        });
        
      } else if (isSalesRep) {
        console.log('Fetching accounts for Sales Rep');
        
        const assignedRes = await fetchActiveAccountsByUser(userId);
        const unassignedRes = await fetchActiveUnassignedAccounts();

        const assignedAccounts = Array.isArray(assignedRes) ? assignedRes : [];
        const unassignedAccounts = Array.isArray(unassignedRes) ? unassignedRes : [];

        console.log('Assigned accounts:', assignedAccounts.length);
        console.log('Unassigned accounts:', unassignedAccounts.length);

        assignedAccounts.forEach(acc => {
          ownershipMap.set(acc.AccountID, 'owned');
        });

        unassignedAccounts.forEach(acc => {
          ownershipMap.set(acc.AccountID, 'unowned');
        });
      }

      console.log('Account ownership map created with', ownershipMap.size, 'entries');
      
      setAccountOwnership(ownershipMap);
      return ownershipMap;
    } catch (err) {
      console.error('Failed to fetch account ownership:', err);
      setError('Failed to load account information for filtering');
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
      let activitiesData = [];

      // First fetch account ownership information
      const ownershipMap = await fetchAccountOwnership();

      if (isCLevel) {
        activitiesData = await getAllActivities(true);
      } else if (isSalesRep && userId) {
        activitiesData = await fetchActivitiesByUser(userId);
      }

      console.log('Raw activities received:', activitiesData.length);

      setAllActivities(activitiesData || []);
      const filtered = applyFilter(activitiesData || [], currentFilter);
      setFilteredActivities(filtered);
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

  useEffect(() => {
    if (allActivities.length > 0 && accountOwnership.size > 0) {
      const filtered = applyFilter(allActivities, currentFilter);
      setFilteredActivities(filtered);
    }
  }, [allActivities, currentFilter, accountOwnership]);

  // ---------------- FILTER HANDLER ----------------
  const handleFilterChange = (filterType) => {
    console.log('Filter changed to:', filterType);
    setCurrentFilter(filterType);
    const filtered = applyFilter(allActivities, filterType);
    setFilteredActivities(filtered);
    setSelected([]);
  };

  // ---------------- FINAL FILTERED ACTIVITIES (with search, status, priority) ----------------
  const finalFilteredActivities = useMemo(() => {
    return filteredActivities.filter((a) => {
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
  }, [filteredActivities, searchTerm, statusFilter, priorityFilter]);

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
    setSelected(e.target.checked ? finalFilteredActivities.map((a) => a.ActivityID) : []);

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

  // ---------------- BULK ACTION HANDLERS ----------------
  const handleBulkMarkComplete = async (selectedActivities) => {
    try {
      setLoading(true);
      const incompleteActivities = selectedActivities.filter(activity => !activity.Completed);
      
      if (incompleteActivities.length === 0) {
        setError('No incomplete activities selected');
        return;
      }

      // Call bulk complete service
      await bulkMarkActivitiesComplete(incompleteActivities.map(a => a.ActivityID));
      
      setSuccessMessage(`Successfully marked ${incompleteActivities.length} activit${incompleteActivities.length === 1 ? 'y' : 'ies'} as complete`);
      setSelected([]);
      setRefreshFlag(f => !f);
    } catch (error) {
      console.error('Bulk mark complete failed:', error);
      setError(error.message || 'Failed to mark activities as complete');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarkIncomplete = async (selectedActivities) => {
    try {
      setLoading(true);
      const completeActivities = selectedActivities.filter(activity => activity.Completed);
      
      if (completeActivities.length === 0) {
        setError('No complete activities selected');
        return;
      }

      // Call bulk incomplete service
      await bulkMarkActivitiesIncomplete(completeActivities.map(a => a.ActivityID));
      
      setSuccessMessage(`Successfully marked ${completeActivities.length} activit${completeActivities.length === 1 ? 'y' : 'ies'} as incomplete`);
      setSelected([]);
      setRefreshFlag(f => !f);
    } catch (error) {
      console.error('Bulk mark incomplete failed:', error);
      setError(error.message || 'Failed to mark activities as incomplete');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdateDueDates = async (selectedActivities) => {
    // This is called from the toolbar - we don't need to do anything here
    // The actual dialog opening is handled in the ActivitiesPage component
    console.log('Bulk update due dates initiated for', selectedActivities.length, 'activities');
  };

  // This is the handler that gets called when the dialog confirms the update
  const handleConfirmDueDatesUpdate = async (dateData) => {
    try {
      setLoading(true);
      
      const selectedActivityIds = selected.map(id => id);
      
      if (selectedActivityIds.length === 0) {
        setError('No activities selected');
        return;
      }

      // Call the bulk update service
      await bulkUpdateActivityDueDates(
        selectedActivityIds,
        dateData.dueToStart,
        dateData.dueToEnd
      );
      
      const updatedCount = selectedActivityIds.length;
      let message = `Successfully updated due dates for ${updatedCount} activit${updatedCount === 1 ? 'y' : 'ies'}`;
      
      if (dateData.dueToStart && dateData.dueToEnd) {
        message += ' (both start and end dates)';
      } else if (dateData.dueToStart) {
        message += ' (start date)';
      } else if (dateData.dueToEnd) {
        message += ' (end date)';
      }
      
      setSuccessMessage(message);
      setSelected([]);
      setRefreshFlag(f => !f);
    } catch (error) {
      console.error('Bulk update due dates failed:', error);
      setError(error.message || 'Failed to update activity due dates');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelected([]);
  };

  return (
    <>
      <ActivitiesPage
        activities={finalFilteredActivities}
        loading={loading}
        error={error}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        selected={selected}
        onClearSelection={handleClearSelection}
        userRole={storedUser.roles || []}
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