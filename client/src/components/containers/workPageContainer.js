import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WorkPage from "../../pages/WorkPage";
import {
  getWorkPageData,
  getUserAccounts,
  getSequenceProgress,
  updateSequenceItemStatus,
  getActivityForWorkspace,
  completeActivity,
  updateActivity,
  deleteActivity,
  getActivityMetadata,
  getOrCreateActivityFromSequenceItem
} from "../../services/workService";
import {
  createNote,
  updateNote,
  deactivateNote,
  reactivateNote,
} from "../../services/noteService";
import EmailDialog from "../../components/EmailDialog";

const WorkPageContainer = () => {
  const navigate = useNavigate();

  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // ---------------- USER DATA ----------------
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = storedUser.UserID || storedUser.id || null;

  // ---------------- STATE ----------------
  const [showEmailForm, setShowEmailForm] = useState({}); 

  // Activities state
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Account and sequence state
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [sequenceProgress, setSequenceProgress] = useState(null);

  // Filter and sort state
  const [currentSort, setCurrentSort] = useState('dueDate');
  const [currentFilter, setCurrentFilter] = useState('all');

  // Tab management state
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabActivities, setTabActivities] = useState({});
  const [tabLoading, setTabLoading] = useState({});

  // Activity metadata
  const [activityMetadata, setActivityMetadata] = useState({
    priorityLevels: [],
    activityTypes: []
  });

  // Status messages
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");

  // ---------------- FETCH USER ACCOUNTS ----------------
  const fetchUserAccounts = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await getUserAccounts(userId);
      
      if (response.success && response.data) {
        setUserAccounts(response.data);
        console.log('User accounts loaded:', response.data.length);
      } else {
        setUserAccounts([]);
      }
    } catch (err) {
      console.error('Error fetching user accounts:', err);
      setUserAccounts([]);
    }
  }, [userId]);

  // ---------------- FETCH WORK PAGE DATA ----------------
  const fetchWorkPageData = useCallback(async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      return;
    }

    console.log('=== FETCH WORK PAGE DATA ===');
    console.log('UserId:', userId);
    console.log('Sort:', currentSort);
    console.log('Filter:', currentFilter);
    console.log('AccountId:', selectedAccountId);

    setLoading(true);
    setError(null);
    
    try {
      const response = await getWorkPageData(userId, currentSort, currentFilter, selectedAccountId);
      
      console.log('Response received:', response);
      
      if (response && response.mode === 'sequence') {
        // Sequence view mode - transform to activities
        console.log('Using sequence mode with smart visibility');
        
        const sequenceData = response.data;
        const transformedActivities = sequenceData.items.map(item => ({
          ActivityID: item.ActivityID,
          AccountID: item.AccountID,
          AccountName: item.AccountName,
          AccountPhone: item.AccountPhone,
          TypeID: item.ActivityTypeID,
          ActivityTypeID: item.ActivityTypeID,
          ActivityTypeName: item.ActivityTypeName,
          ActivityTypeDescription: item.ActivityTypeDescription,
          PriorityLevelID: item.PriorityLevelID,
          PriorityLevelName: item.PriorityLevelName,
          PriorityLevelValue: item.PriorityLevelValue,
          DueToStart: item.DueToStart,
          DueToEnd: item.DueToEnd,
          Completed: item.Completed,
          Status: item.Status,
          SequenceItemID: item.SequenceItemID,
          SequenceItemDescription: item.SequenceItemDescription,
          DaysFromStart: item.DaysFromStart,
          SequenceID: sequenceData.sequence.SequenceID,
          SequenceName: sequenceData.sequence.SequenceName,
          SequenceDescription: sequenceData.sequence.SequenceDescription,
          estimatedDueDate: item.estimatedDueDate,
          Active: true
        }));
        
        setActivities(transformedActivities);
        setSequenceProgress(sequenceData.progress);
        
      } else if (response && response.mode === 'activities') {
        // Activities list mode
        console.log('Using activities list mode');
        
        const activitiesArray = Array.isArray(response.data?.activities) 
          ? response.data.activities 
          : [];
        
        console.log('Activities array length:', activitiesArray.length);
        setActivities(activitiesArray);
        setSequenceProgress(null);
        
      } else {
        console.error('Unexpected response format:', response);
        setActivities([]);
        setSequenceProgress(null);
      }
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || "Failed to load data. Please try again.");
      setActivities([]);
      setSequenceProgress(null);
    } finally {
      setLoading(false);
    }
  }, [userId, currentSort, currentFilter, selectedAccountId]);

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
      fetchUserAccounts();
    }
  }, [fetchUserAccounts]);

  useEffect(() => {
    if (userId) {
      fetchWorkPageData();
    }
  }, [fetchWorkPageData]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // ---------------- FILTER & SORT HANDLERS ----------------
  const handleSortChange = useCallback((sortBy) => {
    console.log('Sort changed to:', sortBy);
    setCurrentSort(sortBy);
  }, []);

  const handleFilterChange = useCallback((filterType) => {
    console.log('Filter changed to:', filterType);
    setCurrentFilter(filterType);
  }, []);

  const handleAccountChange = useCallback((accountId) => {
    console.log('Account changed to:', accountId);
    setSelectedAccountId(accountId);
    
    // Close all tabs when switching accounts/views
    setOpenTabs([]);
    setActiveTab(null);
    setTabActivities({});
    setTabLoading({});
    setSequenceProgress(null);
  }, []);

  // ---------------- REORDER ACTIVITIES ----------------
  const handleReorderActivities = useCallback((fromIndex, toIndex) => {
    console.log('Reordering activities from', fromIndex, 'to', toIndex);
    
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      const [movedActivity] = newActivities.splice(fromIndex, 1);
      newActivities.splice(toIndex, 0, movedActivity);
      return newActivities;
    });
    
    showStatus('Activities reordered successfully', 'success');
  }, []);

  // ---------------- SEQUENCE ITEM CLICK (Auto-generate activity) ----------------
  const handleSequenceItemClick = async (sequenceItem) => {
    try {
      console.log('Sequence item clicked:', sequenceItem);
      
      // Check if activity already exists
      if (sequenceItem.ActivityID) {
        // Activity exists, open it normally
        handleActivityClick(sequenceItem);
        return;
      }
      
      // Activity doesn't exist, create it
      setLoading(true);
      showStatus('Creating activity...', 'info');
      
      const response = await getOrCreateActivityFromSequenceItem(
        userId,
        sequenceItem.SequenceItemID,
        sequenceItem.AccountID
      );
      
      if (response.success && response.data.activity) {
        showStatus(
          response.data.created ? 'Activity created successfully!' : 'Activity loaded',
          'success'
        );
        
        // Refresh the list to show the new activity
        await fetchWorkPageData();
        
        // Open the activity in a tab
        setTimeout(() => {
          handleActivityClick(response.data.activity);
        }, 300);
      } else {
        throw new Error('Failed to create or load activity');
      }
    } catch (err) {
      console.error('Error handling sequence item click:', err);
      const errorMessage = err.message || 'Failed to create activity';
      setError(errorMessage);
      showStatus(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- TAB MANAGEMENT ----------------
  const handleActivityClick = async (activity) => {
    try {
      console.log('Opening activity in tab:', activity.ActivityID);
      
      const existingTabIndex = openTabs.findIndex(tab => tab.activityId === activity.ActivityID);
      
      if (existingTabIndex !== -1) {
        setActiveTab(existingTabIndex);
        return;
      }

      const newTab = {
        activityId: activity.ActivityID,
        title: activity.AccountName || 'Activity',
        subtitle: activity.ActivityTypeName || 'Activity',
        status: activity.Status || 'normal'
      };

      const newTabs = [...openTabs, newTab];
      const newTabIndex = newTabs.length - 1;
      
      setOpenTabs(newTabs);
      setActiveTab(newTabIndex);
      
      setTabLoading(prev => ({ ...prev, [activity.ActivityID]: true }));

      const response = await getActivityForWorkspace(activity.ActivityID, userId);
      
      if (response.success && response.data) {
        setTabActivities(prev => ({
          ...prev,
          [activity.ActivityID]: response.data
        }));
      } else {
        throw new Error("Failed to load activity details");
      }
    } catch (err) {
      console.error("Error opening activity tab:", err);
      setError(err.message || "Failed to open activity");
      
      const tabIndex = openTabs.findIndex(tab => tab.activityId === activity.ActivityID);
      if (tabIndex !== -1) {
        handleTabClose(tabIndex);
      }
    } finally {
      setTabLoading(prev => ({ ...prev, [activity.ActivityID]: false }));
    }
  };

  const handleTabClose = (tabIndex) => {
    const tabToClose = openTabs[tabIndex];
    const newTabs = openTabs.filter((_, index) => index !== tabIndex);
    
    if (tabToClose) {
      setTabActivities(prev => {
        const updated = { ...prev };
        delete updated[tabToClose.activityId];
        return updated;
      });
      
      setTabLoading(prev => {
        const updated = { ...prev };
        delete updated[tabToClose.activityId];
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
      console.log('Completing activity:', activityId);
      
      const response = await completeActivity(activityId, userId, notes);
      
      if (response.success && response.data) {
        setSuccessMessage(`Activity completed successfully!`);
        setStatusMessage("Activity completed successfully!");
        setStatusSeverity("success");
        
        const tabIndex = openTabs.findIndex(tab => tab.activityId === activityId);
        if (tabIndex !== -1) {
          handleTabClose(tabIndex);
        }

        if (response.data.nextActivity) {
          setTimeout(() => {
            handleActivityClick(response.data.nextActivity);
          }, 500);
        }

        fetchWorkPageData();
      } else {
        throw new Error(response.message || "Failed to complete activity");
      }
    } catch (err) {
      console.error("Error completing activity:", err);
      const errorMessage = err.message || "Failed to complete activity";
      setError(errorMessage);
      setStatusMessage(errorMessage);
      setStatusSeverity("error");
    }
  };
  
  const handleUpdateActivity = async (activityId, updateData) => {
    try {
      console.log('Updating activity:', activityId, updateData);
      
      const response = await updateActivity(activityId, userId, updateData);
      
      if (response.success && response.data) {
        setSuccessMessage("Activity updated successfully!");
        setStatusMessage("Activity updated successfully!");
        setStatusSeverity("success");
        
        setTabActivities(prev => ({
          ...prev,
          [activityId]: response.data.activity || response.data
        }));
        
        fetchWorkPageData();
      } else {
        throw new Error(response.message || "Failed to update activity");
      }
    } catch (err) {
      console.error("Error updating activity:", err);
      const errorMessage = err.message || "Failed to update activity";
      setError(errorMessage);
      setStatusMessage(errorMessage);
      setStatusSeverity("error");
    }
  };

  const handleSendEmailClick = (activityId) => {
    setShowEmailForm(prev => ({ ...prev, [activityId]: true }));
  };

  const handleCloseEmailDialog = (activityId) => {
    setShowEmailForm(prev => ({ ...prev, [activityId]: false }));
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      console.log('Deleting activity:', activityId);
      
      const response = await deleteActivity(activityId, userId);
      
      if (response.success && response.data) {
        setSuccessMessage("Activity deleted successfully!");
        setStatusMessage("Activity deleted successfully!");
        setStatusSeverity("success");
        
        const tabIndex = openTabs.findIndex(tab => tab.activityId === activityId);
        if (tabIndex !== -1) {
          handleTabClose(tabIndex);
        }

        if (response.data.nextActivity) {
          setTimeout(() => {
            handleActivityClick(response.data.nextActivity);
          }, 500);
        }

        fetchWorkPageData();
      } else {
        throw new Error(response.message || "Failed to delete activity");
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
      const errorMessage = err.message || "Failed to delete activity";
      setError(errorMessage);
      setStatusMessage(errorMessage);
      setStatusSeverity("error");
    }
  };

  // ---------------- NOTES ----------------
  const handleAddNote = (account) => {
    setSelectedAccount(account);
    setNotesPopupOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    setStatusMessage("Note added successfully!");
    setStatusSeverity("success");
    setRefreshFlag((flag) => !flag);
  };

  const handleEditNote = async (noteData) => {
    setStatusMessage("Note updated successfully!");
    setStatusSeverity("success");
    setRefreshFlag((flag) => !flag);
  };

  const handleDeactivateNote = async (noteId) => {
    try {
      await deactivateNote(noteId);
      setStatusMessage("Note deactivated successfully!");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to deactivate note");
      setStatusSeverity("error");
      throw err;
    }
  };

  const handleReactivateNote = async (noteId) => {
    try {
      await reactivateNote(noteId);
      setStatusMessage("Note reactivated successfully!");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to reactivate note");
      setStatusSeverity("error");
      throw err;
    }
  };
 
  // ---------------- DRAG AND DROP ----------------
  
  // Drag and drop for OPENING activities in workspace
  const handleDragStart = (event, activity) => {
    event.dataTransfer.setData("application/json", JSON.stringify(activity));
    event.dataTransfer.effectAllowed = "copy";
  };

 const handleDrop = async (event) => {
  event.preventDefault();
  try {
    const droppedData = JSON.parse(event.dataTransfer.getData("application/json"));
    console.log('Dropped data:', droppedData);
    
    // Check if it's a sequence item without an activity
    if (droppedData.SequenceItemID && !droppedData.ActivityID) {
      // This is a sequence item that needs activity creation
      await handleSequenceItemClick(droppedData);
    } else if (droppedData.ActivityID) {
      // This is an existing activity
      await handleActivityClick(droppedData);
    } else {
      console.warn('Unknown drop data format');
    }
  } catch (err) {
    console.error("Error handling drop:", err);
    showStatus('Failed to open item', 'error');
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
    setSuccessMessage("");
    setStatusMessage("");
  };

  // ---------------- GET CURRENT TAB ACTIVITY ----------------
  const getCurrentActivity = () => {
    if (activeTab === null || !openTabs[activeTab]) return null;
    const currentTab = openTabs[activeTab];
    return tabActivities[currentTab.activityId] || null;
  };

  const getCurrentTabLoading = () => {
    if (activeTab === null || !openTabs[activeTab]) return false;
    const currentTab = openTabs[activeTab];
    return tabLoading[currentTab.activityId] || false;
  };

  return (
    <>
      <WorkPage
        // Activity data
        activities={activities}
        loading={loading}
        error={error}
        successMessage={successMessage}
        statusMessage={statusMessage}
        statusSeverity={statusSeverity}
        
        // Account and sequence
        userAccounts={userAccounts}
        selectedAccountId={selectedAccountId}
        sequenceProgress={sequenceProgress}
        onAccountChange={handleAccountChange}
        onSequenceItemClick={handleSequenceItemClick}
        
        // Filter and sort
        currentSort={currentSort}
        currentFilter={currentFilter}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        
        // Tab management
        openTabs={openTabs}
        activeTab={activeTab}
        currentActivity={getCurrentActivity()}
        currentTabLoading={getCurrentTabLoading()}
        onTabChange={handleTabChange}
        onTabClose={handleTabClose}
        
        onSendEmailClick={handleSendEmailClick}
        showEmailForm={showEmailForm}
        
        // Activity actions
        onActivityClick={handleActivityClick}
        onCompleteActivity={handleCompleteActivity}
        onUpdateActivity={handleUpdateActivity}
        onDeleteActivity={handleDeleteActivity}

        // Notes
        onAddNote={handleAddNote}
        notesPopupOpen={notesPopupOpen}
        setNotesPopupOpen={setNotesPopupOpen}
        handleSaveNote={handleSaveNote}
        handleEditNote={handleEditNote}
        handleDeactivateNote={handleDeactivateNote}
        handleReactivateNote={handleReactivateNote}
        
        // Drag and drop
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onReorderActivities={handleReorderActivities}
        
        // Metadata for editing forms
        activityMetadata={activityMetadata}
        
        // Utility functions
        onClearMessages={clearMessages}
        showStatus={showStatus}
      />
      
      {/* Email Dialog for each activity that has email form open */}
      {Object.keys(showEmailForm).map((activityId) => 
        showEmailForm[activityId] && (
          <EmailDialog
            key={`email-${activityId}`}
            open={true}
            onClose={() => handleCloseEmailDialog(Number(activityId))}
            activity={tabActivities[activityId]}
          />
        )
      )}
    </>
  );
};

export default WorkPageContainer;