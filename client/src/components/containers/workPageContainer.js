import React, { useState, useEffect, useCallback } from "react";
import WorkPage from "../../pages/WorkPage";
import {
  getWorkPageActivities,
  getAccountActivitiesGrouped,
  completeActivity,
  updateActivity,
  updateActivityDueDateWithCascade,
  deleteActivity,
  getActivityMetadata,
} from "../../services/workService";
import {
  createNote,
  updateNote,
  deactivateNote,
  reactivateNote,
} from "../../services/noteService";
import EmailDialog from "../../components/dialogs/EmailDialog";
import NotesPopup from "../../components/dialogs/NotesComponent";

const WorkPageContainer = () => {
  // User data
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = storedUser.UserID || storedUser.id || null;

  // State
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSort, setCurrentSort] = useState('dueDate');
  const [currentFilter, setCurrentFilter] = useState('all');

  // Tab management
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState({});

  // Activity metadata
  const [activityMetadata, setActivityMetadata] = useState({
    priorityLevels: [],
    activityTypes: []
  });

  // Status messages
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");

  // Email dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailDialogActivity, setEmailDialogActivity] = useState(null);

  // Notes popup state
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [notesPopupActivity, setNotesPopupActivity] = useState(null);

  // Dragging state
  const [draggedIndex, setDraggedIndex] = useState(null);

  // ---------------- FETCH ACTIVITIES ----------------
  const fetchActivities = useCallback(async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await getWorkPageActivities(userId, currentSort, currentFilter);
      
      if (response.success && response.data) {
        setActivities(response.data.activities || []);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || "Failed to load activities. Please try again.");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [userId, currentSort, currentFilter]);

  // ---------------- FETCH METADATA ----------------
  const fetchMetadata = useCallback(async () => {
    try {
      const response = await getActivityMetadata();
      if (response.success && response.data) {
        setActivityMetadata(response.data);
      }
    } catch (err) {
      console.error("Error fetching activity metadata:", err);
    }
  }, []);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [fetchActivities]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // ---------------- FILTER & SORT HANDLERS ----------------
  const handleSortChange = useCallback((sortBy) => {
    setCurrentSort(sortBy);
  }, []);

  const handleFilterChange = useCallback((filterType) => {
    setCurrentFilter(filterType);
  }, []);

  // ---------------- REORDER ACTIVITIES (UI only) ----------------
  const handleReorderActivities = useCallback((fromIndex, toIndex) => {
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      const [movedActivity] = newActivities.splice(fromIndex, 1);
      newActivities.splice(toIndex, 0, movedActivity);
      return newActivities;
    });
    
    showStatus('Activities reordered', 'success');
  }, []);

  // ---------------- TAB MANAGEMENT ----------------
  const handleActivityClick = async (activity) => {
    try {
      const accountId = activity.AccountID;
      
      const existingTabIndex = openTabs.findIndex(tab => tab.accountId === accountId);
      
      if (existingTabIndex !== -1) {
        setActiveTab(existingTabIndex);
        return;
      }

      const newTab = {
        accountId: accountId,
        accountName: activity.AccountName,
        currentActivityId: activity.ActivityID
      };

      const newTabs = [...openTabs, newTab];
      const newTabIndex = newTabs.length - 1;
      
      setOpenTabs(newTabs);
      setActiveTab(newTabIndex);
      
      setTabLoading(prev => ({ ...prev, [accountId]: true }));

      const response = await getAccountActivitiesGrouped(userId, accountId);
      
      if (response.success && response.data) {
        const dataWithNotes = {
          ...response.data,
          previousActivities: (response.data.previousActivities || []).map(act => ({
            ...act,
            Notes: act.Notes || []
          })),
          currentActivities: (response.data.currentActivities || []).map(act => ({
            ...act,
            Notes: act.Notes || []
          }))
        };
        
        setTabData(prev => ({
          ...prev,
          [accountId]: dataWithNotes
        }));
      } else {
        throw new Error("Failed to load account activities");
      }
    } catch (err) {
      console.error("Error opening account tab:", err);
      showStatus(err.message || "Failed to open account", 'error');
      
      const tabIndex = openTabs.findIndex(tab => tab.accountId === activity.AccountID);
      if (tabIndex !== -1) {
        handleTabClose(tabIndex);
      }
    } finally {
      setTabLoading(prev => ({ ...prev, [activity.AccountID]: false }));
    }
  };

  const handleTabClose = (tabIndex) => {
    const tabToClose = openTabs[tabIndex];
    const newTabs = openTabs.filter((_, index) => index !== tabIndex);
    
    if (tabToClose) {
      setTabData(prev => {
        const updated = { ...prev };
        delete updated[tabToClose.accountId];
        return updated;
      });
      
      setTabLoading(prev => {
        const updated = { ...prev };
        delete updated[tabToClose.accountId];
        return updated;
      });
    }

    setOpenTabs(newTabs);
    
    if (activeTab === tabIndex) {
      if (newTabs.length > 0) {
        const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        setActiveTab(newActiveIndex);
      } else {
        setActiveTab(null);
      }
    } else if (activeTab > tabIndex) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  // ---------------- ACTIVITY ACTIONS ----------------
  const handleCompleteActivity = async (activityId, notes = '') => {
    try {
      const response = await completeActivity(activityId, userId, notes);
      
      if (response.success) {
        showStatus('Activity completed successfully!', 'success');
        
        await fetchActivities();
        
        if (activeTab !== null && openTabs[activeTab]) {
          const accountId = openTabs[activeTab].accountId;
          const tabResponse = await getAccountActivitiesGrouped(userId, accountId);
          if (tabResponse.success) {
            const dataWithNotes = {
              ...tabResponse.data,
              previousActivities: (tabResponse.data.previousActivities || []).map(act => ({
                ...act,
                Notes: act.Notes || []
              })),
              currentActivities: (tabResponse.data.currentActivities || []).map(act => ({
                ...act,
                Notes: act.Notes || []
              }))
            };
            
            setTabData(prev => ({
              ...prev,
              [accountId]: dataWithNotes
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error completing activity:", err);
      showStatus(err.message || "Failed to complete activity", 'error');
    }
  };
  
  const handleUpdateActivity = async (activityId, updateData) => {
    try {
      const response = await updateActivity(activityId, userId, updateData);
      
      if (response.success) {
        showStatus('Activity updated successfully!', 'success');
        
        await fetchActivities();
        
        if (activeTab !== null && openTabs[activeTab]) {
          const accountId = openTabs[activeTab].accountId;
          const tabResponse = await getAccountActivitiesGrouped(userId, accountId);
          if (tabResponse.success) {
            const dataWithNotes = {
              ...tabResponse.data,
              previousActivities: (tabResponse.data.previousActivities || []).map(act => ({
                ...act,
                Notes: act.Notes || []
              })),
              currentActivities: (tabResponse.data.currentActivities || []).map(act => ({
                ...act,
                Notes: act.Notes || []
              }))
            };
            
            setTabData(prev => ({
              ...prev,
              [accountId]: dataWithNotes
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error updating activity:", err);
      showStatus(err.message || "Failed to update activity", 'error');
    }
  };

  const handleUpdateDueDateWithCascade = async (activityId, newDueDate) => {
    try {
      const response = await updateActivityDueDateWithCascade(activityId, userId, newDueDate);
      
      if (response.success) {
        showStatus('Due date updated (subsequent activities adjusted)', 'success');
        
        await fetchActivities();
        
        if (activeTab !== null && openTabs[activeTab]) {
          const accountId = openTabs[activeTab].accountId;
          const tabResponse = await getAccountActivitiesGrouped(userId, accountId);
          if (tabResponse.success) {
            const dataWithNotes = {
              ...tabResponse.data,
              previousActivities: (tabResponse.data.previousActivities || []).map(act => ({
                ...act,
                Notes: act.Notes || []
              })),
              currentActivities: (tabResponse.data.currentActivities || []).map(act => ({
                ...act,
                Notes: act.Notes || []
              }))
            };
            
            setTabData(prev => ({
              ...prev,
              [accountId]: dataWithNotes
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error updating due date:", err);
      showStatus(err.message || "Failed to update due date", 'error');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const response = await deleteActivity(activityId, userId);
      
      if (response.success) {
        showStatus('Activity deleted successfully!', 'success');
        
        await fetchActivities();
        
        if (activeTab !== null && openTabs[activeTab]) {
          const accountId = openTabs[activeTab].accountId;
          const tabResponse = await getAccountActivitiesGrouped(userId, accountId);
          if (tabResponse.success) {
            const dataWithNotes = {
              ...tabResponse.data,
              previousActivities: (tabResponse.data.previousActivities || []).map(act => ({
                ...act,
                Notes: act.Notes || []
              })),
              currentActivities: (tabResponse.data.currentActivities || []).map(act => ({
                ...act,
                Notes: act.Notes || []
              }))
            };
            
            setTabData(prev => ({
              ...prev,
              [accountId]: dataWithNotes
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
      showStatus(err.message || "Failed to delete activity", 'error');
    }
  };

  // ---------------- EMAIL & NOTES ----------------
  const handleSendEmailClick = (activity) => {
    setEmailDialogActivity(activity);
    setEmailDialogOpen(true);
  };

  const handleCloseEmailDialog = () => {
    setEmailDialogOpen(false);
    setEmailDialogActivity(null);
  };

  const handleAddNoteClick = (activity) => {
    setNotesPopupActivity(activity);
    setNotesPopupOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      await createNote(noteData);
      showStatus('Note added successfully!', 'success');
      await refreshCurrentTabData();
    } catch (err) {
      showStatus(err.message || 'Failed to add note', 'error');
      throw err;
    }
  };

  const handleEditNote = async (noteId, noteData) => {
    try {
      await updateNote(noteId, noteData);
      showStatus('Note updated successfully!', 'success');
      await refreshCurrentTabData();
    } catch (err) {
      showStatus(err.message || 'Failed to update note', 'error');
      throw err;
    }
  };

  const handleDeactivateNote = async (noteId) => {
    try {
      await deactivateNote(noteId);
      showStatus('Note deactivated successfully!', 'success');
      await refreshCurrentTabData();
    } catch (err) {
      showStatus(err.message || 'Failed to deactivate note', 'error');
      throw err;
    }
  };

  const handleReactivateNote = async (noteId) => {
    try {
      await reactivateNote(noteId);
      showStatus('Note reactivated successfully!', 'success');
      await refreshCurrentTabData();
    } catch (err) {
      showStatus(err.message || 'Failed to reactivate note', 'error');
      throw err;
    }
  };

  // ---------------- DRAG AND DROP ----------------
  const handleDragStart = (event, index, activity) => {
    setDraggedIndex(index);
    event.dataTransfer.setData("application/json", JSON.stringify(activity));
    event.dataTransfer.effectAllowed = "copyMove";
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDraggedIndex(null);
    
    try {
      const droppedData = JSON.parse(event.dataTransfer.getData("application/json"));
      await handleActivityClick(droppedData);
    } catch (err) {
      console.error("Error handling drop:", err);
      showStatus('Failed to open activity', 'error');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  // ---------------- STATUS HELPERS ----------------
  const showStatus = (message, severity = 'success') => {
    setStatusMessage(message);
    setStatusSeverity(severity);
  };

  const clearMessages = () => {
    setError(null);
    setStatusMessage("");
  };

  // ---------------- GET CURRENT TAB DATA ----------------
  const getCurrentTabData = () => {
    if (activeTab === null || !openTabs[activeTab]) return null;
    const currentTab = openTabs[activeTab];
    return tabData[currentTab.accountId] || null;
  };

  const getCurrentTabLoading = () => {
    if (activeTab === null || !openTabs[activeTab]) return false;
    const currentTab = openTabs[activeTab];
    return tabLoading[currentTab.accountId] || false;
  };

  // ---------------- REFRESH CURRENT TAB DATA ----------------
  const refreshCurrentTabData = async () => {
    if (activeTab !== null && openTabs[activeTab]) {
      const accountId = openTabs[activeTab].accountId;
      try {
        const tabResponse = await getAccountActivitiesGrouped(userId, accountId);
        if (tabResponse.success) {
          const dataWithNotes = {
            ...tabResponse.data,
            previousActivities: (tabResponse.data.previousActivities || []).map(act => ({
              ...act,
              Notes: act.Notes || []
            })),
            currentActivities: (tabResponse.data.currentActivities || []).map(act => ({
              ...act,
              Notes: act.Notes || []
            }))
          };
          
          setTabData(prev => ({
            ...prev,
            [accountId]: dataWithNotes
          }));
        }
      } catch (err) {
        console.error('Error refreshing tab data:', err);
      }
    }
  };

  return (
    <>
      <WorkPage
        activities={activities}
        loading={loading}
        error={error}
        statusMessage={statusMessage}
        statusSeverity={statusSeverity}
        
        currentSort={currentSort}
        currentFilter={currentFilter}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        
        openTabs={openTabs}
        activeTab={activeTab}
        currentTabData={getCurrentTabData()}
        currentTabLoading={getCurrentTabLoading()}
        onTabChange={handleTabChange}
        onTabClose={handleTabClose}
        
        onActivityClick={handleActivityClick}
        onCompleteActivity={handleCompleteActivity}
        onUpdateActivity={handleUpdateActivity}
        onUpdateDueDateWithCascade={handleUpdateDueDateWithCascade}
        onDeleteActivity={handleDeleteActivity}
        onSendEmailClick={handleSendEmailClick}
        onAddNoteClick={handleAddNoteClick}
        
        userId={userId}
        refreshCurrentTabData={refreshCurrentTabData}
        
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onReorderActivities={handleReorderActivities}
        draggedIndex={draggedIndex}
        
        activityMetadata={activityMetadata}
        
        onClearMessages={clearMessages}
        showStatus={showStatus}
      />
      
      {emailDialogOpen && emailDialogActivity && (
        <EmailDialog
          open={emailDialogOpen}
          onClose={handleCloseEmailDialog}
          activity={emailDialogActivity}
        />
      )}

      {notesPopupOpen && notesPopupActivity && (
        <NotesPopup
          open={notesPopupOpen}
          onClose={() => {
            setNotesPopupOpen(false);
            setNotesPopupActivity(null);
          }}
          entityType="Activity"
          entityId={notesPopupActivity.ActivityID}
          entityName={notesPopupActivity.ActivityTypeName}
          onSave={handleSaveNote}
          onEdit={handleEditNote}
          onDeactivate={handleDeactivateNote}
          onReactivate={handleReactivateNote}
          showExistingNotes={true}
          maxLength={255}
          required={false}
        />
      )}
    </>
  );
};

export default WorkPageContainer;