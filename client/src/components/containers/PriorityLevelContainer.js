import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import PriorityLevelPage from '../../pages/PriorityLevelsPage';

const PriorityLevelContainer = () => {
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('success');
  const [selected, setSelected] = useState([]);

  // Fetch all priority levels
  const loadPriorityLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Direct API call to match your backend endpoint
      const response = await api.get('/prioritylevels');
      console.log('Priority levels loaded from backend:', response.data);
      
      setPriorityLevels(response.data || []);
    } catch (err) {
      console.error('Error loading priority levels:', err);
      setError(err.message || 'Failed to load priority levels');
      setPriorityLevels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load priority levels on mount
  useEffect(() => {
    loadPriorityLevels();
  }, [loadPriorityLevels]);

  // Selection handlers
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
      const allIds = priorityLevels.map(priorityLevel => priorityLevel.PriorityLevelID);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  }, [priorityLevels]);

  // CRUD operations
  const handleCreate = useCallback(async (priorityLevelData) => {
    try {
      setLoading(true);
      const response = await api.post('/prioritylevels', priorityLevelData);
      
      if (response.data) {
        await loadPriorityLevels(); // Reload the list
        setSuccessMessage('Priority level created successfully');
        setStatusMessage('Priority level created successfully');
        setStatusSeverity('success');
      }
    } catch (err) {
      console.error('Error creating priority level:', err);
      setError(err.message || 'Failed to create priority level');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPriorityLevels]);

  const handleEdit = useCallback(async (priorityLevel) => {
    console.log('Edit priority level:', priorityLevel);
    // Implement edit logic
    setStatusMessage('Edit functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleView = useCallback((priorityLevel) => {
    console.log('View priority level:', priorityLevel);
    // Implement view logic
    setStatusMessage('View functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleDelete = useCallback(async (priorityLevelId) => {
    try {
      await api.delete(`/prioritylevels/${priorityLevelId}`);
      await loadPriorityLevels();
      setSelected(prev => prev.filter(id => id !== priorityLevelId));
      setSuccessMessage('Priority level deleted successfully');
      setStatusMessage('Priority level deleted successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error deleting priority level:', err);
      setError(err.message || 'Failed to delete priority level');
    }
  }, [loadPriorityLevels]);

  const handleDeactivate = useCallback(async (priorityLevelId) => {
    try {
      await api.patch(`/prioritylevels/${priorityLevelId}/deactivate`);
      await loadPriorityLevels();
      setSuccessMessage('Priority level deactivated successfully');
      setStatusMessage('Priority level deactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error deactivating priority level:', err);
      setError(err.message || 'Failed to deactivate priority level');
    }
  }, [loadPriorityLevels]);

  const handleReactivate = useCallback(async (priorityLevelId) => {
    try {
      await api.patch(`/prioritylevels/${priorityLevelId}/reactivate`);
      await loadPriorityLevels();
      setSuccessMessage('Priority level reactivated successfully');
      setStatusMessage('Priority level reactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error reactivating priority level:', err);
      setError(err.message || 'Failed to reactivate priority level');
    }
  }, [loadPriorityLevels]);

  const handleBulkDeactivate = useCallback(async () => {
    try {
      const promises = selected.map(id => 
        api.patch(`/prioritylevels/${id}/deactivate`)
      );
      
      await Promise.all(promises);
      await loadPriorityLevels();
      setSelected([]);
      setSuccessMessage(`${selected.length} priority levels deactivated successfully`);
      setStatusMessage(`${selected.length} priority levels deactivated successfully`);
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error bulk deactivating priority levels:', err);
      setError(err.message || 'Failed to deactivate priority levels');
    }
  }, [selected, loadPriorityLevels]);

  // Placeholder handlers
  const handleAddNote = useCallback((priorityLevel) => {
    console.log('Add note to priority level:', priorityLevel);
    setStatusMessage('Add note functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleAddAttachment = useCallback((priorityLevel) => {
    console.log('Add attachment to priority level:', priorityLevel);
    setStatusMessage('Add attachment functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleAssignUser = useCallback((priorityLevel) => {
    console.log('Assign user to priority level:', priorityLevel);
    setStatusMessage('Assign user functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  return (
    <PriorityLevelPage
      priorityLevels={priorityLevels}
      loading={loading}
      error={error}
      setError={setError}
      successMessage={successMessage}
      setSuccessMessage={setSuccessMessage}
      statusMessage={statusMessage}
      statusSeverity={statusSeverity}
      setStatusMessage={setStatusMessage}
      selected={selected}
      onSelectClick={handleSelectClick}
      onSelectAllClick={handleSelectAllClick}
      onDeactivate={handleDeactivate}
      onReactivate={handleReactivate}
      onDelete={handleDelete}
      onBulkDeactivate={handleBulkDeactivate}
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleCreate}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
      onAssignUser={handleAssignUser}
      // Popup props (add these if your PriorityLevelPage expects them)
      notesPopupOpen={false}
      setNotesPopupOpen={() => {}}
      attachmentsPopupOpen={false}
      setAttachmentsPopupOpen={() => {}}
      selectedPriorityLevel={null}
      popupLoading={false}
      popupError={null}
      handleSaveNote={() => {}}
      handleDeleteNote={() => {}}
      handleEditNote={() => {}}
      handleUploadAttachment={() => {}}
      handleDeleteAttachment={() => {}}
      handleDownloadAttachment={() => {}}
    />
  );
};

export default PriorityLevelContainer;