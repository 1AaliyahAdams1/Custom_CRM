// activityTypeService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ActivityTypeService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/activity-types`;
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

  // Get all activity types
  async getAllActivityTypes() {
    try {
      const activityTypes = await this.makeRequest(this.baseURL);
      return {
        success: true,
        data: activityTypes,
        message: 'Activity types retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve activity types'
      };
    }
  }

  // Get activity type by ID
  async getActivityTypeById(typeId) {
    try {
      if (!typeId) {
        throw new Error('Type ID is required');
      }

      const activityType = await this.makeRequest(`${this.baseURL}/${typeId}`);
      return {
        success: true,
        data: activityType,
        message: 'Activity type retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve activity type'
      };
    }
  }

  // Create new activity type
  async createActivityType(activityTypeData) {
    try {
      if (!activityTypeData || typeof activityTypeData !== 'object') {
        throw new Error('Valid activity type data is required');
      }

      const { TypeName, Description } = activityTypeData;
      if (!TypeName || !Description) {
        throw new Error('Type name and description are required');
      }

      const validation = this.validateActivityTypeData(activityTypeData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const activityType = await this.makeRequest(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(activityTypeData)
      });

      return {
        success: true,
        data: activityType,
        message: 'Activity type created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create activity type'
      };
    }
  }

  // Update activity type
  async updateActivityType(typeId, activityTypeData) {
    try {
      if (!typeId) {
        throw new Error('Type ID is required');
      }

      if (!activityTypeData || typeof activityTypeData !== 'object') {
        throw new Error('Valid activity type data is required');
      }

      const activityType = await this.makeRequest(`${this.baseURL}/${typeId}`, {
        method: 'PUT',
        body: JSON.stringify(activityTypeData)
      });

      return {
        success: true,
        data: activityType,
        message: 'Activity type updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update activity type'
      };
    }
  }

  // Deactivate activity type
  async deactivateActivityType(typeId) {
    try {
      if (!typeId) {
        throw new Error('Type ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${typeId}/deactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'Activity type deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to deactivate activity type'
      };
    }
  }

  // Reactivate activity type
  async reactivateActivityType(typeId) {
    try {
      if (!typeId) {
        throw new Error('Type ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${typeId}/reactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'Activity type reactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reactivate activity type'
      };
    }
  }

  // Delete activity type
  async deleteActivityType(typeId) {
    try {
      if (!typeId) {
        throw new Error('Type ID is required');
      }

      await this.makeRequest(`${this.baseURL}/${typeId}`, {
        method: 'DELETE'
      });

      return {
        success: true,
        data: null,
        message: 'Activity type deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to delete activity type'
      };
    }
  }

  // Additional utility methods for frontend needs

  // Search activity types by name or description
  async searchActivityTypes(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllActivityTypes();
      }

      const response = await this.getAllActivityTypes();
      
      if (!response.success) {
        return response;
      }

      const searchTermLower = searchTerm.toLowerCase();
      const filteredActivityTypes = response.data.filter(activityType =>
        (activityType.TypeName && 
         activityType.TypeName.toLowerCase().includes(searchTermLower)) ||
        (activityType.Description && 
         activityType.Description.toLowerCase().includes(searchTermLower))
      );

      return {
        success: true,
        data: filteredActivityTypes,
        message: `Found ${filteredActivityTypes.length} activity types matching "${searchTerm}"`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to search activity types'
      };
    }
  }

  // Get active activity types only
  async getActiveActivityTypes() {
    try {
      const response = await this.getAllActivityTypes();
      
      if (!response.success) {
        return response;
      }

      const activeActivityTypes = response.data.filter(activityType =>
        activityType.IsActive === true || activityType.IsActive === 1
      );

      return {
        success: true,
        data: activeActivityTypes,
        message: `Found ${activeActivityTypes.length} active activity types`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve active activity types'
      };
    }
  }

  // Get activity types sorted by name
  async getActivityTypesSorted(ascending = true) {
    try {
      const response = await this.getAllActivityTypes();
      
      if (!response.success) {
        return response;
      }

      const sortedActivityTypes = [...response.data].sort((a, b) => {
        const nameA = (a.TypeName || '').toLowerCase();
        const nameB = (b.TypeName || '').toLowerCase();
        
        if (ascending) {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });

      return {
        success: true,
        data: sortedActivityTypes,
        message: `Activity types sorted ${ascending ? 'ascending' : 'descending'}`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to sort activity types'
      };
    }
  }

  // Get activity type by name
  async getActivityTypeByName(typeName) {
    try {
      if (!typeName || typeName.trim() === '') {
        throw new Error('Type name is required');
      }

      const response = await this.getAllActivityTypes();
      
      if (!response.success) {
        return response;
      }

      const activityType = response.data.find(at =>
        at.TypeName && 
        at.TypeName.toLowerCase() === typeName.toLowerCase()
      );

      if (!activityType) {
        return {
          success: false,
          data: null,
          message: `Activity type "${typeName}" not found`
        };
      }

      return {
        success: true,
        data: activityType,
        message: 'Activity type found successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to find activity type by name'
      };
    }
  }

  // Check if activity type name exists
  async checkActivityTypeNameExists(typeName, excludeId = null) {
    try {
      if (!typeName || typeName.trim() === '') {
        return {
          success: true,
          data: { exists: false },
          message: 'No name provided'
        };
      }

      const response = await this.getAllActivityTypes();
      
      if (!response.success) {
        return response;
      }

      const normalizedName = typeName.trim().toLowerCase();
      const exists = response.data.some(activityType => 
        activityType.TypeName &&
        activityType.TypeName.toLowerCase() === normalizedName &&
        (!excludeId || activityType.TypeID !== excludeId)
      );

      return {
        success: true,
        data: { 
          exists,
          name: typeName.trim()
        },
        message: exists ? 'Activity type name already exists' : 'Activity type name is available'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to check activity type name'
      };
    }
  }

  // Get activity types by category (if categories are supported)
  async getActivityTypesByCategory(category) {
    try {
      if (!category || category.trim() === '') {
        throw new Error('Category is required');
      }

      const response = await this.getAllActivityTypes();
      
      if (!response.success) {
        return response;
      }

      const filteredActivityTypes = response.data.filter(activityType =>
        activityType.Category && 
        activityType.Category.toLowerCase() === category.toLowerCase()
      );

      return {
        success: true,
        data: filteredActivityTypes,
        message: `Found ${filteredActivityTypes.length} activity types in category "${category}"`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve activity types by category'
      };
    }
  }

  // Bulk operations
  async bulkDeleteActivityTypes(typeIds) {
    try {
      if (!typeIds || !Array.isArray(typeIds) || typeIds.length === 0) {
        throw new Error('Array of activity type IDs is required');
      }

      const results = await Promise.allSettled(
        typeIds.map(id => this.deleteActivityType(id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: typeIds.length
        },
        message: `Deleted ${successful.length} out of ${typeIds.length} activity types`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to bulk delete activity types'
      };
    }
  }

  // Bulk activate/deactivate activity types
  async bulkActivateActivityTypes(typeIds, activate = true) {
    try {
      if (!typeIds || !Array.isArray(typeIds) || typeIds.length === 0) {
        throw new Error('Array of activity type IDs is required');
      }

      const action = activate ? 'reactivateActivityType' : 'deactivateActivityType';
      const results = await Promise.allSettled(
        typeIds.map(id => this[action](id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      const actionText = activate ? 'activated' : 'deactivated';
      
      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: typeIds.length
        },
        message: `${actionText} ${successful.length} out of ${typeIds.length} activity types`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || `Failed to bulk ${activate ? 'activate' : 'deactivate'} activity types`
      };
    }
  }

  // Create multiple activity types
  async bulkCreateActivityTypes(activityTypeDataArray) {
    try {
      if (!activityTypeDataArray || !Array.isArray(activityTypeDataArray) || activityTypeDataArray.length === 0) {
        throw new Error('Array of activity type data is required');
      }

      const results = await Promise.allSettled(
        activityTypeDataArray.map(data => this.createActivityType(data))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: activityTypeDataArray.length,
          createdActivityTypes: successful.map(r => r.value.data)
        },
        message: `Created ${successful.length} out of ${activityTypeDataArray.length} activity types`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to bulk create activity types'
      };
    }
  }

  // Get activity type statistics
  async getActivityTypeStats() {
    try {
      const response = await this.getAllActivityTypes();
      
      if (!response.success) {
        return response;
      }

      const activityTypes = response.data;
      const total = activityTypes.length;
      const active = activityTypes.filter(at => at.IsActive === true || at.IsActive === 1).length;
      const inactive = total - active;

      // Count by categories (if available)
      const categories = {};
      activityTypes.forEach(at => {
        if (at.Category) {
          categories[at.Category] = (categories[at.Category] || 0) + 1;
        }
      });

      return {
        success: true,
        data: {
          total,
          active,
          inactive,
          activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) : '0.0',
          categories,
          categoryCount: Object.keys(categories).length
        },
        message: 'Activity type statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve activity type statistics'
      };
    }
  }

  // Get all unique categories
  async getActivityTypeCategories() {
    try {
      const response = await this.getAllActivityTypes();
      
      if (!response.success) {
        return response;
      }

      const categories = [...new Set(
        response.data
          .filter(at => at.Category && at.Category.trim() !== '')
          .map(at => at.Category.trim())
      )].sort();

      return {
        success: true,
        data: categories,
        message: `Found ${categories.length} unique activity type categories`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve activity type categories'
      };
    }
  }

  // Validation helpers
  validateActivityTypeData(activityTypeData) {
    const errors = [];

    if (!activityTypeData.TypeName || activityTypeData.TypeName.trim() === '') {
      errors.push('Type name is required');
    }

    if (!activityTypeData.Description || activityTypeData.Description.trim() === '') {
      errors.push('Description is required');
    }

    if (activityTypeData.TypeName && activityTypeData.TypeName.length > 100) {
      errors.push('Type name must be less than 100 characters');
    }

    if (activityTypeData.Description && activityTypeData.Description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    if (activityTypeData.Category && activityTypeData.Category.length > 50) {
      errors.push('Category must be less than 50 characters');
    }

    // Check for valid characters in type name
    if (activityTypeData.TypeName && !/^[a-zA-Z0-9\s\-&.,()]+$/.test(activityTypeData.TypeName.trim())) {
      errors.push('Type name contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format activity type for display
  formatActivityTypeForDisplay(activityType) {
    if (!activityType) return '';
    
    const parts = [];
    
    if (activityType.TypeName) {
      parts.push(activityType.TypeName);
    }
    
    if (activityType.Category) {
      parts.push(`[${activityType.Category}]`);
    }
    
    return parts.join(' ');
  }

  // Create lookup map for quick access
  createActivityTypeLookupMap(activityTypes) {
    if (!Array.isArray(activityTypes)) return {};
    
    return activityTypes.reduce((map, activityType) => {
      if (activityType.TypeID) {
        map[activityType.TypeID] = activityType;
      }
      return map;
    }, {});
  }

  // Get activity types for dropdown/select components
  async getActivityTypesForDropdown(includeInactive = false, groupByCategory = false) {
    try {
      const response = includeInactive 
        ? await this.getAllActivityTypes()
        : await this.getActiveActivityTypes();
      
      if (!response.success) {
        return response;
      }

      const sortedActivityTypes = [...response.data].sort((a, b) => {
        const nameA = (a.TypeName || '').toLowerCase();
        const nameB = (b.TypeName || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      if (!groupByCategory) {
        const options = sortedActivityTypes.map(activityType => ({
          value: activityType.TypeID,
          label: this.formatActivityTypeForDisplay(activityType),
          description: activityType.Description,
          category: activityType.Category,
          isActive: activityType.IsActive === true || activityType.IsActive === 1,
          raw: activityType
        }));

        return {
          success: true,
          data: options,
          message: 'Activity type dropdown options retrieved successfully'
        };
      }

      // Group by category
      const grouped = sortedActivityTypes.reduce((groups, activityType) => {
        const category = activityType.Category || 'Uncategorized';
        if (!groups[category]) {
          groups[category] = [];
        }
        
        groups[category].push({
          value: activityType.TypeID,
          label: activityType.TypeName,
          description: activityType.Description,
          isActive: activityType.IsActive === true || activityType.IsActive === 1,
          raw: activityType
        });
        
        return groups;
      }, {});

      return {
        success: true,
        data: grouped,
        message: 'Activity type dropdown options grouped by category retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve activity type dropdown options'
      };
    }
  }
}

// Create and export a singleton instance
const activityTypeService = new ActivityTypeService();
export default activityTypeService;

// Also export the class for testing purposes
export { ActivityTypeService };