// services/dropdownServices.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

// State/Province Service
export const stateProvinceService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/stateprovinces`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading state/provinces:', error);
      return [];
    }
  },
  getByCountry: async (countryId) => {
    try {
      const response = await axios.get(`${BASE_URL}/stateprovinces?countryId=${countryId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading state/provinces by country:', error);
      return [];
    }
  },
  create: async (stateProvinceData) => {
    const response = await axios.post(`${BASE_URL}/stateprovinces`, stateProvinceData);
    return response.data;
  }
};

// Country Service
export const countryService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/countries`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading countries:', error);
      return [];
    }
  },
  create: async (countryData) => {
    const response = await axios.post(`${BASE_URL}/countries`, countryData);
    return response.data;
  }
};

// City Service
export const cityService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/cities`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading cities:', error);
      return [];
    }
  },
  create: async (cityData) => {
    const response = await axios.post(`${BASE_URL}/cities`, cityData);
    return response.data;
  }
};

// Industry Service
export const industryService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/industries`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading industries:', error);
      return [];
    }
  },
  create: async (industryData) => {
    const response = await axios.post(`${BASE_URL}/industries`, industryData);
    return response.data;
  }
};

// Job Title Service
export const jobTitleService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/jobtitles`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading job titles:', error);
      return [];
    }
  },
  create: async (jobTitleData) => {
    const response = await axios.post(`${BASE_URL}/jobtitles`, jobTitleData);
    return response.data;
  }
};

// Activity Type Service
export const activityTypeService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/activitytypes`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading activity types:', error);
      return [];
    }
  },
  create: async (activityTypeData) => {
    const response = await axios.post(`${BASE_URL}/activitytypes`, activityTypeData);
    return response.data;
  }
};

// Deal Stage Service
export const dealStageService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/dealstages`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading deal stages:', error);
      return [];
    }
  },
  create: async (dealStageData) => {
    const response = await axios.post(`${BASE_URL}/dealstages`, dealStageData);
    return response.data;
  }
};

// Priority Level Service
export const priorityLevelService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/prioritylevels`);
      console.log('Priority levels response:', response.data); 
      return response.data || [];
    } catch (error) {
      console.error('Error loading priority levels:', error);
      return [];
    }
  },
  create: async (priorityLevelData) => {
    const response = await axios.post(`${BASE_URL}/prioritylevels`, priorityLevelData);
    return response.data;
  }
};

// Product Service
export const productService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/products`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  },
  create: async (productData) => {
    const response = await axios.post(`${BASE_URL}/products`, productData);
    return response.data;
  }
};

// Person Service
export const personService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/persons`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading persons:', error);
      return [];
    }
  },
  create: async (personData) => {
    const response = await axios.post(`${BASE_URL}/persons`, personData);
    return response.data;
  }
};