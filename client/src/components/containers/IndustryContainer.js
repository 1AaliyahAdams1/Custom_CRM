import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import IndustryPage from '../../pages/Industry/IndustryPage';

const IndustryContainer = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('success');
  const [selected, setSelected] = useState([]);

  // Fetch all industries
  const loadIndustries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Direct API call to match your backend endpoint
      const response = await api.get('/industries');
      console.log('Industries loaded from backend:', response.data);
      
      setIndustries(response.data || []);
    } catch (err) {
      console.error('Error loading industries:', err);
      setError(err.message || 'Failed to load industries');
      setIndustries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load industries on mount
  useEffect(() => {
    loadIndustries();
  }, [loadIndustries]);

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
      const allIds = industries.map(industry => industry.IndustryID);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  }, [industries]);

  // CRUD operations
  const handleCreate = useCallback(async (industryData) => {
    try {
      setLoading(true);
      const response = await api.post('/industries', industryData);
      
      if (response.data) {
        await loadIndustries(); // Reload the list
        setSuccessMessage('Industry created successfully');
        setStatusMessage('Industry created successfully');
        setStatusSeverity('success');
      }
    } catch (err) {
      console.error('Error creating industry:', err);
      setError(err.message || 'Failed to create industry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadIndustries]);

  const handleEdit = useCallback(async (industry) => {
    console.log('Edit industry:', industry);
    // Implement edit logic
    setStatusMessage('Edit functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleView = useCallback((industry) => {
    console.log('View industry:', industry);
    // Implement view logic
    setStatusMessage('View functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleDelete = useCallback(async (industryId) => {
    try {
      await api.delete(`/industries/${industryId}`);
      await loadIndustries();
      setSelected(prev => prev.filter(id => id !== industryId));
      setSuccessMessage('Industry deleted successfully');
      setStatusMessage('Industry deleted successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error deleting industry:', err);
      setError(err.message || 'Failed to delete industry');
    }
  }, [loadIndustries]);

  const handleDeactivate = useCallback(async (industryId) => {
    try {
      await api.patch(`/industries/${industryId}/deactivate`);
      await loadIndustries();
      setSuccessMessage('Industry deactivated successfully');
      setStatusMessage('Industry deactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error deactivating industry:', err);
      setError(err.message || 'Failed to deactivate industry');
    }
  }, [loadIndustries]);

  const handleReactivate = useCallback(async (industryId) => {
    try {
      await api.patch(`/industries/${industryId}/reactivate`);
      await loadIndustries();
      setSuccessMessage('Industry reactivated successfully');
      setStatusMessage('Industry reactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error reactivating industry:', err);
      setError(err.message || 'Failed to reactivate industry');
    }
  }, [loadIndustries]);

  const handleBulkDeactivate = useCallback(async () => {
    try {
      const promises = selected.map(id => 
        api.patch(`/industries/${id}/deactivate`)
      );
      
      await Promise.all(promises);
      await loadIndustries();
      setSelected([]);
      setSuccessMessage(`${selected.length} industries deactivated successfully`);
      setStatusMessage(`${selected.length} industries deactivated successfully`);
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error bulk deactivating industries:', err);
      setError(err.message || 'Failed to deactivate industries');
    }
  }, [selected, loadIndustries]);

  // Placeholder handlers
  const handleAddNote = useCallback((industry) => {
    console.log('Add note to industry:', industry);
    setStatusMessage('Add note functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleAddAttachment = useCallback((industry) => {
    console.log('Add attachment to industry:', industry);
    setStatusMessage('Add attachment functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleAssignUser = useCallback((industry) => {
    console.log('Assign user to industry:', industry);
    setStatusMessage('Assign user functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  return (
    <IndustryPage
      industries={industries}
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
    />
  );
};

export default IndustryContainer;