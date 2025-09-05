import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
// Import state/province and city services (you'll need to create these)
import {
  getAllStatesProvinces,
  createStateProvince,
  updateStateProvince,
  deactivateStateProvince,
  reactivateStateProvince,
  deleteStateProvince
} from '../../services/stateProvinceService';
import {
  getAllCities,
  createCity,
  updateCity,
  deactivateCity,
  reactivateCity,
  deleteCity
} from '../../services/cityService';
// Import currency and entertainment city services
import { getAllCurrencies } from '../../services/currencyService';
import { getAllEntertainmentCities } from '../../services/entertainmentCityService';

import CountryPage from "../../pages/GeographicData/CountryPage";

const GeographyContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial tab based on URL
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('states')) return 1;
    if (path.includes('city')) return 2;
    return 0; // default to countries
  };

  // State management for countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryLoading, setCountryLoading] = useState(false);
  
  // State management for states/provinces
  const [statesProvinces, setStatesProvinces] = useState([]);
  const [selectedStateProvince, setSelectedStateProvince] = useState(null);
  const [stateProvinceLoading, setStateProvinceLoading] = useState(false);
  
  // State management for cities
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityLoading, setCityLoading] = useState(false);
  
  // Shared state
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('success');
  const [selected, setSelected] = useState([]);
  const [currentTab, setCurrentTab] = useState(getInitialTab());
  
  // Dropdown data
  const [currencies, setCurrencies] = useState([]);
  const [entertainmentCities, setEntertainmentCities] = useState([]);
  
  // Handle tab changes with URL updates
  const handleTabChange = useCallback((newTab) => {
    setCurrentTab(newTab);
    setSelected([]); // Clear selection when switching tabs
    
    // Update URL based on tab
    switch (newTab) {
      case 0:
        navigate('/countries', { replace: true });
        break;
      case 1:
        navigate('/countries/states', { replace: true });
        break;
      case 2:
        navigate('/countries/cities', { replace: true });
        break;
      default:
        navigate('/countries', { replace: true });
    }
  }, [navigate]);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Show status message helper
  const showStatusMessage = useCallback((message, severity = 'success') => {
    setStatusMessage(message);
    setStatusSeverity(severity);
  }, []);

  // Load dropdown data
  const loadDropdownData = useCallback(async () => {
    try {
      const [currenciesData, entertainmentCitiesData] = await Promise.all([
        getAllCurrencies().catch(() => []),
        getAllEntertainmentCities().catch(() => [])
      ]);
      setCurrencies(currenciesData || []);
      setEntertainmentCities(entertainmentCitiesData || []);
    } catch (err) {
      console.error('Error loading dropdown data:', err);
    }
  }, []);

  // Load countries
  const loadCountries = useCallback(async () => {
    try {
      setCountryLoading(true);
      clearError();
      const data = await getAllCountries();
      setCountries(data || []);
    } catch (err) {
      console.error('Error loading countries:', err);
      setError(err.message || 'Failed to load countries');
      showStatusMessage('Failed to load countries', 'error');
    } finally {
      setCountryLoading(false);
    }
  }, [clearError, showStatusMessage]);

  // Load states/provinces
  const loadStatesProvinces = useCallback(async () => {
    try {
      setStateProvinceLoading(true);
      clearError();
      const data = await getAllStatesProvinces();
      setStatesProvinces(data || []);
    } catch (err) {
      console.error('Error loading states/provinces:', err);
      setError(err.message || 'Failed to load states/provinces');
      showStatusMessage('Failed to load states/provinces', 'error');
    } finally {
      setStateProvinceLoading(false);
    }
  }, [clearError, showStatusMessage]);

  // Load cities
  const loadCities = useCallback(async () => {
    try {
      setCityLoading(true);
      clearError();
      const data = await getAllCities();
      setCities(data || []);
    } catch (err) {
      console.error('Error loading cities:', err);
      setError(err.message || 'Failed to load cities');
      showStatusMessage('Failed to load cities', 'error');
    } finally {
      setCityLoading(false);
    }
  }, [clearError, showStatusMessage]);

  // Initial load based on current tab
  useEffect(() => {
    loadDropdownData();
    
    switch (currentTab) {
      case 0:
        loadCountries();
        break;
      case 1:
        loadStatesProvinces();
        if (countries.length === 0) loadCountries(); // Load countries for dropdown
        break;
      case 2:
        loadCities();
        if (countries.length === 0) loadCountries(); // Load countries for dropdown
        if (statesProvinces.length === 0) loadStatesProvinces(); // Load states for dropdown
        break;
      default:
        loadCountries();
    }
  }, [currentTab, loadDropdownData, loadCountries, loadStatesProvinces, loadCities, countries.length, statesProvinces.length]);

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
      let allIds = [];
      switch (currentTab) {
        case 0:
          allIds = countries.map(country => country.CountryID);
          break;
        case 1:
          allIds = statesProvinces.map(state => state.StateProvinceID);
          break;
        case 2:
          allIds = cities.map(city => city.CityID);
          break;
      }
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  }, [currentTab, countries, statesProvinces, cities]);

  // Country handlers
  const handleCountryView = useCallback(async (country) => {
    try {
      const response = await getCountryDetails(country.CountryID);
      setSelectedCountry(response.data);
      showStatusMessage('Country details loaded');
    } catch (err) {
      setError(err.message || 'Failed to fetch country details');
    }
  }, [showStatusMessage]);

  const handleCountryCreate = useCallback(async (countryData) => {
    try {
      setCountryLoading(true);
      await createCountry(countryData);
      await loadCountries();
      setSuccessMessage('Country created successfully');
      showStatusMessage('Country created successfully');
    } catch (err) {
      setError(err.message || 'Failed to create country');
      throw err;
    } finally {
      setCountryLoading(false);
    }
  }, [loadCountries, showStatusMessage]);

  const handleCountryDeactivate = useCallback(async (countryId) => {
    try {
      await deactivateCountry(countryId);
      await loadCountries();
      showStatusMessage('Country deactivated successfully');
    } catch (err) {
      setError(err.message || 'Failed to deactivate country');
    }
  }, [loadCountries, showStatusMessage]);

  const handleCountryReactivate = useCallback(async (countryId) => {
    try {
      await reactivateCountry(countryId);
      await loadCountries();
      showStatusMessage('Country reactivated successfully');
    } catch (err) {
      setError(err.message || 'Failed to reactivate country');
    }
  }, [loadCountries, showStatusMessage]);

  const handleCountryDelete = useCallback(async (countryId) => {
    try {
      await deleteCountry(countryId);
      await loadCountries();
      setSelected(prev => prev.filter(id => id !== countryId));
      showStatusMessage('Country deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete country');
    }
  }, [loadCountries, showStatusMessage]);

  // State/Province handlers
  const handleStateProvinceView = useCallback((stateProvince) => {
    setSelectedStateProvince(stateProvince);
    showStatusMessage('State/Province details loaded');
  }, [showStatusMessage]);

  const handleStateProvinceCreate = useCallback(async (stateProvinceData) => {
    try {
      setStateProvinceLoading(true);
      await createStateProvince(stateProvinceData);
      await loadStatesProvinces();
      setSuccessMessage('State/Province created successfully');
      showStatusMessage('State/Province created successfully');
    } catch (err) {
      setError(err.message || 'Failed to create state/province');
      throw err;
    } finally {
      setStateProvinceLoading(false);
    }
  }, [loadStatesProvinces, showStatusMessage]);

  const handleStateProvinceDeactivate = useCallback(async (stateProvinceId) => {
    try {
      await deactivateStateProvince(stateProvinceId);
      await loadStatesProvinces();
      showStatusMessage('State/Province deactivated successfully');
    } catch (err) {
      setError(err.message || 'Failed to deactivate state/province');
    }
  }, [loadStatesProvinces, showStatusMessage]);

  const handleStateProvinceReactivate = useCallback(async (stateProvinceId) => {
    try {
      await reactivateStateProvince(stateProvinceId);
      await loadStatesProvinces();
      showStatusMessage('State/Province reactivated successfully');
    } catch (err) {
      setError(err.message || 'Failed to reactivate state/province');
    }
  }, [loadStatesProvinces, showStatusMessage]);

  const handleStateProvinceDelete = useCallback(async (stateProvinceId) => {
    try {
      await deleteStateProvince(stateProvinceId);
      await loadStatesProvinces();
      setSelected(prev => prev.filter(id => id !== stateProvinceId));
      showStatusMessage('State/Province deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete state/province');
    }
  }, [loadStatesProvinces, showStatusMessage]);

  // City handlers
  const handleCityView = useCallback((city) => {
    setSelectedCity(city);
    showStatusMessage('City details loaded');
  }, [showStatusMessage]);

  const handleCityCreate = useCallback(async (cityData) => {
    try {
      setCityLoading(true);
      await createCity(cityData);
      await loadCities();
      setSuccessMessage('City created successfully');
      showStatusMessage('City created successfully');
    } catch (err) {
      setError(err.message || 'Failed to create city');
      throw err;
    } finally {
      setCityLoading(false);
    }
  }, [loadCities, showStatusMessage]);

  const handleCityDeactivate = useCallback(async (cityId) => {
    try {
      await deactivateCity(cityId);
      await loadCities();
      showStatusMessage('City deactivated successfully');
    } catch (err) {
      setError(err.message || 'Failed to deactivate city');
    }
  }, [loadCities, showStatusMessage]);

  const handleCityReactivate = useCallback(async (cityId) => {
    try {
      await reactivateCity(cityId);
      await loadCities();
      showStatusMessage('City reactivated successfully');
    } catch (err) {
      setError(err.message || 'Failed to reactivate city');
    }
  }, [loadCities, showStatusMessage]);

  const handleCityDelete = useCallback(async (cityId) => {
    try {
      await deleteCity(cityId);
      await loadCities();
      setSelected(prev => prev.filter(id => id !== cityId));
      showStatusMessage('City deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete city');
    }
  }, [loadCities, showStatusMessage]);

  // Bulk operations
  const handleBulkDeactivate = useCallback(async () => {
    try {
      const promises = selected.map(id => {
        switch (currentTab) {
          case 0:
            return deactivateCountry(id);
          case 1:
            return deactivateStateProvince(id);
          case 2:
            return deactivateCity(id);
          default:
            return Promise.resolve();
        }
      });
      
      await Promise.all(promises);
      
      // Reload data
      switch (currentTab) {
        case 0:
          await loadCountries();
          break;
        case 1:
          await loadStatesProvinces();
          break;
        case 2:
          await loadCities();
          break;
      }
      
      setSelected([]);
      showStatusMessage(`${selected.length} items deactivated successfully`);
    } catch (err) {
      setError(err.message || 'Failed to deactivate items');
    }
  }, [selected, currentTab, loadCountries, loadStatesProvinces, loadCities, showStatusMessage]);

  // Placeholder handlers for notes, attachments, etc.
  const handleAddNote = useCallback((item) => {
    console.log('Add note to item:', item);
    showStatusMessage('Add note functionality to be implemented', 'info');
  }, [showStatusMessage]);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to item:', item);
    showStatusMessage('Add attachment functionality to be implemented', 'info');
  }, [showStatusMessage]);

  const handleAssignUser = useCallback((item) => {
    console.log('Assign user to item:', item);
    showStatusMessage('Assign user functionality to be implemented', 'info');
  }, [showStatusMessage]);

  // Prepare props for each page
  const countryProps = {
    countries,
    currencies,
    loading: countryLoading,
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
    onDeactivate: handleCountryDeactivate,
    onReactivate: handleCountryReactivate,
    onDelete: handleCountryDelete,
    onBulkDeactivate: handleBulkDeactivate,
    onEdit: (country) => console.log('Edit country:', country),
    onView: handleCountryView,
    onCreate: handleCountryCreate,
    onAddNote: handleAddNote,
    onAddAttachment: handleAddAttachment,
    onAssignUser: handleAssignUser,
    selectedCountry,
  };

  const stateProvinceProps = {
    statesProvinces,
    countries, // For dropdown
    loading: stateProvinceLoading,
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
    onDeactivate: handleStateProvinceDeactivate,
    onReactivate: handleStateProvinceReactivate,
    onDelete: handleStateProvinceDelete,
    onBulkDeactivate: handleBulkDeactivate,
    onEdit: (stateProvince) => console.log('Edit state/province:', stateProvince),
    onView: handleStateProvinceView,
    onCreate: handleStateProvinceCreate,
    onAddNote: handleAddNote,
    onAddAttachment: handleAddAttachment,
    onAssignUser: handleAssignUser,
    selectedStateProvince,
  };

  const cityProps = {
    cities,
    statesProvinces, // For dropdown
    entertainmentCities, // For dropdown
    loading: cityLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    statusMessage,
    statusSeverity,
    setStatusMessage,
    selected: currentTab === 2 ? selected : [],
    onSelectClick: handleSelectClick,
    onSelectAllClick: handleSelectAllClick,
    onDeactivate: handleCityDeactivate,
    onReactivate: handleCityReactivate,
    onDelete: handleCityDelete,
    onBulkDeactivate: handleBulkDeactivate,
    onEdit: (city) => console.log('Edit city:', city),
    onView: handleCityView,
    onCreate: handleCityCreate,
    onAddNote: handleAddNote,
    onAddAttachment: handleAddAttachment,
    onAssignUser: handleAssignUser,
    selectedCity,
  };

  return (
    <CountryPage
      // Pass all country props
      {...countryProps}
      
      // Pass state/province and city props
      stateProvinceProps={stateProvinceProps}
      cityProps={cityProps}
      
      // Pass tab management
      currentTab={currentTab}
      onTabChange={handleTabChange}
    />
  );
};

export default GeographyContainer;