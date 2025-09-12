import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WorkPage from "../pages/Work/WorkPage";
import {
  getWorkPageData,
  getActivityForWorkspace,
  completeActivity,
  updateActivity,
  deleteActivity,
  getActivityMetadata
} from "../services/workService";

const WorkPageContainer = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Filter and sort state
  const [currentSort, setCurrentSort] = useState('priority');
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

  // ---------------- USER DATA ----------------
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = storedUser.UserID || storedUser.id || null;

  // Debug user ID
  useEffect(() => {
    console.log('Stored user from localStorage:', storedUser);
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.error('No user ID found in localStorage. User object:', storedUser);
      setError("User ID not found. Please log in again.");
    }
  }, [userId, storedUser]);

  // ---------------- FETCH ACTIVITIES ----------------
  const fetchActivities = useCallback(async () => {
    if (!userId) {
      console.error("Cannot fetch activities: userId is null or undefined");
      setError("User ID not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching activities for user ${userId} with sort: ${currentSort}, filter: ${currentFilter}`);
      
      const response = await getWorkPageData(userId, currentSort, currentFilter);
      
      // Enhanced debugging
      console.log('=== API RESPONSE DEBUG ===');
      console.log('Full response object:', response);
      console.log('Response type:', typeof response);
      console.log('Response success:', response?.success);
      console.log('Response data:', response?.data);
      console.log('Response data type:', typeof response?.data);
      
      if (response?.success && response?.data) {
        const activitiesData = response.data.activities || [];
        console.log('Activities extracted:', activitiesData);
        console.log('Activities count:', activitiesData.length);
        console.log('First activity (if any):', activitiesData[0]);
        
        setActivities(activitiesData);
        console.log(`Successfully set ${activitiesData.length} activities in state`);
        
        // Clear any previous errors
        setError(null);
      } else if (Array.isArray(response)) {
        // Handle direct array response
        console.log('Response is direct array:', response);
        setActivities(response);
        setError(null);
      } else if (response?.data && Array.isArray(response.data)) {
        // Handle response.data as array
        console.log('Response.data is array:', response.data);
        setActivities(response.data);
        setError(null);
      } else {
        console.error('Unexpected response format:', response);
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("=== FETCH ACTIVITIES ERROR ===");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to load activities. Please try again.";
      setError(errorMessage);
      setActivities([]); // Clear activities on error
    } finally {
      setLoading(false);
    }
  }, [userId, currentSort, currentFilter]);

  // ---------------- FETCH METADATA ----------------
  const fetchMetadata = useCallback(async () => {
    try {
      console.log('Fetching activity metadata...');
      const response = await getActivityMetadata();
      console.log('Metadata response:', response);
      
      if (response.success && response.data) {
        setActivityMetadata(response.data);
      } else if (response.priorityLevels || response.activityTypes) {
        // Handle direct response format
        setActivityMetadata(response);
      }
    } catch (err) {
      console.error("Error fetching activity metadata:", err);
      // Don't set error for metadata failure, just log it
    }
  }, []);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    console.log('=== EFFECT TRIGGERED ===');
    console.log('userId:', userId);
    console.log('currentSort:', currentSort);
    console.log('currentFilter:', currentFilter);
    console.log('refreshFlag:', refreshFlag);
    
    if (userId) {
      fetchActivities();
    }
  }, [fetchActivities, refreshFlag]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Debug activities state changes
  useEffect(() => {
    console.log('=== ACTIVITIES STATE CHANGED ===');
    console.log('New activities count:', activities.length);
    console.log('Activities:', activities);
  }, [activities]);

  // ---------------- FILTER & SORT HANDLERS ----------------
  const handleSortChange = (sortBy) => {
    console.log('=== SORT CHANGE ===');
    console.log('Previous sort:', currentSort);
    console.log('New sort:', sortBy);
    setCurrentSort(sortBy);
  };

  const handleFilterChange = (filterType) => {
    console.log('=== FILTER CHANGE ===');
    console.log('Previous filter:', currentFilter);
    console.log('New filter:', filterType);
    setCurrentFilter(filterType);
  };

  // ---------------- TAB MANAGEMENT ----------------
  const handleActivityClick = async (activity) => {
    try {
      console.log('=== ACTIVITY CLICK ===');
      console.log('Activity clicked:', activity);
      console.log('Activity ID:', activity.ActivityID);
      
      // Check if tab is already open
      const existingTabIndex = openTabs.findIndex(tab => tab.activityId === activity.ActivityID);
      
      if (existingTabIndex !== -1) {
        // Tab already exists, just activate it
        console.log('Tab already open, activating existing tab at index:', existingTabIndex);
        setActiveTab(existingTabIndex);
        return;
      }

      // Create new tab immediately for better UX
      const newTab = {
        activityId: activity.ActivityID,
        title: activity.AccountName || 'Activity',
        subtitle: activity.ActivityTypeName || 'Activity',
        status: activity.Status || 'normal'
      };

      const newTabs = [...openTabs, newTab];
      const newTabIndex = newTabs.length - 1;
      
      console.log('Creating new tab:', newTab);
      console.log('New tabs array:', newTabs);
      console.log('New tab index:', newTabIndex);
      
      setOpenTabs(newTabs);
      setActiveTab(newTabIndex);
      
      // Set loading state for this tab
      setTabLoading(prev => ({ ...prev, [activity.ActivityID]: true }));

      // Fetch detailed activity data for workspace
      console.log('Fetching detailed activity data...');
      const response = await getActivityForWorkspace(activity.ActivityID, userId);
      console.log('Activity detail response:', response);
      
      if (response.success && response.data) {
        setTabActivities(prev => ({
          ...prev,
          [activity.ActivityID]: response.data
        }));
        console.log('Activity details loaded successfully');
      } else {
        throw new Error("Failed to load activity details");
      }
    } catch (err) {
      console.error("=== ACTIVITY CLICK ERROR ===");
      console.error("Error opening activity tab:", err);
      setError(err.message || "Failed to open activity");
      
      // Remove the tab if we failed to load the activity
      const tabIndex = openTabs.findIndex(tab => tab.activityId === activity.ActivityID);
      if (tabIndex !== -1) {
        handleTabClose(tabIndex);
      }
    } finally {
      setTabLoading(prev => ({ ...prev, [activity.ActivityID]: false }));
    }
  };

  const handleTabClose = (tabIndex) => {
    console.log('=== TAB CLOSE ===');
    console.log('Closing tab at index:', tabIndex);
    
    const tabToClose = openTabs[tabIndex];
    const newTabs = openTabs.filter((_, index) => index !== tabIndex);
    
    console.log('Tab to close:', tabToClose);
    console.log('Remaining tabs:', newTabs);
    
    // Remove activity data from cache
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
    
    // Adjust active tab
    if (activeTab === tabIndex) {
      // If closing active tab, switch to previous tab or first available
      if (newTabs.length > 0) {
        const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        setActiveTab(newActiveIndex);
        console.log('New active tab index:', newActiveIndex);
      } else {
        setActiveTab(null);
        console.log('No tabs remaining, active tab set to null');
      }
    } else if (activeTab > tabIndex) {
      // If closing a tab before active tab, decrease active tab index
      setActiveTab(activeTab - 1);
      console.log('Adjusted active tab index to:', activeTab - 1);
    }
  };

  const handleTabChange = (tabIndex) => {
    console.log('=== TAB CHANGE ===');
    console.log('Changing active tab to index:', tabIndex);
    setActiveTab(tabIndex);
  };

  // ---------------- ACTIVITY ACTIONS ----------------
  const handleCompleteActivity = async (activityId, notes = '') => {
    try {
      console.log('=== COMPLETE ACTIVITY ===');
      console.log('Activity ID:', activityId);
      console.log('Notes:', notes);
      
      const response = await completeActivity(activityId, userId, notes);
      
      if (response.success && response.data) {
        setSuccessMessage(`Activity completed successfully!`);
        setStatusMessage("Activity completed successfully!");
        setStatusSeverity("success");
        
        // Close the completed activity tab
        const tabIndex = openTabs.findIndex(tab => tab.activityId === activityId);
        if (tabIndex !== -1) {
          handleTabClose(tabIndex);
        }

        // If there's a next activity, open it automatically
        if (response.data.nextActivity) {
          setTimeout(() => {
            handleActivityClick(response.data.nextActivity);
          }, 500);
        }

        // Refresh activities list
        setRefreshFlag(flag => !flag);
        
        console.log('Activity completed successfully');
      } else {
        throw new Error(response.message || "Failed to complete activity");
      }
    } catch (err) {
      console.error("=== COMPLETE ACTIVITY ERROR ===");
      console.error("Error completing activity:", err);
      const errorMessage = err.message || "Failed to complete activity";
      setError(errorMessage);
      setStatusMessage(errorMessage);
      setStatusSeverity("error");
    }
  };

  const handleUpdateActivity = async (activityId, updateData) => {
    try {
      console.log('=== UPDATE ACTIVITY ===');
      console.log('Activity ID:', activityId);
      console.log('Update data:', updateData);
      
      const response = await updateActivity(activityId, userId, updateData);
      
      if (response.success && response.data) {
        setSuccessMessage("Activity updated successfully!");
        setStatusMessage("Activity updated successfully!");
        setStatusSeverity("success");
        
        // Update the cached activity data
        setTabActivities(prev => ({
          ...prev,
          [activityId]: response.data.activity || response.data
        }));
        
        // Refresh activities list
        setRefreshFlag(flag => !flag);
      } else {
        throw new Error(response.message || "Failed to update activity");
      }
    } catch (err) {
      console.error("=== UPDATE ACTIVITY ERROR ===");
      console.error("Error updating activity:", err);
      const errorMessage = err.message || "Failed to update activity";
      setError(errorMessage);
      setStatusMessage(errorMessage);
      setStatusSeverity("error");
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      console.log('=== DELETE ACTIVITY ===');
      console.log('Activity ID:', activityId);
      
      const response = await deleteActivity(activityId, userId);
      
      if (response.success && response.data) {
        setSuccessMessage("Activity deleted successfully!");
        setStatusMessage("Activity deleted successfully!");
        setStatusSeverity("success");
        
        // Close the deleted activity tab
        const tabIndex = openTabs.findIndex(tab => tab.activityId === activityId);
        if (tabIndex !== -1) {
          handleTabClose(tabIndex);
        }

        // If there's a suggested next activity, open it
        if (response.data.nextActivity) {
          setTimeout(() => {
            handleActivityClick(response.data.nextActivity);
          }, 500);
        }

        // Refresh activities list
        setRefreshFlag(flag => !flag);
      } else {
        throw new Error(response.message || "Failed to delete activity");
      }
    } catch (err) {
      console.error("=== DELETE ACTIVITY ERROR ===");
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

  // Debug render
  console.log('=== RENDER DEBUG ===');
  console.log('Current activities count:', activities.length);
  console.log('Loading state:', loading);
  console.log('Error state:', error);
  console.log('User ID:', userId);

  return (
    <WorkPage
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
      onSortChange={handleSortChange}
      onFilterChange={handleFilterChange}
      
      // Tab management
      openTabs={openTabs}
      activeTab={activeTab}
      currentActivity={getCurrentActivity()}
      currentTabLoading={getCurrentTabLoading()}
      onTabChange={handleTabChange}
      onTabClose={handleTabClose}
      
      // Activity actions
      onActivityClick={handleActivityClick}
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