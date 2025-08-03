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
};
