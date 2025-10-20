import api from '../utils/api';

// State/Province Service
export const stateProvinceService = {
  getAll: async () => {
    try {
      const response = await api.get('/states');
      return response.data || [];
    }
    catch (error) {
      console.error('Error loading states/provinces:', error);
      return [];
    }
  },
  

  // Enhanced method for filtering by country
  getAllFiltered: async (countryId = null) => {
    try {
      const response = await api.get('/states');
      const allStates = response.data || [];

      console.log("countryId for filtering",countryId)

      if (!countryId) {
        return allStates;
      }

      // Filter states by country - assuming the state objects have CountryID or similar field

      return allStates.filter(state =>
        state.CountryID === parseInt(countryId) ||
        state.countryId === parseInt(countryId) ||
        state.country_id === parseInt(countryId)
      );
    } catch (error) {
      return [];
    }
  },
};

// Country Service
export const countryService = {
  getAll: async () => {
    try {
      const response = await api.get('/countries');
      return response.data || [];
    } catch (error) {
      return [];
    }
  },
};

// City Service
export const cityService = {
  getAll: async () => {
    try {
      const response = await api.get('/cities');
      return response.data || [];
    } catch (error) {
      return [];
    }
  },
  // Enhanced method for filtering by state/province and country
  getAllFiltered: async (stateProvinceId = null, countryId = null) => {
    try {
      const response = await api.get('/cities');
      const allCities = response.data || [];

      if (!stateProvinceId && !countryId) {
        return allCities;
      }

      return allCities.filter(city => {
        // First check state/province match (most specific)
        if (stateProvinceId) {
          return city.StateProvinceID === parseInt(stateProvinceId) ||
            city.stateProvinceId === parseInt(stateProvinceId) ||
            city.state_province_id === parseInt(stateProvinceId);
        }

        // Fall back to country match if no state/province specified
        if (countryId) {
          return city.CountryID === parseInt(countryId) ||
            city.countryId === parseInt(countryId) ||
            city.country_id === parseInt(countryId);
        }

        return true;
      });
    } catch (error) {
      console.error('Error loading filtered cities:', error);
      return [];
    }
  },
};

// Industry Service
export const industryService = {
  getAll: async () => {
    try {
      const response = await api.get('/industries');
      return response.data || [];
    } catch (error) {
      console.error('Error loading industries:', error);
      return [];
    }
  },
};

// Job Title Service
export const jobTitleService = {
  getAll: async () => {
    try {
      const response = await api.get('/jobtitles');
      return response.data || [];
    } catch (error) {
      console.error('Error loading job titles:', error);
      return [];
    }
  },
};

// Activity Type Service
export const activityTypeService = {
  getAll: async () => {
    try {
      const response = await api.get('/activitytypes');
      return response.data || [];
    } catch (error) {
      console.error('Error loading activity types:', error);
      return [];
    }
  },
};

// Deal Stage Service
export const dealStageService = {
  getAll: async () => {
    try {
      const response = await api.get('/dealstages');
      return response.data || [];
    } catch (error) {
      console.error('Error loading deal stages:', error);
      return [];
    }
  },
};

// Priority Level Service
export const priorityLevelService = {
  getAll: async () => {
    try {
      const response = await api.get('/prioritylevels');
      console.log('Priority levels response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error loading priority levels:', error);
      return [];
    }
  },
};

// Product Service
export const productService = {
  getAll: async () => {
    try {
      const response = await api.get('/products');
      return response.data || [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  },
};

export const currencyService = {
  getAll: async () => {
    try {
      console.log('=== CURRENCY SERVICE DEBUG ===');
      console.log('Currency Service: Fetching currencies from /currencies...');
      console.log('Currency Service: API Base URL:', process.env.REACT_APP_API_URL);
      
      const response = await api.get('/currencies');
      console.log('Currency Service: Full response:', response);
      console.log('Currency Service: Response data:', response.data);
      console.log('Currency Service: Response status:', response.status);
      console.log('Currency Service: Response headers:', response.headers);
      
      const data = response.data || [];
      console.log('Currency Service: Processed data:', data);
      console.log('Currency Service: Data length:', data.length);
      console.log('Currency Service: Is array:', Array.isArray(data));
      
      if (data.length === 0) {
        console.warn('Currency Service: No currencies found in database');
      }
      
      console.log('================================');
      return data;
    } catch (error) {
      console.error('=== CURRENCY SERVICE ERROR ===');
      console.error('Currency Service: Error fetching currencies:', error);
      console.error('Currency Service: Error response:', error.response);
      console.error('Currency Service: Error message:', error.message);
      console.error('Currency Service: Error config:', error.config);
      console.error('Currency Service: Error status:', error.response?.status);
      console.error('Currency Service: Error data:', error.response?.data);
      console.error('================================');
      return [];
    }
  },
};

// Team Service
export const teamService = {
  getAll: async () => {
    try {
      console.log('=== TEAM SERVICE DEBUG ===');
      console.log('Team Service: Fetching teams from /teams...');
      console.log('Team Service: API Base URL:', process.env.REACT_APP_API_URL);
      
      const response = await api.get('/teams');
      console.log('Team Service: Full response:', response);
      console.log('Team Service: Response data:', response.data);
      console.log('Team Service: Response status:', response.status);
      console.log('Team Service: Response headers:', response.headers);
      
      const data = response.data || response;
      console.log('Team Service: Processed data:', data);
      console.log('Team Service: Data length:', data?.length);
      console.log('Team Service: Is array:', Array.isArray(data));
      
      if (data.length === 0) {
        console.warn('Team Service: No teams found in database');
      }
      
      console.log('================================');
      return data;
    } catch (error) {
      console.error('=== TEAM SERVICE ERROR ===');
      console.error('Team Service: Error fetching teams:', error);
      console.error('Team Service: Error response:', error.response);
      console.error('Team Service: Error message:', error.message);
      console.error('Team Service: Error config:', error.config);
      console.error('Team Service: Error status:', error.response?.status);
      console.error('Team Service: Error data:', error.response?.data);
      console.error('================================');
      return [];
    }
  },
};

// department Service
export const departmentService = {
  getAll: async () => {
    try {
      const response = await api.get('/departments');
      return response.data || [];
    }
    catch (error) {
      console.error('Error loading departments:', error);
      return [];
    }
  },
};

// employee service
export const employeeService = {
  getAll: async () => {
    try {
      const response = await api.get('/employees');
      return response.data || [];
    }
    catch (error) {
      console.error('Error loading employees:', error);
      return [];
    }
  },
};