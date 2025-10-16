import api from "../utils/api";

class PriorityLevelService {
  constructor() {
    this.baseURL = '/prioritylevels';
  }

  // -----------------------
  // Core CRUD Methods
  // -----------------------

  async getAllPriorityLevels() {
    try {
      const { data } = await api.get(this.baseURL);
      return { success: true, data, message: "Priority levels retrieved successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to retrieve priority levels" };
    }
  }

  async getPriorityLevelById(priorityLevelId) {
    if (!priorityLevelId) return { success: false, data: null, message: "Priority Level ID is required" };
    try {
      const { data } = await api.get(`${this.baseURL}/${priorityLevelId}`);
      return { success: true, data, message: "Priority level retrieved successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to retrieve priority level" };
    }
  }

  async createPriorityLevel(priorityLevelData) {
    try {
      if (!priorityLevelData || typeof priorityLevelData !== "object") throw new Error("Valid priority level data is required");
      const validation = this.validatePriorityLevelData(priorityLevelData);
      if (!validation.isValid) throw new Error(validation.errors.join(", "));
      const { data } = await api.post(this.baseURL, priorityLevelData);
      return { success: true, data, message: "Priority level created successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to create priority level" };
    }
  }

  async updatePriorityLevel(priorityLevelId, priorityLevelData) {
    try {
      if (!priorityLevelId) throw new Error("Priority Level ID is required");
      if (!priorityLevelData || typeof priorityLevelData !== "object") throw new Error("Valid priority level data is required");
      const { data } = await api.put(`${this.baseURL}/${priorityLevelId}`, priorityLevelData);
      return { success: true, data, message: "Priority level updated successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to update priority level" };
    }
  }

  async deactivatePriorityLevel(priorityLevelId) {
    try {
      if (!priorityLevelId) throw new Error("Priority Level ID is required");
      const { data } = await api.patch(`${this.baseURL}/${priorityLevelId}/deactivate`);
      return { success: true, data, message: "Priority level deactivated successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to deactivate priority level" };
    }
  }

  async reactivatePriorityLevel(priorityLevelId) {
    try {
      if (!priorityLevelId) throw new Error("Priority Level ID is required");
      const { data } = await api.patch(`${this.baseURL}/${priorityLevelId}/reactivate`);
      return { success: true, data, message: "Priority level reactivated successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to reactivate priority level" };
    }
  }

  async deletePriorityLevel(priorityLevelId) {
    try {
      if (!priorityLevelId) throw new Error("Priority Level ID is required");
      await api.delete(`${this.baseURL}/${priorityLevelId}`);
      return { success: true, data: null, message: "Priority level deleted successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to delete priority level" };
    }
  }

  // -----------------------
  // Utility & Helper Methods
  // -----------------------

