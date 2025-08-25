const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class IndustryService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/industries`;
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

  // Get all industries
  async getAllIndustries() {
    try {
      const industries = await this.makeRequest(this.baseURL);
      return {
        success: true,
        data: industries,
        message: 'Industries retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve industries'
      };
    }
  }

  // Get industry by ID
  async getIndustryById(industryId) {
    try {
      if (!industryId) {
        throw new Error('Industry ID is required');
      }

      const industry = await this.makeRequest(`${this.baseURL}/${industryId}`);
      return {
        success: true,
        data: industry,
        message: 'Industry retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve industry'
      };
    }
  }

  // Create new industry
  async createIndustry(name) {
    try {
      if (!name || name.trim() === '') {
        throw new Error('Industry name is required');
      }

      const validation = this.validateIndustryName(name);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const industry = await this.makeRequest(this.baseURL, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() })
      });

      return {
        success: true,
        data: industry,
        message: 'Industry created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create industry'
      };
    }
  }

  // Update industry
  async updateIndustry(industryId, name) {
    try {
      if (!industryId) {
        throw new Error('Industry ID is required');
      }

      if (!name || name.trim() === '') {
        throw new Error('Industry name is required');
      }

      const validation = this.validateIndustryName(name);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const industry = await this.makeRequest(`${this.baseURL}/${industryId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim() })
      });

      return {
        success: true,
        data: industry,
        message: 'Industry updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update industry'
      };
    }
  }

  // Deactivate industry
  async deactivateIndustry(industryId) {
    try {
      if (!industryId) {
        throw new Error('Industry ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${industryId}/deactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'Industry deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to deactivate industry'
      };
    }
  }

  // Reactivate industry
  async reactivateIndustry(industryId) {
    try {
      if (!industryId) {
        throw new Error('Industry ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${industryId}/reactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'Industry reactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reactivate industry'
      };
    }
  }

  // Delete industry
  async deleteIndustry(industryId) {
    try {
      if (!industryId) {
        throw new Error('Industry ID is required');
      }

      await this.makeRequest(`${this.baseURL}/${industryId}`, {
        method: 'DELETE'
      });

      return {
        success: true,
        data: null,
        message: 'Industry deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to delete industry'
      };
    }
  }

  // Additional utility methods for frontend needs

  // Search industries by name
  async searchIndustries(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllIndustries();
      }

      const response = await this.getAllIndustries();
      
      if (!response.success) {
        return response;
      }

      const filteredIndustries = response.data.filter(industry =>
        industry.IndustryName && 
        industry.IndustryName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        success: true,
        data: filteredIndustries,
        message: `Found ${filteredIndustries.length} industries matching "${searchTerm}"`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to search industries'
      };
    }
  }

  // Get active industries only
  async getActiveIndustries() {
    try {
      const response = await this.getAllIndustries();
      
      if (!response.success) {
        return response;
      }

      const activeIndustries = response.data.filter(industry =>
        industry.IsActive === true || industry.IsActive === 1
      );

      return {
        success: true,
        data: activeIndustries,
        message: `Found ${activeIndustries.length} active industries`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve active industries'
      };
    }
  }

  // Get industries sorted by name
  async getIndustriesSorted(ascending = true) {
    try {
      const response = await this.getAllIndustries();
      
      if (!response.success) {
        return response;
      }

      const sortedIndustries = [...response.data].sort((a, b) => {
        const nameA = (a.IndustryName || '').toLowerCase();
        const nameB = (b.IndustryName || '').toLowerCase();
        
        if (ascending) {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });

      return {
        success: true,
        data: sortedIndustries,
        message: `Industries sorted ${ascending ? 'ascending' : 'descending'}`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to sort industries'
      };
    }
  }

  // Check if industry name exists
  async checkIndustryNameExists(name, excludeId = null) {
    try {
      if (!name || name.trim() === '') {
        return {
          success: true,
          data: { exists: false },
          message: 'No name provided'
        };
      }

      const response = await this.getAllIndustries();
      
      if (!response.success) {
        return response;
      }

      const normalizedName = name.trim().toLowerCase();
      const exists = response.data.some(industry => 
        industry.IndustryName &&
        industry.IndustryName.toLowerCase() === normalizedName &&
        (!excludeId || industry.IndustryID !== excludeId)
      );

      return {
        success: true,
        data: { 
          exists,
          name: name.trim()
        },
        message: exists ? 'Industry name already exists' : 'Industry name is available'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to check industry name'
      };
    }
  }

  // Bulk operations
  async bulkDeleteIndustries(industryIds) {
    try {
      if (!industryIds || !Array.isArray(industryIds) || industryIds.length === 0) {
        throw new Error('Array of industry IDs is required');
      }

      const results = await Promise.allSettled(
        industryIds.map(id => this.deleteIndustry(id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: industryIds.length
        },
        message: `Deleted ${successful.length} out of ${industryIds.length} industries`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to bulk delete industries'
      };
    }
  }

  // Bulk activate/deactivate industries
  async bulkActivateIndustries(industryIds, activate = true) {
    try {
      if (!industryIds || !Array.isArray(industryIds) || industryIds.length === 0) {
        throw new Error('Array of industry IDs is required');
      }

      const action = activate ? 'reactivateIndustry' : 'deactivateIndustry';
      const results = await Promise.allSettled(
        industryIds.map(id => this[action](id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      const actionText = activate ? 'activated' : 'deactivated';
      
      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: industryIds.length
        },
        message: `${actionText} ${successful.length} out of ${industryIds.length} industries`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || `Failed to bulk ${activate ? 'activate' : 'deactivate'} industries`
      };
    }
  }

  // Create multiple industries
  async bulkCreateIndustries(industryNames) {
    try {
      if (!industryNames || !Array.isArray(industryNames) || industryNames.length === 0) {
        throw new Error('Array of industry names is required');
      }

      const validNames = industryNames
        .map(name => name && name.trim())
        .filter(name => name && name.length > 0);

      if (validNames.length === 0) {
        throw new Error('No valid industry names provided');
      }

      const results = await Promise.allSettled(
        validNames.map(name => this.createIndustry(name))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: validNames.length,
          createdIndustries: successful.map(r => r.value.data)
        },
        message: `Created ${successful.length} out of ${validNames.length} industries`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to bulk create industries'
      };
    }
  }

  // Get industry statistics
  async getIndustryStats() {
    try {
      const response = await this.getAllIndustries();
      
      if (!response.success) {
        return response;
      }

      const industries = response.data;
      const total = industries.length;
      const active = industries.filter(i => i.IsActive === true || i.IsActive === 1).length;
      const inactive = total - active;

      return {
        success: true,
        data: {
          total,
          active,
          inactive,
          activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) : '0.0'
        },
        message: 'Industry statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve industry statistics'
      };
    }
  }

  // Validation helpers
  validateIndustryName(name) {
    const errors = [];

    if (!name || name.trim() === '') {
      errors.push('Industry name is required');
    }

    if (name && name.trim().length < 2) {
      errors.push('Industry name must be at least 2 characters long');
    }

    if (name && name.trim().length > 100) {
      errors.push('Industry name must be less than 100 characters');
    }

    // Check for valid characters (letters, numbers, spaces, basic punctuation)
    if (name && !/^[a-zA-Z0-9\s\-&.,()]+$/.test(name.trim())) {
      errors.push('Industry name contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format industry name for display
  formatIndustryName(name) {
    if (!name) return '';
    
    return name.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Create lookup map for quick access
  createIndustryLookupMap(industries) {
    if (!Array.isArray(industries)) return {};
    
    return industries.reduce((map, industry) => {
      if (industry.IndustryID) {
        map[industry.IndustryID] = industry;
      }
      return map;
    }, {});
  }

  // Get industries for dropdown/select components
  async getIndustriesForDropdown(includeInactive = false) {
    try {
      const response = includeInactive 
        ? await this.getAllIndustries()
        : await this.getActiveIndustries();
      
      if (!response.success) {
        return response;
      }

      const options = response.data.map(industry => ({
        value: industry.IndustryID,
        label: this.formatIndustryName(industry.IndustryName),
        isActive: industry.IsActive === true || industry.IsActive === 1,
        raw: industry
      }));

      return {
        success: true,
        data: options,
        message: 'Industry dropdown options retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve industry dropdown options'
      };
    }
  }
}

// Create and export a singleton instance
const industryService = new IndustryService();
export default industryService;

// Also export the class for testing purposes
export { IndustryService };