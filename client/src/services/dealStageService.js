import api from "../utils/api"; // adjust the path to your axios instance

class DealStageService {
  constructor() {
    this.baseURL = "/deal-stages";
  }

  // ---------------------------
  // Core CRUD Methods
  // ---------------------------

  async getAllDealStages() {
    try {
      const { data } = await api.get(this.baseURL);
      return { success: true, data, message: "Deal stages retrieved successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to retrieve deal stages" };
    }
  }

  async getDealStageById(stageId) {
    try {
      if (!stageId) throw new Error("Deal Stage ID is required");
      const { data } = await api.get(`${this.baseURL}/${stageId}`);
      return { success: true, data, message: "Deal stage retrieved successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to retrieve deal stage" };
    }
  }

  async createDealStage(dealStageData) {
    try {
      const validation = this.validateDealStageData(dealStageData);
      if (!validation.isValid) throw new Error(validation.errors.join(", "));

      const { data } = await api.post(this.baseURL, dealStageData);
      return { success: true, data, message: "Deal stage created successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to create deal stage" };
    }
  }

  async updateDealStage(stageId, dealStageData) {
    try {
      if (!stageId) throw new Error("Deal Stage ID is required");
      const { data } = await api.put(`${this.baseURL}/${stageId}`, dealStageData);
      return { success: true, data, message: "Deal stage updated successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to update deal stage" };
    }
  }

  async deleteDealStage(stageId) {
    try {
      if (!stageId) throw new Error("Deal Stage ID is required");
      await api.delete(`${this.baseURL}/${stageId}`);
      return { success: true, data: null, message: "Deal stage deleted successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to delete deal stage" };
    }
  }

  async deactivateDealStage(stageId) {
    try {
      if (!stageId) throw new Error("Deal Stage ID is required");
      const { data } = await api.patch(`${this.baseURL}/${stageId}/deactivate`);
      return { success: true, data, message: "Deal stage deactivated successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to deactivate deal stage" };
    }
  }

  async reactivateDealStage(stageId) {
    try {
      if (!stageId) throw new Error("Deal Stage ID is required");
      const { data } = await api.patch(`${this.baseURL}/${stageId}/reactivate`);
      return { success: true, data, message: "Deal stage reactivated successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to reactivate deal stage" };
    }
  }

  // ---------------------------
  // Utility / Helper Methods
  // ---------------------------

  validateDealStageData(dealStageData) {
    const errors = [];
    if (!dealStageData.StageName || !dealStageData.StageName.trim()) errors.push("Stage name is required");
    if (dealStageData.StageName?.length > 100) errors.push("Stage name must be less than 100 characters");
    if (dealStageData.Description?.length > 500) errors.push("Description must be less than 500 characters");
    if (dealStageData.StageOrder !== undefined && (typeof dealStageData.StageOrder !== "number" || dealStageData.StageOrder < 1 || dealStageData.StageOrder > 100)) errors.push("Stage order must be between 1 and 100");
    if (dealStageData.Probability !== undefined && (typeof dealStageData.Probability !== "number" || dealStageData.Probability < 0 || dealStageData.Probability > 100)) errors.push("Probability must be between 0 and 100");
    if (dealStageData.Color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(dealStageData.Color)) errors.push("Color must be a valid hex code");
    return { isValid: errors.length === 0, errors };
  }

  formatDealStageForDisplay(dealStage) {
    if (!dealStage) return "";
    const parts = [];
    if (dealStage.StageName) parts.push(dealStage.StageName);
    if (dealStage.Probability !== undefined) parts.push(`(${dealStage.Probability}%)`);
    return parts.join(" ");
  }

  createDealStageLookupMap(dealStages) {
    if (!Array.isArray(dealStages)) return {};
    return dealStages.reduce((map, stage) => {
      if (stage.DealStageID) map[stage.DealStageID] = stage;
      return map;
    }, {});
  }

  // ---------------------------
  // Active / Sorted / Search
  // ---------------------------

  async getActiveDealStages() {
    const response = await this.getAllDealStages();
    if (!response.success) return response;
    const activeStages = response.data.filter(ds => ds.IsActive === true || ds.IsActive === 1);
    return { success: true, data: activeStages, message: `Found ${activeStages.length} active deal stages` };
  }

