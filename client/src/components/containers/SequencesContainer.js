// ========================
// SequencesContainer.jsx
// ========================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getAllSequences,
  createSequence,
  updateSequence,
  deactivateSequence,
  reactivateSequence,
  getAllSequenceItems,
  createSequenceItem,
  updateSequenceItem,
  deactivateSequenceItem, 
  reactivateSequenceItem,
  getAllActivityTypes,
} from '../../services/sequenceService';
import api from '../../utils/api';
import SequencePage from '../../pages/Sequences/SequencesPage';

const SequencesContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial tab based on URL (matching geography pattern)
  const getInitialTab = () => {
    const path = location.pathname;
    // Check if we're on the items route
    if (path.includes('/sequences/items')) return 1;
    // Default to sequences tab
    return 0;
  };

  const [sequences, setSequences] = useState([]);
  const [sequenceLoading, setSequenceLoading] = useState(false);
  const [sequenceItems, setSequenceItems] = useState([]);
  const [sequenceItemLoading, setSequenceItemLoading] = useState(false);
  const [activityTypes, setActivityTypes] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('success');
  const [selected, setSelected] = useState([]);
  const [currentTab, setCurrentTab] = useState(getInitialTab());
  
  // Handle tab changes with URL updates (matching geography pattern)
  const handleTabChange = useCallback((newTab) => {
    setCurrentTab(newTab);
    setSelected([]); // Clear selection when switching tabs
    
    // Update URL based on tab
    switch (newTab) {
      case 0:
        navigate('/sequences', { replace: true });
        break;
      case 1:
        navigate('/sequences/items', { replace: true });
        break;
      default:
        navigate('/sequences', { replace: true });
    }
  }, [navigate]);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null,
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const showStatusMessage = useCallback((message, severity = 'success') => {
    setStatusMessage(message);
    setStatusSeverity(severity);
  }, []);

  const loadActivityTypes = useCallback(async () => {
    try {
      const data = await getAllActivityTypes();
      setActivityTypes(data || []);
    } catch (err) {
      console.error('Error loading activity types:', err);
    }
  }, []);

  const loadSequences = useCallback(async () => {
    try {
      setSequenceLoading(true);
      clearError();
      const data = await getAllSequences(false);
      console.log('🔍 Loaded sequences:', data); // Debug log
      setSequences(data || []);
    } catch (err) {
      console.error('Error loading sequences:', err);
      setError(err.message || 'Failed to load sequences');
      showStatusMessage('Failed to load sequences', 'error');
    } finally {
      setSequenceLoading(false);
    }
  }, [clearError, showStatusMessage]);

  const loadSequenceItems = useCallback(async () => {
    try {
      setSequenceItemLoading(true);
      clearError();
      const data = await getAllSequenceItems();
      console.log('🔍 Loaded sequence items:', data); // Debug log
      setSequenceItems(data || []);
    } catch (err) {
      console.error('Error loading sequence items:', err);
      setError(err.message || 'Failed to load sequence items');
      showStatusMessage('Failed to load sequence items', 'error');
    } finally {
      setSequenceItemLoading(false);
    }
  }, [clearError, showStatusMessage]);

  // Load data based on current tab
  useEffect(() => {
    loadActivityTypes();
    
    // Always load sequences for tab 1 (sequence items need them for lookup)
    if (currentTab === 0) {
      loadSequences();
    } else if (currentTab === 1) {
      // Load both sequences and sequence items for the items tab
      Promise.all([
        loadSequences(),
        loadSequenceItems()
      ]);
    }
  }, [currentTab, loadActivityTypes, loadSequences, loadSequenceItems]);

  const handleSelectClick = useCallback((id) => {
    setSelected(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(selectedId => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, []);

  const handleSelectAllClick = useCallback((event) => {
    if (event.target.checked) {
      let allIds = [];
      switch (currentTab) {
        case 0:
          allIds = sequences.map(sequence => sequence.SequenceID);
          break;
        case 1:
          allIds = sequenceItems.map(item => item.SequenceItemID);
          break;
      }
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  }, [currentTab, sequences, sequenceItems]);

  const handleSequenceView = useCallback((sequence) => {
    navigate(`/sequences/${sequence.SequenceID}`);
  }, [navigate]);

  const handleSequenceEdit = useCallback((sequence) => {
    navigate(`/sequences/edit/${sequence.SequenceID}`);
  }, [navigate]);

  const handleSequenceCreate = useCallback(() => {
    navigate('/sequences/create');
  }, [navigate]);

  const handleSequenceDeactivate = useCallback(async (sequence) => {
    try {
      // Extract the ID - handle both object and direct ID
      const sequenceId = typeof sequence === 'object' ? sequence.SequenceID : sequence;
      
      await deactivateSequence(sequenceId);
      await loadSequences();
      showStatusMessage('Sequence deactivated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to deactivate sequence';
      setError(errorMsg);
      showStatusMessage(errorMsg, 'error');
    }
  }, [loadSequences, showStatusMessage]);

  const handleSequenceReactivate = useCallback(async (sequence) => {
    try {
      // Extract the ID - handle both object and direct ID
      const sequenceId = typeof sequence === 'object' ? sequence.SequenceID : sequence;
      
      await reactivateSequence(sequenceId);
      await loadSequences();
      showStatusMessage('Sequence reactivated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to reactivate sequence';
      setError(errorMsg);
      showStatusMessage(errorMsg, 'error');
    }
  }, [loadSequences, showStatusMessage]);

  const handleSequenceItemView = useCallback((item) => {
    navigate(`/sequences/items/${item.SequenceItemID}`);
  }, [navigate]);

  const handleSequenceItemEdit = useCallback((item) => {
    navigate(`/sequences/items/edit/${item.SequenceItemID}`);
  }, [navigate]);

  const handleSequenceItemCreate = useCallback(() => {
    navigate('/sequences/items/create');
  }, [navigate]);

  const handleSequenceItemDeactivate = useCallback(async (item) => {
    try {
      // Extract the ID - handle both object and direct ID
      const itemId = typeof item === 'object' ? item.SequenceItemID : item;
      
      await deactivateSequenceItem(itemId);  // ✅ Use correct function
      await loadSequenceItems();
      showStatusMessage('Sequence item deactivated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to deactivate sequence item';
      setError(errorMsg);
      showStatusMessage(errorMsg, 'error');
    }
  }, [loadSequenceItems, showStatusMessage]);

  const handleSequenceItemReactivate = useCallback(async (item) => {
    try {
      // Extract the ID - handle both object and direct ID
      const itemId = typeof item === 'object' ? item.SequenceItemID : item;
      
      await reactivateSequenceItem(itemId);  // ✅ Use correct function
      await loadSequenceItems();
      showStatusMessage('Sequence item reactivated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to reactivate sequence item';
      setError(errorMsg);
      showStatusMessage(errorMsg, 'error');
    }
  }, [loadSequenceItems, showStatusMessage]);

  const handleBulkDeactivate = useCallback(async () => {
    try {
      const promises = selected.map(id => {
        switch (currentTab) {
          case 0:
            return deactivateSequence(id);
          case 1:
            return deactivateSequenceItem(id);  // ✅ Use correct function
          default:
            return Promise.resolve();
        }
      });
      
      await Promise.all(promises);
      
      switch (currentTab) {
        case 0:
          await loadSequences();
          break;
        case 1:
          await loadSequenceItems();
          break;
      }
      
      setSelected([]);
      showStatusMessage(`${selected.length} items deactivated successfully`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to deactivate items';
      setError(errorMsg);
      showStatusMessage(errorMsg, 'error');
    }
  }, [selected, currentTab, loadSequences, loadSequenceItems, showStatusMessage]);

  const sequenceProps = {
    sequences,
    loading: sequenceLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    statusMessage,
    statusSeverity,
    setStatusMessage,
    selected: currentTab === 0 ? selected : [],
    onSelectClick: handleSelectClick,
    onSelectAllClick: handleSelectAllClick,
    onDeactivate: handleSequenceDeactivate,
    onReactivate: handleSequenceReactivate,
    onBulkDeactivate: handleBulkDeactivate,
    onEdit: handleSequenceEdit,
    onView: handleSequenceView,
    onCreate: handleSequenceCreate,
  };

  const sequenceItemsProps = {
    sequenceItems,
    sequences,
    activityTypes,
    loading: sequenceItemLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    statusMessage,
    statusSeverity,
    setStatusMessage,
    selected: currentTab === 1 ? selected : [],
    onSelectClick: handleSelectClick,
    onSelectAllClick: handleSelectAllClick,
    onDeactivate: handleSequenceItemDeactivate,
    onReactivate: handleSequenceItemReactivate,
    onBulkDeactivate: handleBulkDeactivate,
    onEdit: handleSequenceItemEdit,
    onView: handleSequenceItemView,
    onCreate: handleSequenceItemCreate,
  };

  return (
    <SequencePage
      {...sequenceProps}
      sequenceItemsProps={sequenceItemsProps}
      currentTab={currentTab}
      onTabChange={handleTabChange}
    />
  );
};

export default SequencesContainer;