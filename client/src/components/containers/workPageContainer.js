import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WorkPage from "../../pages/WorkPage";
import {
  getWorkPageData,
  getActivityForWorkspace,
  completeActivity,
  updateActivity,
  deleteActivity,
  getActivityMetadata
} from "../../services/workService";

const WorkPageContainer = () => {
  const navigate = useNavigate();

  // ---------------- USER DATA ----------------
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = storedUser.UserID || storedUser.id || null;

  // ---------------- STATE ----------------
  // View mode state
  const [viewMode, setViewMode] = useState('activities'); // 'activities' or 'sequence'
  const [sequenceViewData, setSequenceViewData] = useState(null);
  
  const [showEmailForm, setShowEmailForm] = useState({}); 
// key: activityId, value: true/false

  // Activities state
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Filter and sort state
  const [currentSort, setCurrentSort] = useState('dueDate');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [selectedAccountId, setSelectedAccountId] = useState(null);

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

  // ---------------- FETCH DATA ----------------
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
      console.log('Response mode:', response?.mode);
      
      if (response && response.mode === 'sequence') {
        // Sequence view mode
        console.log('Switching to sequence view mode');
        setViewMode('sequence');
        setSequenceViewData(response.data);
        setActivities([]); // Clear activities list
      } else if (response && response.mode === 'activities') {
        // Activities list mode
        console.log('Using activities list mode');
        setViewMode('activities');
        setSequenceViewData(null);
        
        const activitiesArray = Array.isArray(response.data?.activities) 
          ? response.data.activities 
          : [];
        
        console.log('Activities array length:', activitiesArray.length);
        setActivities(activitiesArray);
      } else {
        console.error('Unexpected response format:', response);
        setViewMode('activities');
        setActivities([]);
      }
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || "Failed to load data. Please try again.");
      setViewMode('activities');
      setActivities([]);
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

  const handleAccountFilterChange = useCallback((accountId) => {
    console.log('Account filter changed to:', accountId);
    setSelectedAccountId(accountId);
    
    // Close all tabs when switching views
    setOpenTabs([]);
    setActiveTab(null);
    setTabActivities({});
    setTabLoading({});
  }, []);

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

  const handleSequenceStepClick = async (step) => {
    // If the step has an ActivityID, open it like a regular activity
    if (step.ActivityID) {
      await handleActivityClick({
        ActivityID: step.ActivityID,
        AccountName: sequenceViewData?.account?.AccountName,
        ActivityTypeName: step.ActivityTypeName,
        Status: step.Status
      });
    } else {
      // Step not started yet - show info message
      showStatus(`This step hasn't been started yet. Due: ${new Date(step.estimatedDueDate).toLocaleDateString()}`, 'info');
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

  // ---------------- DRAG AND DROP ----------------
  const handleDragStart = (event, activity) => {
    event.dataTransfer.setData("application/json", JSON.stringify(activity));
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    try {
      const activityData = JSON.parse(event.dataTransfer.getData("application/json"));
      await handleActivityClick(activityData);
    } catch (err) {
      console.error("Error handling drop:", err);
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
    <WorkPage
      // View mode
      viewMode={viewMode}
      sequenceViewData={sequenceViewData}
      
      // Activity data
      activities={activities}
      loading={loading}
      error={error}
      successMessage={successMessage}
      statusMessage={statusMessage}
      statusSeverity={statusSeverity}
      
      // Filter and sort
      currentSort={currentSort}
      currentFilter={currentFilter}
      selectedAccountId={selectedAccountId}
      onSortChange={handleSortChange}
      onFilterChange={handleFilterChange}
      onAccountFilterChange={handleAccountFilterChange}
      
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
      onSequenceStepClick={handleSequenceStepClick}
      onCompleteActivity={handleCompleteActivity}
      onUpdateActivity={handleUpdateActivity}
      onDeleteActivity={handleDeleteActivity}
      
      // Drag and drop
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      
      // Metadata for editing forms
      activityMetadata={activityMetadata}
      
      // Utility functions
      onClearMessages={clearMessages}
      showStatus={showStatus}
    />
  );
};

export default WorkPageContainer;