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
  const [currentSort, setCurrentSort] = useState('overdue');
  const [currentFilter, setCurrentFilter] = useState('all');

    // Debug logging for state changes
  useEffect(() => {
    console.log('=== FILTER DEBUG ===');
    console.log('Current filter changed to:', currentFilter);
    console.log('Current sort:', currentSort);
  }, [currentFilter, currentSort]);

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

  // ---------------- FETCH ACTIVITIES ----------------
  const fetchActivities = useCallback(async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      return;
    }

    console.log('=== FETCH ACTIVITIES DEBUG ===');
    console.log('UserId:', userId);
    console.log('CurrentSort:', currentSort);
    console.log('CurrentFilter:', currentFilter);
    console.log('About to call getWorkPageData...');


    setLoading(true);
    setError(null);
    
    try {
      const response = await getWorkPageData(userId, currentSort, currentFilter);
      console.log('=== RESPONSE DEBUG ===');
      console.log('Full response:', response);
      console.log('Response.success:', response.success);
      console.log('Response.data:', response.data);
      
      if (response.success && response.data) {
        const activitiesData = response.data.activities || [];  // ✅ FIXED
        console.log('=== ACTIVITIES DEBUG ===');
        console.log('Activities array length:', activitiesData.length);
        console.log('Activities data:', activitiesData);
        console.log('Applied filters from backend:', response.data.appliedFilters);
        console.log('Counts from backend:', response.data.counts);
        console.log('Buckets from backend:', response.data.buckets);
  
        setActivities(activitiesData);
  
        // Additional check
        if (activitiesData.length === 0) {
          console.warn('=== NO ACTIVITIES WARNING ===');
          console.warn('Backend returned 0 activities');
          console.warn('This might be due to the filter:', currentFilter);
          console.warn('Total activities available:', response.data.totalActivities);
          console.warn('Consider changing filter to "all" or "overdue"');
        } 
      } 
      else {
        console.error('=== INVALID RESPONSE ===');
        console.error('Response structure is invalid:', response);
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error('=== FETCH ERROR ===', err);
      setError(err.message || "Failed to load activities. Please try again.");
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
    fetchActivities();
  }, [fetchActivities, refreshFlag]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // ---------------- FILTER & SORT HANDLERS ----------------
  const handleSortChange = (sortBy) => {
    console.log('=== SORT CHANGE DEBUG ===');
    console.log('Changing sort from:', currentSort, 'to:', sortBy);
    setCurrentSort(sortBy);
  };

  const handleFilterChange = (filterType) => {
    console.log('=== FILTER CHANGE DEBUG ===');
    console.log('Changing filter from:', currentFilter, 'to:', filterType);
    setCurrentFilter(filterType);
  };

  // ---------------- TAB MANAGEMENT ----------------
  const handleActivityClick = async (activity) => {
    try {
      console.log('Opening activity in tab:', activity.ActivityID);
      
      // Check if tab is already open
      const existingTabIndex = openTabs.findIndex(tab => tab.activityId === activity.ActivityID);
      
      if (existingTabIndex !== -1) {
        // Tab already exists, just activate it
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
      
      setOpenTabs(newTabs);
      setActiveTab(newTabIndex);
      
      // Set loading state for this tab
      setTabLoading(prev => ({ ...prev, [activity.ActivityID]: true }));

      // Fetch detailed activity data for workspace
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
    const tabToClose = openTabs[tabIndex];
    const newTabs = openTabs.filter((_, index) => index !== tabIndex);
    
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
      } else {
        setActiveTab(null);
      }
    } else if (activeTab > tabIndex) {
      // If closing a tab before active tab, decrease active tab index
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
      console.error("Error updating activity:", err);
      const errorMessage = err.message || "Failed to update activity";
      setError(errorMessage);
      setStatusMessage(errorMessage);
      setStatusSeverity("error");
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      console.log('Deleting activity:', activityId);
      
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