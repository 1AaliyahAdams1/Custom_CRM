// priorityLevelService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class PriorityLevelService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/prioritylevels`;
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

  // Get all priority levels
  async getAllPriorityLevels() {
    try {
      const priorityLevels = await this.makeRequest(this.baseURL);
      return {
        success: true,
        data: priorityLevels,
        message: 'Priority levels retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve priority levels'
      };
    }
  }

  // Get priority level by ID
  async getPriorityLevelById(priorityLevelId) {
    try {
      if (!priorityLevelId) {
        throw new Error('Priority Level ID is required');
      }

      const priorityLevel = await this.makeRequest(`${this.baseURL}/${priorityLevelId}`);
      return {
        success: true,
        data: priorityLevel,
        message: 'Priority level retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve priority level'
      };
    }
  }

  // Create new priority level
  async createPriorityLevel(priorityLevelData) {
    try {
      if (!priorityLevelData || typeof priorityLevelData !== 'object') {
        throw new Error('Valid priority level data is required');
      }

      const validation = this.validatePriorityLevelData(priorityLevelData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const priorityLevel = await this.makeRequest(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(priorityLevelData)
      });

      return {
        success: true,
        data: priorityLevel,
        message: 'Priority level created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create priority level'
      };
    }
  }

  // Update priority level
  async updatePriorityLevel(priorityLevelId, priorityLevelData) {
    try {
      if (!priorityLevelId) {
        throw new Error('Priority Level ID is required');
      }

      if (!priorityLevelData || typeof priorityLevelData !== 'object') {
        throw new Error('Valid priority level data is required');
      }

      const priorityLevel = await this.makeRequest(`${this.baseURL}/${priorityLevelId}`, {
        method: 'PUT',
        body: JSON.stringify(priorityLevelData)
      });

      return {
        success: true,
        data: priorityLevel,
        message: 'Priority level updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update priority level'
      };
    }
  }

  // Deactivate priority level
  async deactivatePriorityLevel(priorityLevelId) {
    try {
      if (!priorityLevelId) {
        throw new Error('Priority Level ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${priorityLevelId}/deactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'Priority level deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to deactivate priority level'
      };
    }
  }

  // Reactivate priority level
  async reactivatePriorityLevel(priorityLevelId) {
    try {
      if (!priorityLevelId) {
        throw new Error('Priority Level ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${priorityLevelId}/reactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'Priority level reactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reactivate priority level'
      };
    }
  }

  // Delete priority level
  async deletePriorityLevel(priorityLevelId) {
    try {
      if (!priorityLevelId) {
        throw new Error('Priority Level ID is required');
      }

      await this.makeRequest(`${this.baseURL}/${priorityLevelId}`, {
        method: 'DELETE'
      });

      return {
        success: true,
        data: null,
        message: 'Priority level deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to delete priority level'
      };
    }
  }

  // Additional utility methods for frontend needs

  // Get priority levels sorted by priority order
  async getPriorityLevelsSorted() {
    try {
      const response = await this.getAllPriorityLevels();
      
      if (!response.success) {
        return response;
      }

      const sortedPriorityLevels = [...response.data].sort((a, b) => {
        // Sort by priority order (lower number = higher priority)
        const orderA = a.PriorityOrder || 999;
        const orderB = b.PriorityOrder || 999;
        return orderA - orderB;
      });

      return {
        success: true,
        data: sortedPriorityLevels,
        message: 'Priority levels sorted by priority order'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to sort priority levels'
      };
    }
  }

  // Get active priority levels only
  async getActivePriorityLevels() {
    try {
      const response = await this.getAllPriorityLevels();
      
      if (!response.success) {
        return response;
      }

      const activePriorityLevels = response.data.filter(priorityLevel =>
        priorityLevel.IsActive === true || priorityLevel.IsActive === 1
      );

      return {
        success: true,
        data: activePriorityLevels,
        message: `Found ${activePriorityLevels.length} active priority levels`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve active priority levels'
      };
    }
  }

  // Search priority levels by name
  async searchPriorityLevels(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllPriorityLevels();
      }

      const response = await this.getAllPriorityLevels();
      
      if (!response.success) {
        return response;
      }

      const filteredPriorityLevels = response.data.filter(priorityLevel =>
        (priorityLevel.PriorityName && 
         priorityLevel.PriorityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (priorityLevel.Description && 
         priorityLevel.Description.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return {
        success: true,
        data: filteredPriorityLevels,
        message: `Found ${filteredPriorityLevels.length} priority levels matching "${searchTerm}"`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to search priority levels'
      };
    }
  }

  // Get priority level by name
  async getPriorityLevelByName(priorityName) {
    try {
      if (!priorityName || priorityName.trim() === '') {
        throw new Error('Priority name is required');
      }

      const response = await this.getAllPriorityLevels();
      
      if (!response.success) {
        return response;
      }

      const priorityLevel = response.data.find(pl =>
        pl.PriorityName && 
        pl.PriorityName.toLowerCase() === priorityName.toLowerCase()
      );

      if (!priorityLevel) {
        return {
          success: false,
          data: null,
          message: `Priority level "${priorityName}" not found`
        };
      }

      return {
        success: true,
        data: priorityLevel,
        message: 'Priority level found successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to find priority level by name'
      };
    }
  }

  // Get highest priority level
  async getHighestPriorityLevel() {
    try {
      const response = await this.getActivePriorityLevels();
      
      if (!response.success || response.data.length === 0) {
        return {
          success: false,
          data: null,
          message: 'No active priority levels found'
        };
      }

      const highestPriority = response.data.reduce((highest, current) => {
        const currentOrder = current.PriorityOrder || 999;
        const highestOrder = highest.PriorityOrder || 999;
        return currentOrder < highestOrder ? current : highest;
      });

      return {
        success: true,
        data: highestPriority,
        message: 'Highest priority level retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get highest priority level'
      };
    }
  }

  // Get lowest priority level
  async getLowestPriorityLevel() {
    try {
      const response = await this.getActivePriorityLevels();
      
      if (!response.success || response.data.length === 0) {
        return {
          success: false,
          data: null,
          message: 'No active priority levels found'
        };
      }

      const lowestPriority = response.data.reduce((lowest, current) => {
        const currentOrder = current.PriorityOrder || 0;
        const lowestOrder = lowest.PriorityOrder || 0;
        return currentOrder > lowestOrder ? current : lowest;
      });

      return {
        success: true,
        data: lowestPriority,
        message: 'Lowest priority level retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get lowest priority level'
      };
    }
  }

  // Bulk operations
  async bulkDeletePriorityLevels(priorityLevelIds) {
    try {
      if (!priorityLevelIds || !Array.isArray(priorityLevelIds) || priorityLevelIds.length === 0) {
        throw new Error('Array of priority level IDs is required');
      }

      const results = await Promise.allSettled(
        priorityLevelIds.map(id => this.deletePriorityLevel(id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: priorityLevelIds.length
        },
        message: `Deleted ${successful.length} out of ${priorityLevelIds.length} priority levels`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to bulk delete priority levels'
      };
    }
  }

  // Bulk activate/deactivate priority levels
  async bulkActivatePriorityLevels(priorityLevelIds, activate = true) {
    try {
      if (!priorityLevelIds || !Array.isArray(priorityLevelIds) || priorityLevelIds.length === 0) {
        throw new Error('Array of priority level IDs is required');
      }

      const action = activate ? 'reactivatePriorityLevel' : 'deactivatePriorityLevel';
      const results = await Promise.allSettled(
        priorityLevelIds.map(id => this[action](id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      const actionText = activate ? 'activated' : 'deactivated';
      
      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: priorityLevelIds.length
        },
        message: `${actionText} ${successful.length} out of ${priorityLevelIds.length} priority levels`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || `Failed to bulk ${activate ? 'activate' : 'deactivate'} priority levels`
      };
    }
  }

  // Reorder priority levels
  async reorderPriorityLevels(priorityLevelOrders) {
    try {
      if (!priorityLevelOrders || !Array.isArray(priorityLevelOrders) || priorityLevelOrders.length === 0) {
        throw new Error('Array of priority level order objects is required');
      }

      const results = await Promise.allSettled(
        priorityLevelOrders.map(({ id, order }) => 
          this.updatePriorityLevel(id, { PriorityOrder: order })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: priorityLevelOrders.length
        },
        message: `Reordered ${successful.length} out of ${priorityLevelOrders.length} priority levels`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reorder priority levels'
      };
    }
  }

  // Get priority level statistics
  async getPriorityLevelStats() {
    try {
      const response = await this.getAllPriorityLevels();
      
      if (!response.success) {
        return response;
      }

      const priorityLevels = response.data;
      const total = priorityLevels.length;
      const active = priorityLevels.filter(pl => pl.IsActive === true || pl.IsActive === 1).length;
      const inactive = total - active;

      // Count by priority order ranges (if available)
      const highPriority = priorityLevels.filter(pl => (pl.PriorityOrder || 999) <= 3).length;
      const mediumPriority = priorityLevels.filter(pl => {
        const order = pl.PriorityOrder || 999;
        return order > 3 && order <= 7;
      }).length;
      const lowPriority = priorityLevels.filter(pl => (pl.PriorityOrder || 999) > 7).length;

      return {
        success: true,
        data: {
          total,
          active,
          inactive,
          activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) : '0.0',
          highPriority,
          mediumPriority,
          lowPriority
        },
        message: 'Priority level statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve priority level statistics'
      };
    }
  }

  // Validation helpers
  validatePriorityLevelData(priorityLevelData) {
    const errors = [];

    if (!priorityLevelData.PriorityName || priorityLevelData.PriorityName.trim() === '') {
      errors.push('Priority name is required');
    }

    if (priorityLevelData.PriorityName && priorityLevelData.PriorityName.length > 50) {
      errors.push('Priority name must be less than 50 characters');
    }

    if (priorityLevelData.Description && priorityLevelData.Description.length > 255) {
      errors.push('Description must be less than 255 characters');
    }

    if (priorityLevelData.PriorityOrder !== undefined && 
        (typeof priorityLevelData.PriorityOrder !== 'number' || 
         priorityLevelData.PriorityOrder < 1 || 
         priorityLevelData.PriorityOrder > 100)) {
      errors.push('Priority order must be a number between 1 and 100');
    }

    if (priorityLevelData.Color && 
        !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(priorityLevelData.Color)) {
      errors.push('Color must be a valid hex color code');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format priority level for display
  formatPriorityLevelForDisplay(priorityLevel) {
    if (!priorityLevel) return '';
    
    const parts = [];
    
    if (priorityLevel.PriorityName) {
      parts.push(priorityLevel.PriorityName);
    }
    
    if (priorityLevel.PriorityOrder) {
      parts.push(`(${priorityLevel.PriorityOrder})`);
    }
    
    return parts.join(' ');
  }

  // Create lookup map for quick access
  createPriorityLevelLookupMap(priorityLevels) {
    if (!Array.isArray(priorityLevels)) return {};
    
    return priorityLevels.reduce((map, priorityLevel) => {
      if (priorityLevel.PriorityLevelID) {
        map[priorityLevel.PriorityLevelID] = priorityLevel;
      }
      return map;
    }, {});
  }

  // Get priority levels for dropdown/select components
  async getPriorityLevelsForDropdown(includeInactive = false) {
    try {
      const response = includeInactive 
        ? await this.getAllPriorityLevels()
        : await this.getActivePriorityLevels();
      
      if (!response.success) {
        return response;
      }

      // Sort by priority order for dropdown
      const sortedLevels = [...response.data].sort((a, b) => {
        const orderA = a.PriorityOrder || 999;
        const orderB = b.PriorityOrder || 999;
        return orderA - orderB;
      });

      const options = sortedLevels.map(priorityLevel => ({
        value: priorityLevel.PriorityLevelID,
        label: this.formatPriorityLevelForDisplay(priorityLevel),
        order: priorityLevel.PriorityOrder,
        color: priorityLevel.Color,
        isActive: priorityLevel.IsActive === true || priorityLevel.IsActive === 1,
        raw: priorityLevel
      }));

      return {
        success: true,
        data: options,
        message: 'Priority level dropdown options retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve priority level dropdown options'
      };
    }
  }

  // Get next available priority order
  async getNextAvailablePriorityOrder() {
    try {
      const response = await this.getAllPriorityLevels();
      
      if (!response.success) {
        return response;
      }

      if (response.data.length === 0) {
        return {
          success: true,
          data: { nextOrder: 1 },
          message: 'Next available priority order is 1'
        };
      }

      const maxOrder = Math.max(...response.data.map(pl => pl.PriorityOrder || 0));
      const nextOrder = maxOrder + 1;

      return {
        success: true,
        data: { nextOrder },
        message: `Next available priority order is ${nextOrder}`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get next available priority order'
      };
    }
  }
}

// Create and export a singleton instance
const priorityLevelService = new PriorityLevelService();
export default priorityLevelService;

// Also export the class for testing purposes
export { PriorityLevelService };