  async getDealStagesSorted() {
    const response = await this.getAllDealStages();
    if (!response.success) return response;
    const sortedStages = [...response.data].sort((a, b) => (a.StageOrder || 999) - (b.StageOrder || 999));
    return { success: true, data: sortedStages, message: "Deal stages sorted by stage order" };
  }

  async searchDealStages(searchTerm) {
    if (!searchTerm?.trim()) return this.getAllDealStages();
    const response = await this.getAllDealStages();
    if (!response.success) return response;
    const filtered = response.data.filter(ds =>
      ds.StageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.Description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { success: true, data: filtered, message: `Found ${filtered.length} deal stages matching "${searchTerm}"` };
  }

  async getDealStageByName(stageName) {
    if (!stageName?.trim()) return { success: false, data: null, message: "Stage name is required" };
    const response = await this.getAllDealStages();
    if (!response.success) return response;
    const dealStage = response.data.find(ds => ds.StageName?.toLowerCase() === stageName.toLowerCase());
    if (!dealStage) return { success: false, data: null, message: `Deal stage "${stageName}" not found` };
    return { success: true, data: dealStage, message: "Deal stage found successfully" };
  }

  // ---------------------------
  // Pipeline / Stage Utilities
  // ---------------------------

  async getDealStagesByPipeline(pipelineId) {
    if (!pipelineId) return { success: false, data: null, message: "Pipeline ID is required" };
    const response = await this.getAllDealStages();
    if (!response.success) return response;
    const filtered = response.data.filter(ds => ds.PipelineID === pipelineId);
    return { success: true, data: filtered, message: `Found ${filtered.length} deal stages in pipeline` };
  }

  async getClosingStages() {
    const response = await this.getAllDealStages();
    if (!response.success) return response;
    const closingStages = response.data.filter(ds =>
      ds.IsClosingStage === true || ds.IsClosingStage === 1 ||
      ds.StageName?.toLowerCase().includes("won") ||
      ds.StageName?.toLowerCase().includes("lost") ||
      ds.StageName?.toLowerCase().includes("closed")
    );
    return { success: true, data: closingStages, message: `Found ${closingStages.length} closing stages` };
  }

  async getWinningStages() {
    const response = await this.getAllDealStages();
    if (!response.success) return response;
    const winningStages = response.data.filter(ds =>
      ds.IsWinningStage === true || ds.IsWinningStage === 1 ||
      ds.StageName?.toLowerCase().includes("won")
    );
    return { success: true, data: winningStages, message: `Found ${winningStages.length} winning stages` };
  }

  async getInitialStage(pipelineId = null) {
    const stages = pipelineId ? await this.getDealStagesByPipeline(pipelineId) : await this.getActiveDealStages();
    if (!stages.success || !stages.data.length) return { success: false, data: null, message: "No deal stages found" };
    const initial = stages.data.reduce((first, cur) => (cur.StageOrder || 999) < (first.StageOrder || 999) ? cur : first);
    return { success: true, data: initial, message: "Initial deal stage retrieved successfully" };
  }

  async getNextStage(currentStageId, pipelineId = null) {
    if (!currentStageId) return { success: false, data: null, message: "Current stage ID is required" };
    const currentStageResp = await this.getDealStageById(currentStageId);
    if (!currentStageResp.success) return currentStageResp;
    const currentOrder = currentStageResp.data.StageOrder || 0;

    const allStagesResp = pipelineId ? await this.getDealStagesByPipeline(pipelineId) : await this.getActiveDealStages();
    if (!allStagesResp.success) return allStagesResp;

    const nextStage = allStagesResp.data
      .filter(s => (s.StageOrder || 999) > currentOrder)
      .reduce((next, cur) => ((cur.StageOrder || 999) < (next?.StageOrder || 999) ? cur : next), null);
    if (!nextStage) return { success: false, data: null, message: "No next stage found" };
    return { success: true, data: nextStage, message: "Next deal stage retrieved successfully" };
  }

  async getPreviousStage(currentStageId, pipelineId = null) {
    if (!currentStageId) return { success: false, data: null, message: "Current stage ID is required" };
    const currentStageResp = await this.getDealStageById(currentStageId);
    if (!currentStageResp.success) return currentStageResp;
    const currentOrder = currentStageResp.data.StageOrder || 0;

    const allStagesResp = pipelineId ? await this.getDealStagesByPipeline(pipelineId) : await this.getActiveDealStages();
    if (!allStagesResp.success) return allStagesResp;

    const prevStage = allStagesResp.data
      .filter(s => (s.StageOrder || 0) < currentOrder)
      .reduce((prev, cur) => ((cur.StageOrder || 0) > (prev?.StageOrder || 0) ? cur : prev), null);
    if (!prevStage) return { success: false, data: null, message: "No previous stage found" };
    return { success: true, data: prevStage, message: "Previous deal stage retrieved successfully" };
  }

  // ---------------------------
  // Bulk Operations
  // ---------------------------

  async bulkDeleteDealStages(stageIds) {
    if (!stageIds?.length) return { success: false, data: null, message: "Array of deal stage IDs is required" };
    const results = await Promise.allSettled(stageIds.map(id => this.deleteDealStage(id)));
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
    const failed = results.filter(r => r.status === "rejected" || !r.value.success);
    return {
      success: failed.length === 0,
      data: { successful: successful.length, failed: failed.length, total: stageIds.length },
      message: `Deleted ${successful.length} out of ${stageIds.length} deal stages`
    };
  }

  async bulkActivateDealStages(stageIds, activate = true) {
    if (!stageIds?.length) return { success: false, data: null, message: "Array of deal stage IDs is required" };
    const action = activate ? "reactivateDealStage" : "deactivateDealStage";
    const results = await Promise.allSettled(stageIds.map(id => this[action](id)));
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
    const failed = results.filter(r => r.status === "rejected" || !r.value.success);
    const actionText = activate ? "activated" : "deactivated";
    return {
      success: failed.length === 0,
      data: { successful: successful.length, failed: failed.length, total: stageIds.length },
      message: `${actionText} ${successful.length} out of ${stageIds.length} deal stages`
    };
  }

  // ---------------------------
  // Reordering
  // ---------------------------

  async reorderDealStages(stageOrders) {
    if (!stageOrders?.length) return { success: false, data: null, message: "Array of stage order objects is required" };
    const results = await Promise.allSettled(stageOrders.map(({ id, order }) => this.updateDealStage(id, { StageOrder: order })));
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
    const failed = results.filter(r => r.status === "rejected" || !r.value.success);
    return {
      success: failed.length === 0,
      data: { successful: successful.length, failed: failed.length, total: stageOrders.length },
      message: `Reordered ${successful.length} out of ${stageOrders.length} deal stages`
    };
  }

  // ---------------------------
  // Dropdown / Lookup Helpers
  // ---------------------------

  async getDropdownOptions(includeInactive = false) {
    const stagesResp = includeInactive ? await this.getAllDealStages() : await this.getActiveDealStages();
    if (!stagesResp.success) return stagesResp;
    const options = stagesResp.data.map(ds => ({ label: ds.StageName, value: ds.DealStageID }));
    return { success: true, data: options, message: "Dropdown options retrieved successfully" };
  }

  async getLookupMap(includeInactive = false) {
    const stagesResp = includeInactive ? await this.getAllDealStages() : await this.getActiveDealStages();
    if (!stagesResp.success) return stagesResp;
    return { success: true, data: this.createDealStageLookupMap(stagesResp.data), message: "Lookup map created successfully" };
  }

  // ---------------------------
  // Stats / Counts
  // ---------------------------

  async getDealStageCounts() {
    const stagesResp = await this.getAllDealStages();
    if (!stagesResp.success) return stagesResp;
    const counts = stagesResp.data.reduce((acc, stage) => {
      const pipelineKey = stage.PipelineID || "unknown";
      acc[pipelineKey] = (acc[pipelineKey] || 0) + 1;
      return acc;
    }, {});
    return { success: true, data: counts, message: "Deal stage counts by pipeline retrieved successfully" };
  }
}

const dealStageService = new DealStageService();
export default dealStageService;
export { DealStageService };
