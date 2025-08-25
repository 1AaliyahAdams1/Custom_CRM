
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class CityService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/cities`;
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

  // Get all cities
  async getAllCities() {
    try {
      const cities = await this.makeRequest(this.baseURL);
      return {
        success: true,
        data: cities,
        message: 'Cities retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve cities'
      };
    }
  }

  // Get city by ID
  async getCityById(cityId) {
    try {
      if (!cityId) {
        throw new Error('City ID is required');
      }

      const city = await this.makeRequest(`${this.baseURL}/${cityId}`);
      return {
        success: true,
        data: city,
        message: 'City retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve city'
      };
    }
  }

  // Create new city
  async createCity(cityData) {
    try {
      const { CityName, StateProvinceID } = cityData;
      
      if (!CityName || !StateProvinceID) {
        throw new Error('City name and State/Province ID are required');
      }

      const city = await this.makeRequest(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(cityData)
      });

      return {
        success: true,
        data: city,
        message: 'City created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create city'
      };
    }
  }

  // Update city
  async updateCity(cityId, cityData) {
    try {
      if (!cityId) {
        throw new Error('City ID is required');
      }

      const city = await this.makeRequest(`${this.baseURL}/${cityId}`, {
        method: 'PUT',
        body: JSON.stringify(cityData)
      });

      return {
        success: true,
        data: city,
        message: 'City updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update city'
      };
    }
  }

  // Deactivate city
  async deactivateCity(cityId) {
    try {
      if (!cityId) {
        throw new Error('City ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${cityId}/deactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'City deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to deactivate city'
      };
    }
  }

  // Reactivate city
  async reactivateCity(cityId) {
    try {
      if (!cityId) {
        throw new Error('City ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${cityId}/reactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'City reactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reactivate city'
      };
    }
  }

  // Delete city
  async deleteCity(cityId) {
    try {
      if (!cityId) {
        throw new Error('City ID is required');
      }

      await this.makeRequest(`${this.baseURL}/${cityId}`, {
        method: 'DELETE'
      });

      return {
        success: true,
        data: null,
        message: 'City deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to delete city'
      };
    }
  }

  // Additional utility methods for frontend needs

  // Search cities by name
  async searchCities(searchTerm) {
    try {
      const response = await this.getAllCities();
      
      if (!response.success) {
        return response;
      }

      const filteredCities = response.data.filter(city =>
        city.CityName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        success: true,
        data: filteredCities,
        message: `Found ${filteredCities.length} cities matching "${searchTerm}"`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to search cities'
      };
    }
  }

  // Get cities by state/province
  async getCitiesByState(stateProvinceId) {
    try {
      if (!stateProvinceId) {
        throw new Error('State/Province ID is required');
      }

      const response = await this.getAllCities();
      
      if (!response.success) {
        return response;
      }

      const filteredCities = response.data.filter(city =>
        city.StateProvinceID === stateProvinceId
      );

      return {
        success: true,
        data: filteredCities,
        message: `Found ${filteredCities.length} cities in the selected state/province`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve cities by state'
      };
    }
  }

  // Bulk operations
  async bulkDeleteCities(cityIds) {
    try {
      if (!cityIds || !Array.isArray(cityIds) || cityIds.length === 0) {
        throw new Error('Array of city IDs is required');
      }

      const results = await Promise.allSettled(
        cityIds.map(id => this.deleteCity(id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: cityIds.length
        },
        message: `Deleted ${successful.length} out of ${cityIds.length} cities`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to bulk delete cities'
      };
    }
  }

  // Validation helpers
  validateCityData(cityData) {
    const errors = [];

    if (!cityData.CityName || cityData.CityName.trim() === '') {
      errors.push('City name is required');
    }

    if (!cityData.StateProvinceID) {
      errors.push('State/Province ID is required');
    }

    if (cityData.CityName && cityData.CityName.length > 100) {
      errors.push('City name must be less than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create and export a singleton instance
const cityService = new CityService();
export default cityService;

// Also export the class for testing purposes
export { CityService };