  validatePriorityLevelData(priorityLevelData) {
    const errors = [];
    
    // Check for PriorityLevelName (required)
    if (!priorityLevelData.PriorityLevelName || priorityLevelData.PriorityLevelName.trim() === "") {
      errors.push("Priority level name is required");
    }
    
    if (priorityLevelData.PriorityLevelName && priorityLevelData.PriorityLevelName.length > 100) {
      errors.push("Priority level name must be less than 100 characters");
    }
    
    // Check for PriorityLevelValue (required)
    if (priorityLevelData.PriorityLevelValue === undefined || priorityLevelData.PriorityLevelValue === null) {
      errors.push("Priority level value is required");
    }
    
    if (priorityLevelData.PriorityLevelValue !== undefined &&
        (typeof priorityLevelData.PriorityLevelValue !== "number" || 
         priorityLevelData.PriorityLevelValue < 0 || 
         priorityLevelData.PriorityLevelValue > 255)) {
      errors.push("Priority level value must be a number between 0 and 255");
    }
    
    // Optional fields
    if (priorityLevelData.Description && priorityLevelData.Description.length > 255) {
      errors.push("Description must be less than 255 characters");
    }
    
    if (priorityLevelData.Color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(priorityLevelData.Color)) {
      errors.push("Color must be a valid hex color code");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  formatPriorityLevelForDisplay(priorityLevel) {
    if (!priorityLevel) return "";
    const parts = [];
    if (priorityLevel.PriorityLevelName) parts.push(priorityLevel.PriorityLevelName);
    if (priorityLevel.PriorityLevelValue !== undefined) parts.push(`(${priorityLevel.PriorityLevelValue})`);
    return parts.join(" ");
  }

  createPriorityLevelLookupMap(priorityLevels) {
    if (!Array.isArray(priorityLevels)) return {};
    return priorityLevels.reduce((map, priorityLevel) => {
      if (priorityLevel.PriorityLevelID) map[priorityLevel.PriorityLevelID] = priorityLevel;
      return map;
    }, {});
  }

  // -----------------------
  // Active / Sorting / Search
  // -----------------------

  async getActivePriorityLevels() {
    const response = await this.getAllPriorityLevels();
    if (!response.success) return response;
    const active = response.data.filter(pl => pl.IsActive === true || pl.IsActive === 1);
    return { success: true, data: active, message: `Found ${active.length} active priority levels` };
  }

  async getPriorityLevelsSorted() {
    const response = await this.getAllPriorityLevels();
    if (!response.success) return response;
    const sorted = [...response.data].sort((a, b) => (a.PriorityLevelValue || 999) - (b.PriorityLevelValue || 999));
    return { success: true, data: sorted, message: "Priority levels sorted by value" };
  }

  async searchPriorityLevels(searchTerm) {
    if (!searchTerm || searchTerm.trim() === "") return this.getAllPriorityLevels();
    const response = await this.getAllPriorityLevels();
    if (!response.success) return response;
    const filtered = response.data.filter(pl =>
      (pl.PriorityLevelName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pl.Description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return { success: true, data: filtered, message: `Found ${filtered.length} matching priority levels` };
  }

  async getPriorityLevelByName(priorityName) {
    if (!priorityName || priorityName.trim() === "") return { success: false, data: null, message: "Priority name is required" };
    const response = await this.getAllPriorityLevels();
    if (!response.success) return response;
    const level = response.data.find(pl => pl.PriorityLevelName?.toLowerCase() === priorityName.toLowerCase());
    if (!level) return { success: false, data: null, message: `Priority level "${priorityName}" not found` };
    return { success: true, data: level, message: "Priority level found successfully" };
  }

  async getHighestPriorityLevel() {
    const response = await this.getActivePriorityLevels();
    if (!response.success || response.data.length === 0) return { success: false, data: null, message: "No active priority levels found" };
    const highest = response.data.reduce((prev, curr) => (curr.PriorityLevelValue || 999) < (prev.PriorityLevelValue || 999) ? curr : prev);
    return { success: true, data: highest, message: "Highest priority level retrieved successfully" };
  }

  async getLowestPriorityLevel() {
    const response = await this.getActivePriorityLevels();
    if (!response.success || response.data.length === 0) return { success: false, data: null, message: "No active priority levels found" };
    const lowest = response.data.reduce((prev, curr) => (curr.PriorityLevelValue || 0) > (prev.PriorityLevelValue || 0) ? curr : prev);
    return { success: true, data: lowest, message: "Lowest priority level retrieved successfully" };
  }

  // -----------------------
  // Bulk & Reorder Operations
  // -----------------------

  async bulkDeletePriorityLevels(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, data: null, message: "Array of IDs is required" };
    const results = await Promise.allSettled(ids.map(id => this.deletePriorityLevel(id)));
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
    const failed = results.filter(r => r.status === "rejected" || !r.value.success);
    return { success: failed.length === 0, data: { successful: successful.length, failed: failed.length, total: ids.length }, message: `Deleted ${successful.length} out of ${ids.length} priority levels` };
  }

  async bulkActivatePriorityLevels(ids, activate = true) {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, data: null, message: "Array of IDs is required" };
    const action = activate ? "reactivatePriorityLevel" : "deactivatePriorityLevel";
    const results = await Promise.allSettled(ids.map(id => this[action](id)));
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
    const failed = results.filter(r => r.status === "rejected" || !r.value.success);
    const actionText = activate ? "activated" : "deactivated";
    return { success: failed.length === 0, data: { successful: successful.length, failed: failed.length, total: ids.length }, message: `${actionText} ${successful.length} out of ${ids.length} priority levels` };
  }

  async reorderPriorityLevels(priorityLevelOrders) {
    if (!Array.isArray(priorityLevelOrders) || priorityLevelOrders.length === 0) return { success: false, data: null, message: "Array of order objects is required" };
    const results = await Promise.allSettled(priorityLevelOrders.map(({ id, value }) => this.updatePriorityLevel(id, { PriorityLevelValue: value })));
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
    const failed = results.filter(r => r.status === "rejected" || !r.value.success);
    return { success: failed.length === 0, data: { successful: successful.length, failed: failed.length, total: priorityLevelOrders.length }, message: `Reordered ${successful.length} out of ${priorityLevelOrders.length} priority levels` };
  }

  // -----------------------
  // Dropdown & Next Value
  // -----------------------

  async getPriorityLevelsForDropdown(includeInactive = false) {
    const response = includeInactive ? await this.getAllPriorityLevels() : await this.getActivePriorityLevels();
    if (!response.success) return response;
    const sorted = [...response.data].sort((a, b) => (a.PriorityLevelValue || 999) - (b.PriorityLevelValue || 999));
    const options = sorted.map(pl => ({
      value: pl.PriorityLevelID,
      label: this.formatPriorityLevelForDisplay(pl),
      priorityValue: pl.PriorityLevelValue,
      color: pl.Color,
      isActive: pl.IsActive === true || pl.IsActive === 1,
      raw: pl
    }));
    return { success: true, data: options, message: "Priority level dropdown options retrieved successfully" };
  }

  async getNextAvailablePriorityValue() {
    const response = await this.getAllPriorityLevels();
    if (!response.success) return response;
    if (response.data.length === 0) return { success: true, data: { nextValue: 1 }, message: "Next available priority value is 1" };
    const maxValue = Math.max(...response.data.map(pl => pl.PriorityLevelValue || 0));
    return { success: true, data: { nextValue: maxValue + 1 }, message: `Next available priority value is ${maxValue + 1}` };
  }

  async getPriorityLevelStats() {
    const response = await this.getAllPriorityLevels();
    if (!response.success) return response;
    const priorityLevels = response.data;
    const total = priorityLevels.length;
    const active = priorityLevels.filter(pl => pl.IsActive === true || pl.IsActive === 1).length;
    const inactive = total - active;
    const high = priorityLevels.filter(pl => (pl.PriorityLevelValue || 999) <= 3).length;
    const medium = priorityLevels.filter(pl => {
      const value = pl.PriorityLevelValue || 999;
      return value > 3 && value <= 7;
    }).length;
    const low = priorityLevels.filter(pl => (pl.PriorityLevelValue || 999) > 7).length;
    return { success: true, data: { total, active, inactive, activePercentage: total ? ((active / total) * 100).toFixed(1) : '0.0', highPriority: high, mediumPriority: medium, lowPriority: low }, message: "Priority level statistics retrieved successfully" };
  }
}

const priorityLevelService = new PriorityLevelService();
export default priorityLevelService;
export { PriorityLevelService };