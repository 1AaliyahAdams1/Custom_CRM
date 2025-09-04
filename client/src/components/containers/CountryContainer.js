import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllCountries,
  getCountryDetails,
  getCountriesByCurrency,
  searchCountries,
  createCountry,
  updateCountry,
  deactivateCountry,
  reactivateCountry,
  deleteCountry,
  getCountryByCode,
  getActiveCountries
} from '../../services/countryService';
import CountryPage from "../../pages/GeographicData/CountryPage";

const CountryContainer = () => {
    const navigate = useNavigate();
  // State management
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('success');
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({
    onlyActive: true,
    searchTerm: '',
    currencyId: null
  });

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Show status message helper
  const showStatusMessage = useCallback((message, severity = 'success') => {
    setStatusMessage(message);
    setStatusSeverity(severity);
  }, []);

  // Load countries based on current filters
  const loadCountries = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      let data;
      
      if (filters.searchTerm) {
        data = await searchCountries(filters.searchTerm);
      } else if (filters.currencyId) {
        data = await getCountriesByCurrency(filters.currencyId);
      } else if (filters.onlyActive) {
        data = await getAllCountries();
      } else {
        data = await getAllCountries(filters.onlyActive);
      }
      
      setCountries(data || []);
    } catch (err) {
      console.error('Error loading countries:', err);
      setError(err.message || 'Failed to load countries');
      showStatusMessage('Failed to load countries', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, clearError, showStatusMessage]);

  // Initial load
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  // Selection handlers
  const handleSelectClick = useCallback((countryId) => {
    setSelected(prevSelected => {
      if (prevSelected.includes(countryId)) {
        return prevSelected.filter(id => id !== countryId);
      } else {
        return [...prevSelected, countryId];
      }
    });
  }, []);

  const handleSelectAllClick = useCallback((event) => {
    if (event.target.checked) {
      setSelected(countries.map(country => country.CountryID));
    } else {
      setSelected([]);
    }
  }, [countries]);

  // Get country details
  const handleView = useCallback(async (country) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await getCountryDetails(country.CountryID);
      setSelectedCountry(response.data);
      showStatusMessage('Country details loaded');
      
      // Here you could navigate to a details page or open a modal
      console.log('View country:', response.data);
    } catch (err) {
      console.error('Error fetching country details:', err);
      setError(err.message || 'Failed to fetch country details');
      showStatusMessage('Failed to load country details', 'error');
    } finally {
      setLoading(false);
    }
  }, [clearError, showStatusMessage]);

  // Create new country
  const handleCreate = useCallback(() => {
     navigate('/countries/add'); 
  }, [navigate]);

  // Edit country
  const handleEdit = useCallback((country) => {
    // Here you would open an edit country dialog/modal
    console.log('Edit country:', country);
    showStatusMessage('Edit country functionality to be implemented', 'info');
  }, [showStatusMessage]);

  // Create country
  const handleCreateCountry = useCallback(async (countryData) => {
    try {
      setLoading(true);
      clearError();
      
      // Validate required fields
      if (!countryData.CountryName || !countryData.CountryCode) {
        throw new Error('Country name and code are required');
      }
      
      const newCountry = await createCountry(countryData);
      
      // Reload to ensure consistency
      await loadCountries();
      
      setSuccessMessage('Country created successfully');
      showStatusMessage('Country created successfully');
      
      return newCountry;
    } catch (err) {
      console.error('Error creating country:', err);
      setError(err.message || 'Failed to create country');
      showStatusMessage('Failed to create country', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, loadCountries, showStatusMessage]);

  // Update country
  const handleUpdateCountry = useCallback(async (countryId, countryData) => {
    try {
      setLoading(true);
      clearError();
      
      const updatedCountry = await updateCountry(countryId, countryData);
      
      // Update local state
      setCountries(prevCountries => 
        prevCountries.map(country => 
          country.CountryID === countryId ? updatedCountry : country
        )
      );
      
      // Update selected country if it's the one being updated
      if (selectedCountry && selectedCountry.CountryID === countryId) {
        setSelectedCountry(updatedCountry);
      }
      
      setSuccessMessage('Country updated successfully');
      showStatusMessage('Country updated successfully');
      
      return updatedCountry;
    } catch (err) {
      console.error('Error updating country:', err);
      setError(err.message || 'Failed to update country');
      showStatusMessage('Failed to update country', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, selectedCountry, showStatusMessage]);

  // Deactivate country
  const handleDeactivate = useCallback(async (countryId) => {
    try {
      setLoading(true);
      clearError();
      
      const updatedCountry = await deactivateCountry(countryId);
      
      // Update local state
      setCountries(prevCountries => 
        prevCountries.map(country => 
          country.CountryID === countryId ? updatedCountry : country
        )
      );
      
      setSuccessMessage('Country marked as no business');
      showStatusMessage('Country marked as no business');
      
      return updatedCountry;
    } catch (err) {
      console.error('Error deactivating country:', err);
      setError(err.message || 'Failed to deactivate country');
      showStatusMessage('Failed to deactivate country', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, showStatusMessage]);

  // Reactivate country
  const handleReactivate = useCallback(async (countryId) => {
    try {
      setLoading(true);
      clearError();
      
      const updatedCountry = await reactivateCountry(countryId);
      
      // Update local state
      setCountries(prevCountries => 
        prevCountries.map(country => 
          country.CountryID === countryId ? updatedCountry : country
        )
      );
      
      setSuccessMessage('Country marked as active business');
      showStatusMessage('Country marked as active business');
      
      return updatedCountry;
    } catch (err) {
      console.error('Error reactivating country:', err);
      setError(err.message || 'Failed to reactivate country');
      showStatusMessage('Failed to reactivate country', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, showStatusMessage]);

  // Delete country
  const handleDelete = useCallback(async (countryId) => {
    try {
      setLoading(true);
      clearError();
      
      // Find the country to check if it has clients
      const country = countries.find(c => c.CountryID === countryId);
      if (country && country.ClientCount > 0) {
        throw new Error('Cannot delete country with active clients');
      }
      
      await deleteCountry(countryId);
      
      // Remove from local state
      setCountries(prevCountries => 
        prevCountries.filter(country => country.CountryID !== countryId)
      );
      
      // Clear selected country if it was deleted
      if (selectedCountry && selectedCountry.CountryID === countryId) {
        setSelectedCountry(null);
      }
      
      // Remove from selected list
      setSelected(prevSelected => prevSelected.filter(id => id !== countryId));
      
      setSuccessMessage('Country deleted successfully');
      showStatusMessage('Country deleted successfully');
      
      return true;
    } catch (err) {
      console.error('Error deleting country:', err);
      setError(err.message || 'Failed to delete country');
      showStatusMessage(err.message || 'Failed to delete country', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearError, countries, selectedCountry, showStatusMessage]);

  // Bulk deactivate
  const handleBulkDeactivate = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      
      const promises = selected.map(countryId => deactivateCountry(countryId));
      await Promise.all(promises);
      
      // Reload countries
      await loadCountries();
      
      // Clear selection
      setSelected([]);
      
      setSuccessMessage(`${selected.length} countries marked as no business`);
      showStatusMessage(`${selected.length} countries marked as no business`);
      
    } catch (err) {
      console.error('Error bulk deactivating countries:', err);
      setError(err.message || 'Failed to deactivate countries');
      showStatusMessage('Failed to deactivate countries', 'error');
    } finally {
      setLoading(false);
    }
  }, [clearError, selected, loadCountries, showStatusMessage]);

  // Add note handler
  const handleAddNote = useCallback((country) => {
    console.log('Add note to country:', country);
    showStatusMessage('Add note functionality to be implemented', 'info');
  }, [showStatusMessage]);

  // Add attachment handler
  const handleAddAttachment = useCallback((country) => {
    console.log('Add attachment to country:', country);
    showStatusMessage('Add attachment functionality to be implemented', 'info');
  }, [showStatusMessage]);

  // Assign user handler
  const handleAssignUser = useCallback((country) => {
    console.log('Assign user to country:', country);
    showStatusMessage('Assign user functionality to be implemented', 'info');
  }, [showStatusMessage]);

  return (
    <CountryPage
      countries={countries}
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
      selectedCountry={selectedCountry}
    />
  );
};

export default CountryContainer;