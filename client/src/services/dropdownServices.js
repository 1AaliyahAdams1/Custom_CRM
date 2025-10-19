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

export async function currencyService() {
  try {
    const response = await api.get('/currency');
    return response.data;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }
}

// Team Service
export const teamService = {
  getAll: async () => {
    try {
      const response = await api.get('/teams');
      return response.data || [];
    } catch (error) {
      console.error('Error loading teams:', error);
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