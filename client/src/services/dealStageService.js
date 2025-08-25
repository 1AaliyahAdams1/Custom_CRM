const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class DealStageService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/deal-stages`;
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

  // Get all deal stages
  async getAllDealStages() {
    try {
      const dealStages = await this.makeRequest(this.baseURL);
      return {
        success: true,
        data: dealStages,
        message: 'Deal stages retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve deal stages'
      };
    }
  }

  // Get deal stage by ID
  async getDealStageById(stageId) {
    try {
      if (!stageId) {
        throw new Error('Deal Stage ID is required');
      }

      const dealStage = await this.makeRequest(`${this.baseURL}/${stageId}`);
      return {
        success: true,
        data: dealStage,
        message: 'Deal stage retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve deal stage'
      };
    }
  }

  // Create new deal stage
  async createDealStage(dealStageData) {
    try {
      if (!dealStageData || typeof dealStageData !== 'object') {
        throw new Error('Valid deal stage data is required');
      }

      const validation = this.validateDealStageData(dealStageData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const dealStage = await this.makeRequest(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(dealStageData)
      });

      return {
        success: true,
        data: dealStage,
        message: 'Deal stage created successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to create deal stage'
      };
    }
  }

  // Update deal stage
  async updateDealStage(stageId, dealStageData) {
    try {
      if (!stageId) {
        throw new Error('Deal Stage ID is required');
      }

      if (!dealStageData || typeof dealStageData !== 'object') {
        throw new Error('Valid deal stage data is required');
      }

      const dealStage = await this.makeRequest(`${this.baseURL}/${stageId}`, {
        method: 'PUT',
        body: JSON.stringify(dealStageData)
      });

      return {
        success: true,
        data: dealStage,
        message: 'Deal stage updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to update deal stage'
      };
    }
  }

  // Deactivate deal stage
  async deactivateDealStage(stageId) {
    try {
      if (!stageId) {
        throw new Error('Deal Stage ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${stageId}/deactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'Deal stage deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to deactivate deal stage'
      };
    }
  }

  // Reactivate deal stage
  async reactivateDealStage(stageId) {
    try {
      if (!stageId) {
        throw new Error('Deal Stage ID is required');
      }

      const result = await this.makeRequest(`${this.baseURL}/${stageId}/reactivate`, {
        method: 'PATCH'
      });

      return {
        success: true,
        data: result,
        message: 'Deal stage reactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reactivate deal stage'
      };
    }
  }

  // Delete deal stage
  async deleteDealStage(stageId) {
    try {
      if (!stageId) {
        throw new Error('Deal Stage ID is required');
      }

      await this.makeRequest(`${this.baseURL}/${stageId}`, {
        method: 'DELETE'
      });

      return {
        success: true,
        data: null,
        message: 'Deal stage deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to delete deal stage'
      };
    }
  }

  // Additional utility methods for frontend needs

  // Get deal stages sorted by stage order
  async getDealStagesSorted() {
    try {
      const response = await this.getAllDealStages();
      
      if (!response.success) {
        return response;
      }

      const sortedDealStages = [...response.data].sort((a, b) => {
        // Sort by stage order (lower number = earlier stage)
        const orderA = a.StageOrder || 999;
        const orderB = b.StageOrder || 999;
        return orderA - orderB;
      });

      return {
        success: true,
        data: sortedDealStages,
        message: 'Deal stages sorted by stage order'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to sort deal stages'
      };
    }
  }

  // Get active deal stages only
  async getActiveDealStages() {
    try {
      const response = await this.getAllDealStages();
      
      if (!response.success) {
        return response;
      }

      const activeDealStages = response.data.filter(dealStage =>
        dealStage.IsActive === true || dealStage.IsActive === 1
      );

      return {
        success: true,
        data: activeDealStages,
        message: `Found ${activeDealStages.length} active deal stages`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve active deal stages'
      };
    }
  }

  // Search deal stages by name or description
  async searchDealStages(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllDealStages();
      }

      const response = await this.getAllDealStages();
      
      if (!response.success) {
        return response;
      }

      const searchTermLower = searchTerm.toLowerCase();
      const filteredDealStages = response.data.filter(dealStage =>
        (dealStage.StageName && 
         dealStage.StageName.toLowerCase().includes(searchTermLower)) ||
        (dealStage.Description && 
         dealStage.Description.toLowerCase().includes(searchTermLower))
      );

      return {
        success: true,
        data: filteredDealStages,
        message: `Found ${filteredDealStages.length} deal stages matching "${searchTerm}"`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to search deal stages'
      };
    }
  }

  // Get deal stage by name
  async getDealStageByName(stageName) {
    try {
      if (!stageName || stageName.trim() === '') {
        throw new Error('Stage name is required');
      }

      const response = await this.getAllDealStages();
      
      if (!response.success) {
        return response;
      }

      const dealStage = response.data.find(ds =>
        ds.StageName && 
        ds.StageName.toLowerCase() === stageName.toLowerCase()
      );

      if (!dealStage) {
        return {
          success: false,
          data: null,
          message: `Deal stage "${stageName}" not found`
        };
      }

      return {
        success: true,
        data: dealStage,
        message: 'Deal stage found successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to find deal stage by name'
      };
    }
  }

  // Get deal stages by pipeline (if pipelines are supported)
  async getDealStagesByPipeline(pipelineId) {
    try {
      if (!pipelineId) {
        throw new Error('Pipeline ID is required');
      }

      const response = await this.getAllDealStages();
      
      if (!response.success) {
        return response;
      }

      const filteredDealStages = response.data.filter(dealStage =>
        dealStage.PipelineID === pipelineId
      );

      return {
        success: true,
        data: filteredDealStages,
        message: `Found ${filteredDealStages.length} deal stages in pipeline`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve deal stages by pipeline'
      };
    }
  }

  // Get closing stages (typically final stages in a pipeline)
  async getClosingStages() {
    try {
      const response = await this.getAllDealStages();
      
      if (!response.success) {
        return response;
      }

      const closingStages = response.data.filter(dealStage =>
        dealStage.IsClosingStage === true || 
        dealStage.IsClosingStage === 1 ||
        (dealStage.StageName && 
         (dealStage.StageName.toLowerCase().includes('won') ||
          dealStage.StageName.toLowerCase().includes('lost') ||
          dealStage.StageName.toLowerCase().includes('closed')))
      );

      return {
        success: true,
        data: closingStages,
        message: `Found ${closingStages.length} closing stages`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve closing stages'
      };
    }
  }

  // Get winning stages (successful closing stages)
  async getWinningStages() {
    try {
      const response = await this.getAllDealStages();
      
      if (!response.success) {
        return response;
      }

      const winningStages = response.data.filter(dealStage =>
        dealStage.IsWinningStage === true || 
        dealStage.IsWinningStage === 1 ||
        (dealStage.StageName && 
         dealStage.StageName.toLowerCase().includes('won'))
      );

      return {
        success: true,
        data: winningStages,
        message: `Found ${winningStages.length} winning stages`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve winning stages'
      };
    }
  }

  // Get first/initial stage
  async getInitialStage(pipelineId = null) {
    try {
      const response = pipelineId 
        ? await this.getDealStagesByPipeline(pipelineId)
        : await this.getActiveDealStages();
      
      if (!response.success || response.data.length === 0) {
        return {
          success: false,
          data: null,
          message: 'No deal stages found'
        };
      }

      const initialStage = response.data.reduce((initial, current) => {
        const currentOrder = current.StageOrder || 999;
        const initialOrder = initial.StageOrder || 999;
        return currentOrder < initialOrder ? current : initial;
      });

      return {
        success: true,
        data: initialStage,
        message: 'Initial deal stage retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get initial deal stage'
      };
    }
  }

  // Get next stage in sequence
  async getNextStage(currentStageId, pipelineId = null) {
    try {
      if (!currentStageId) {
        throw new Error('Current stage ID is required');
      }

      const currentStageResponse = await this.getDealStageById(currentStageId);
      if (!currentStageResponse.success) {
        return currentStageResponse;
      }

      const currentStage = currentStageResponse.data;
      const currentOrder = currentStage.StageOrder || 0;

      const allStagesResponse = pipelineId 
        ? await this.getDealStagesByPipeline(pipelineId)
        : await this.getActiveDealStages();

      if (!allStagesResponse.success) {
        return allStagesResponse;
      }

      const nextStage = allStagesResponse.data
        .filter(stage => (stage.StageOrder || 999) > currentOrder)
        .reduce((next, current) => {
          const currentOrder = current.StageOrder || 999;
          const nextOrder = next ? (next.StageOrder || 999) : 999;
          return currentOrder < nextOrder ? current : next;
        }, null);

      if (!nextStage) {
        return {
          success: false,
          data: null,
          message: 'No next stage found'
        };
      }

      return {
        success: true,
        data: nextStage,
        message: 'Next deal stage retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get next deal stage'
      };
    }
  }

  // Get previous stage in sequence
  async getPreviousStage(currentStageId, pipelineId = null) {
    try {
      if (!currentStageId) {
        throw new Error('Current stage ID is required');
      }

      const currentStageResponse = await this.getDealStageById(currentStageId);
      if (!currentStageResponse.success) {
        return currentStageResponse;
      }

      const currentStage = currentStageResponse.data;
      const currentOrder = currentStage.StageOrder || 999;

      const allStagesResponse = pipelineId 
        ? await this.getDealStagesByPipeline(pipelineId)
        : await this.getActiveDealStages();

      if (!allStagesResponse.success) {
        return allStagesResponse;
      }

      const previousStage = allStagesResponse.data
        .filter(stage => (stage.StageOrder || 0) < currentOrder)
        .reduce((prev, current) => {
          const currentOrder = current.StageOrder || 0;
          const prevOrder = prev ? (prev.StageOrder || 0) : 0;
          return currentOrder > prevOrder ? current : prev;
        }, null);

      if (!previousStage) {
        return {
          success: false,
          data: null,
          message: 'No previous stage found'
        };
      }

      return {
        success: true,
        data: previousStage,
        message: 'Previous deal stage retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get previous deal stage'
      };
    }
  }

  // Bulk operations
  async bulkDeleteDealStages(stageIds) {
    try {
      if (!stageIds || !Array.isArray(stageIds) || stageIds.length === 0) {
        throw new Error('Array of deal stage IDs is required');
      }

      const results = await Promise.allSettled(
        stageIds.map(id => this.deleteDealStage(id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: stageIds.length
        },
        message: `Deleted ${successful.length} out of ${stageIds.length} deal stages`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to bulk delete deal stages'
      };
    }
  }

  // Bulk activate/deactivate deal stages
  async bulkActivateDealStages(stageIds, activate = true) {
    try {
      if (!stageIds || !Array.isArray(stageIds) || stageIds.length === 0) {
        throw new Error('Array of deal stage IDs is required');
      }

      const action = activate ? 'reactivateDealStage' : 'deactivateDealStage';
      const results = await Promise.allSettled(
        stageIds.map(id => this[action](id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      const actionText = activate ? 'activated' : 'deactivated';
      
      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: stageIds.length
        },
        message: `${actionText} ${successful.length} out of ${stageIds.length} deal stages`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || `Failed to bulk ${activate ? 'activate' : 'deactivate'} deal stages`
      };
    }
  }

  // Reorder deal stages
  async reorderDealStages(stageOrders) {
    try {
      if (!stageOrders || !Array.isArray(stageOrders) || stageOrders.length === 0) {
        throw new Error('Array of stage order objects is required');
      }

      const results = await Promise.allSettled(
        stageOrders.map(({ id, order }) => 
          this.updateDealStage(id, { StageOrder: order })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || !r.value.success);

      return {
        success: failed.length === 0,
        data: {
          successful: successful.length,
          failed: failed.length,
          total: stageOrders.length
        },
        message: `Reordered ${successful.length} out of ${stageOrders.length} deal stages`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reorder deal stages'
      };
    }
  }

  // Get deal stage statistics
  async getDealStageStats() {
    try {
      const response = await this.getAllDealStages();
      
      if (!response.success) {
        return response;
      }

      const dealStages = response.data;
      const total = dealStages.length;
      const active = dealStages.filter(ds => ds.IsActive === true || ds.IsActive === 1).length;
      const inactive = total - active;
      
      const closing = dealStages.filter(ds => ds.IsClosingStage === true || ds.IsClosingStage === 1).length;
      const winning = dealStages.filter(ds => ds.IsWinningStage === true || ds.IsWinningStage === 1).length;

      // Group by pipeline if pipeline data exists
      const pipelineStats = {};
      dealStages.forEach(stage => {
        if (stage.PipelineID) {
          const pipelineId = stage.PipelineID;
          if (!pipelineStats[pipelineId]) {
            pipelineStats[pipelineId] = 0;
          }
          pipelineStats[pipelineId]++;
        }
      });

      return {
        success: true,
        data: {
          total,
          active,
          inactive,
          activePercentage: total > 0 ? ((active / total) * 100).toFixed(1) : '0.0',
          closing,
          winning,
          pipelineDistribution: pipelineStats,
          pipelineCount: Object.keys(pipelineStats).length
        },
        message: 'Deal stage statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve deal stage statistics'
      };
    }
  }

  // Validation helpers
  validateDealStageData(dealStageData) {
    const errors = [];

    if (!dealStageData.StageName || dealStageData.StageName.trim() === '') {
      errors.push('Stage name is required');
    }

    if (dealStageData.StageName && dealStageData.StageName.length > 100) {
      errors.push('Stage name must be less than 100 characters');
    }

    if (dealStageData.Description && dealStageData.Description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    if (dealStageData.StageOrder !== undefined && 
        (typeof dealStageData.StageOrder !== 'number' || 
         dealStageData.StageOrder < 1 || 
         dealStageData.StageOrder > 100)) {
      errors.push('Stage order must be a number between 1 and 100');
    }

    if (dealStageData.Probability !== undefined && 
        (typeof dealStageData.Probability !== 'number' || 
         dealStageData.Probability < 0 || 
         dealStageData.Probability > 100)) {
      errors.push('Probability must be a number between 0 and 100');
    }

    if (dealStageData.Color && 
        !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(dealStageData.Color)) {
      errors.push('Color must be a valid hex color code');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format deal stage for display
  formatDealStageForDisplay(dealStage) {
    if (!dealStage) return '';
    
    const parts = [];
    
    if (dealStage.StageName) {
      parts.push(dealStage.StageName);
    }
    
    if (dealStage.Probability !== undefined) {
      parts.push(`(${dealStage.Probability}%)`);
    }
    
    return parts.join(' ');
  }

  // Create lookup map for quick access
  createDealStageLookupMap(dealStages) {
    if (!Array.isArray(dealStages)) return {};
    
    return dealStages.reduce((map, dealStage) => {
      if (dealStage.DealStageID) {
        map[dealStage.DealStageID] = dealStage;
      }
      return map;
    }, {});
  }

  // Get deal stages for dropdown/select components
  async getDealStagesForDropdown(pipelineId = null, includeInactive = false) {
    try {
      let response;
      
      if (pipelineId) {
        response = await this.getDealStagesByPipeline(pipelineId);
      } else {
        response = includeInactive 
          ? await this.getAllDealStages()
          : await this.getActiveDealStages();
      }
      
      if (!response.success) {
        return response;
      }

      // Sort by stage order for dropdown
      const sortedStages = [...response.data].sort((a, b) => {
        const orderA = a.StageOrder || 999;
        const orderB = b.StageOrder || 999;
        return orderA - orderB;
      });

      const options = sortedStages.map(dealStage => ({
        value: dealStage.DealStageID,
        label: this.formatDealStageForDisplay(dealStage),
        order: dealStage.StageOrder,
        probability: dealStage.Probability,
        color: dealStage.Color,
        isClosing: dealStage.IsClosingStage === true || dealStage.IsClosingStage === 1,
        isWinning: dealStage.IsWinningStage === true || dealStage.IsWinningStage === 1,
        isActive: dealStage.IsActive === true || dealStage.IsActive === 1,
        raw: dealStage
      }));

      return {
        success: true,
        data: options,
        message: 'Deal stage dropdown options retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to retrieve deal stage dropdown options'
      };
    }
  }

  // Get next available stage order
  async getNextAvailableStageOrder(pipelineId = null) {
    try {
      const response = pipelineId 
        ? await this.getDealStagesByPipeline(pipelineId)
        : await this.getAllDealStages();
      
      if (!response.success) {
        return response;
      }

      if (response.data.length === 0) {
        return {
          success: true,
          data: { nextOrder: 1 },
          message: 'Next available stage order is 1'
        };
      }

      const maxOrder = Math.max(...response.data.map(ds => ds.StageOrder || 0));
      const nextOrder = maxOrder + 1;

      return {
        success: true,
        data: { nextOrder },
        message: `Next available stage order is ${nextOrder}`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get next available stage order'
      };
    }
  }
}

// Create and export a singleton instance
const dealStageService = new DealStageService();
export default dealStageService;

// Also export the class for testing purposes
export { DealStageService };