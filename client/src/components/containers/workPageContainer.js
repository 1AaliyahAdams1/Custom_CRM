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

  // Debug user data
  console.log('=== CONTAINER INIT DEBUG ===');
  console.log('storedUser:', storedUser);
  console.log('userId:', userId);
  console.log('userId exists:', !!userId);

  // ---------------- STATE ----------------
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

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

  // ---------------- FETCH ACTIVITIES ----------------
  const fetchActivities = useCallback(async () => {
    if (!userId) {
      console.log('No userId, setting error message');
      setError("User ID not found. Please log in again.");
      return;
    }

    console.log('=== FETCH ACTIVITIES DEBUG START ===');
    console.log('1. UserId:', userId);
    console.log('2. CurrentSort:', currentSort);
    console.log('3. CurrentFilter:', currentFilter);

    setLoading(true);
    setError(null);
    
    try {
      console.log('4. About to call getWorkPageData...');
      const workPageData = await getWorkPageData(userId, currentSort, currentFilter);
      
      console.log('5. Raw response received:');
      console.log('   - Type:', typeof workPageData);
      console.log('   - Is null?', workPageData === null);
      console.log('   - Is undefined?', workPageData === undefined);
      console.log('   - Keys:', workPageData ? Object.keys(workPageData) : 'No keys (null/undefined)');
      console.log('   - Full object:', JSON.stringify(workPageData, null, 2));
      
      console.log('6. Checking activities property:');
      console.log('   - workPageData.activities exists?', 'activities' in (workPageData || {}));
      console.log('   - workPageData.activities type:', typeof workPageData?.activities);
      console.log('   - workPageData.activities is array?', Array.isArray(workPageData?.activities));
      console.log('   - workPageData.activities length:', workPageData?.activities?.length);
      
      // Extract activities array from the data structure
      let activitiesArray = [];
      
      if (workPageData && Array.isArray(workPageData.activities)) {
        activitiesArray = workPageData.activities;
        console.log('7. SUCCESS: Extracted activities array with length:', activitiesArray.length);
        if (activitiesArray.length > 0) {
          console.log('8. Sample activity:', JSON.stringify(activitiesArray[0], null, 2));
        }
      } else {
        console.log('7. ERROR: Invalid data structure');
        console.log('   - workPageData exists?', !!workPageData);
        console.log('   - workPageData.activities exists?', !!(workPageData?.activities));
        console.log('   - workPageData.activities is array?', Array.isArray(workPageData?.activities));
        console.error('Expected: { activities: [...] }');
        console.error('Received:', workPageData);
      }
      
      console.log('9. About to set state with:', activitiesArray.length, 'activities');
      
      // Set the activities state with the extracted array
      setActivities(activitiesArray);
      
      console.log('10. State set complete');
      
      if (activitiesArray.length === 0) {
        console.warn('11. WARNING: No activities in final array - check filter/sort settings');
      }
      
    } catch (err) {
      console.error('=== FETCH ERROR ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      setError(err.message || "Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
      console.log('=== FETCH ACTIVITIES DEBUG END ===');
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
    console.log('=== MAIN USEEFFECT DEBUG ===');
    console.log('useEffect triggered with userId:', userId);
    console.log('fetchActivities function exists:', typeof fetchActivities);
    
    if (userId) {
      console.log('About to call fetchActivities...');
      fetchActivities();
    } else {
      console.log('Skipping fetchActivities - no userId');
    }
  }, [fetchActivities]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Direct API test - runs once on mount
  useEffect(() => {
    console.log('=== DIRECT API TEST ===');
    console.log('Testing direct API call with userId:', userId);
    
    if (userId) {
      getWorkPageData(userId, 'dueDate', 'all')
        .then(data => {
          console.log('Direct API call SUCCESS:', data);
          console.log('Direct API activities length:', data?.activities?.length);
          // Don't set state here, just log for debugging
        })
        .catch(err => {
          console.error('Direct API call FAILED:', err);
        });
    } else {
      console.log('No userId - cannot test API');
    }
  }, []); // Empty dependency array so it only runs once

  // ---------------- FILTER & SORT HANDLERS ----------------
  const handleSortChange = useCallback((sortBy) => {
    console.log('=== SORT CHANGE DEBUG ===');
    console.log('Changing sort from:', currentSort, 'to:', sortBy);
    setCurrentSort(sortBy);
  }, [currentSort]);

  const handleFilterChange = useCallback((filterType) => {
    console.log('=== FILTER CHANGE DEBUG ===');
    console.log('Changing filter from:', currentFilter, 'to:', filterType);
    setCurrentFilter(filterType);
  }, [currentFilter]);

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
        fetchActivities();
        
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
        fetchActivities();
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
        fetchActivities();
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