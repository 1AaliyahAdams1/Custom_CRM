// stateProvinceService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class StateProvinceService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/states`;
  }

  // Helper method for making API requests
  async makeRequest(url, options = {}) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      
      // Handle different response types
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return null; // For successful requests with no content (like deletes)
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Get all states/provinces
  async getAllStates() {
    try {
      const states = await this.makeRequest(this.baseURL);
      return {
        success: true,
        data: states,
        message: 'States/provinces retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve states/provinces'
      };
    }
  }

  // Get state/province by ID
  async getStateById(stateId) {
    try {
      if (!stateId) {
        throw new Error('State/Province ID is required');
      }

      const state = await this.makeRequest(`${this.baseURL}/${stateId}`);
      return {
        success: true,
        data: state,
        message: 'State/province retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve state/province'
      };
    }
  }

  // Get ID by state/province name
  async getIDByStateProvince(name) {
    try {
      if (!name || name.trim() === '') {
        throw new Error('State/Province name is required');
      }

      const encodedName = encodeURIComponent(name.trim());
      const result = await this.makeRequest(`${this.baseURL}/name/${encodedName}`);
      
      return {
        success: true,
        data: result,
        message: 'State/province ID retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve state/province ID'
      };
    }
  }

  // Create new state/province
  async createState(stateData) {
    try {
      if (!stateData || typeof stateData !== 'object') {
        throw new Error('Valid state/province data is required');
      }

      const validation = this.validateStateData(stateData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const state = await this.makeRequest(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(stateData)
      });

      return {
        success: true,
        data: state,
        message: 'State/province created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create state/province'
      };
    }
  }

  // Update state/province
  async updateState(stateId, stateData) {
    try {
      if (!stateId) {
        throw new Error('State/Province ID is required');
      }

      if (!stateData || typeof stateData !== 'object') {
        throw new Error('Valid state/province data is required');
      }

      const state = await this.makeRequest(`${this.baseURL}/${stateId}`, {
        method: 'PUT',
        body: JSON.stringify(stateData)
      });

      return {
        success: true,
        data: state,
        message: 'State/province updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update state/province'
      };
    }
  }

  // Deactivate state/province
  async deactivateState(stateId) {
    try {
      if (!stateId) {
        throw new Error('State/Province ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${stateId}/deactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'State/province deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to deactivate state/province'
      };
    }
  }

  // Reactivate state/province
  async reactivateState(stateId) {
    try {
      if (!stateId) {
        throw new Error('State/Province ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${stateId}/reactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'State/province reactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reactivate state/province'
      };
    }
  }

  // Delete state/province
  async deleteState(stateId) {
    try {
      if (!stateId) {
        throw new Error('State/Province ID is required');
      }

      await this.makeRequest(`${this.baseURL}/${stateId}`, {
        method: 'DELETE'
      });

      return {
        success: true,
        data: null,
        message: 'State/province deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to delete state/province'
      };
    }
  }

  // Additional utility methods for frontend needs

  // Search states/provinces by name
  async searchStates(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllStates();
      }

      const response = await this.getAllStates();
      
      if (!response.success) {
        return response;
      }

      const filteredStates = response.data.filter(state =>
        (state.StateName && state.StateName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (state.ProvinceCode && state.ProvinceCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (state.StateCode && state.StateCode.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return {
        success: true,
        data: filteredStates,
        message: `Found ${filteredStates.length} states/provinces matching "${searchTerm}"`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to search states/provinces'
      };
    }
  }

  // Get states/provinces by country
  async getStatesByCountry(countryId) {
    try {
      if (!countryId) {
        throw new Error('Country ID is required');
      }

      const response = await this.getAllStates();
      
      if (!response.success) {
        return response;
      }

      const filteredStates = response.data.filter(state =>
        state.CountryID === countryId
      );

      return {
        success: true,
        data: filteredStates,
        message: `Found ${filteredStates.length} states/provinces in the selected country`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve states/provinces by country'
      };
    }
  }

  // Get active states/provinces only
  async getActiveStates() {
    try {
      const response = await this.getAllStates();
      
      if (!response.success) {
        return response;
      }

      const activeStates = response.data.filter(state =>
        state.IsActive === true || state.IsActive === 1
      );

      return {
        success: true,
        data: activeStates,
        message: `Found ${activeStates.length} active states/provinces`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve active states/provinces'
      };
    }
  }

  // Bulk operations
  async bulkDeleteStates(stateIds) {
    try {
      if (!stateIds || !Array.isArray(stateIds) || stateIds.length === 0) {
        throw new Error('Array of state/province IDs is required');
      }

      const results = await Promise.allSettled(
        stateIds.map(id => this.deleteState(id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: stateIds.length
        },
        message: `Deleted ${successful.length} out of ${stateIds.length} states/provinces`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to bulk delete states/provinces'
      };
    }
  }

  // Bulk activate/deactivate
  async bulkActivateStates(stateIds, activate = true) {
    try {
      if (!stateIds || !Array.isArray(stateIds) || stateIds.length === 0) {
        throw new Error('Array of state/province IDs is required');
      }

      const action = activate ? 'reactivateState' : 'deactivateState';
      const results = await Promise.allSettled(
        stateIds.map(id => this[action](id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      const actionText = activate ? 'activated' : 'deactivated';
      
      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: stateIds.length
        },
        message: `${actionText} ${successful.length} out of ${stateIds.length} states/provinces`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || `Failed to bulk ${activate ? 'activate' : 'deactivate'} states/provinces`
      };
    }
  }

  // Get states/provinces with their cities count
  async getStatesWithCityCount() {
    try {
      const statesResponse = await this.getAllStates();
      
      if (!statesResponse.success) {
        return statesResponse;
      }

      // This would typically require a separate API endpoint that joins states with city counts
      // For now, we'll return the states data with a note that city counts need to be fetched separately
      const statesWithCounts = statesResponse.data.map(state => ({
        ...state,
        cityCount: null // Would be populated by a separate API call
      }));

      return {
        success: true,
        data: statesWithCounts,
        message: 'States/provinces retrieved (city counts require separate API endpoint)'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve states/provinces with city counts'
      };
    }
  }

  // Validation helpers
  validateStateData(stateData) {
    const errors = [];

    if (!stateData.StateName || stateData.StateName.trim() === '') {
      errors.push('State/Province name is required');
    }

    if (stateData.StateName && stateData.StateName.length > 100) {
      errors.push('State/Province name must be less than 100 characters');
    }

    if (stateData.StateCode && stateData.StateCode.length > 10) {
      errors.push('State/Province code must be less than 10 characters');
    }

    if (stateData.CountryID && (typeof stateData.CountryID !== 'number' || stateData.CountryID <= 0)) {
      errors.push('Valid Country ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format state/province for display
  formatStateForDisplay(state) {
    if (!state) return '';
    
    const parts = [];
    
    if (state.StateName) {
      parts.push(state.StateName);
    }
    
    if (state.StateCode) {
      parts.push(`(${state.StateCode})`);
    }
    
    return parts.join(' ');
  }

  // Create lookup map for quick access
  createStateLookupMap(states) {
    if (!Array.isArray(states)) return {};
    
    return states.reduce((map, state) => {
      if (state.StateProvinceID) {
        map[state.StateProvinceID] = state;
      }
      return map;
    }, {});
  }
}

// Create and export a singleton instance
const stateProvinceService = new StateProvinceService();
export default stateProvinceService;

// Also export the class for testing purposes
export { StateProvinceService };