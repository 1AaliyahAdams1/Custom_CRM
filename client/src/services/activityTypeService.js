import api from "../utils/api"; 

class ActivityTypeService {
  constructor() {
    this.baseURL = "/activity-types"; 
  }

  // -----------------------
  // Core CRUD Methods
  // -----------------------

  async getAllActivityTypes() {
    try {
      const { data } = await api.get(this.baseURL);
      return { success: true, data, message: "Activity types retrieved successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to retrieve activity types" };
    }
  }

  async getActivityTypeById(typeId) {
    if (!typeId) return { success: false, data: null, message: "Type ID is required" };
    try {
      const { data } = await api.get(`${this.baseURL}/${typeId}`);
      return { success: true, data, message: "Activity type retrieved successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to retrieve activity type" };
    }
  }

  async createActivityType(activityTypeData) {
    try {
      if (!activityTypeData || typeof activityTypeData !== "object") throw new Error("Valid activity type data is required");
      const validation = this.validateActivityTypeData(activityTypeData);
      if (!validation.isValid) throw new Error(validation.errors.join(", "));
      const { data } = await api.post(this.baseURL, activityTypeData);
      return { success: true, data, message: "Activity type created successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to create activity type" };
    }
  }

  async updateActivityType(typeId, activityTypeData) {
    try {
      if (!typeId) throw new Error("Type ID is required");
      if (!activityTypeData || typeof activityTypeData !== "object") throw new Error("Valid activity type data is required");
      const { data } = await api.put(`${this.baseURL}/${typeId}`, activityTypeData);
      return { success: true, data, message: "Activity type updated successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to update activity type" };
    }
  }

  async deactivateActivityType(typeId) {
    try {
      if (!typeId) throw new Error("Type ID is required");
      const { data } = await api.patch(`${this.baseURL}/${typeId}/deactivate`);
      return { success: true, data, message: "Activity type deactivated successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to deactivate activity type" };
    }
  }

  async reactivateActivityType(typeId) {
    try {
      if (!typeId) throw new Error("Type ID is required");
      const { data } = await api.patch(`${this.baseURL}/${typeId}/reactivate`);
      return { success: true, data, message: "Activity type reactivated successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to reactivate activity type" };
    }
  }

  async deleteActivityType(typeId) {
    try {
      if (!typeId) throw new Error("Type ID is required");
      await api.delete(`${this.baseURL}/${typeId}`);
      return { success: true, data: null, message: "Activity type deleted successfully" };
    } catch (error) {
      return { success: false, data: null, message: error.response?.data?.message || error.message || "Failed to delete activity type" };
    }
  }

  // -----------------------
  // Utility & Helper Methods
  // -----------------------

  validateActivityTypeData(activityTypeData) {
    const errors = [];
    if (!activityTypeData.TypeName || activityTypeData.TypeName.trim() === "") errors.push("Type name is required");
    if (!activityTypeData.Description || activityTypeData.Description.trim() === "") errors.push("Description is required");
    if (activityTypeData.TypeName && activityTypeData.TypeName.length > 100) errors.push("Type name must be less than 100 characters");
    if (activityTypeData.Description && activityTypeData.Description.length > 500) errors.push("Description must be less than 500 characters");
    if (activityTypeData.Category && activityTypeData.Category.length > 50) errors.push("Category must be less than 50 characters");
    if (activityTypeData.TypeName && !/^[a-zA-Z0-9\s\-&.,()]+$/.test(activityTypeData.TypeName.trim())) errors.push("Type name contains invalid characters");
    return { isValid: errors.length === 0, errors };
  }

  formatActivityTypeForDisplay(activityType) {
    if (!activityType) return "";
    const parts = [];
    if (activityType.TypeName) parts.push(activityType.TypeName);
    if (activityType.Category) parts.push(`[${activityType.Category}]`);
    return parts.join(" ");
  }

  createActivityTypeLookupMap(activityTypes) {
    if (!Array.isArray(activityTypes)) return {};
    return activityTypes.reduce((map, activityType) => {
      if (activityType.TypeID) map[activityType.TypeID] = activityType;
      return map;
    }, {});
  }

  // -----------------------
  // Search, Filtering & Sorting
  // -----------------------

  async searchActivityTypes(searchTerm) {
    const response = await this.getAllActivityTypes();
    if (!response.success) return response;
    if (!searchTerm || searchTerm.trim() === "") return response;
    const filtered = response.data.filter(at =>
      (at.TypeName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (at.Description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return { success: true, data: filtered, message: `Found ${filtered.length} activity types matching "${searchTerm}"` };
  }

  async getActiveActivityTypes() {
    const response = await this.getAllActivityTypes();
    if (!response.success) return response;
    const active = response.data.filter(at => at.IsActive === true || at.IsActive === 1);
    return { success: true, data: active, message: `Found ${active.length} active activity types` };
  }

  async getActivityTypesSorted(ascending = true) {
    const response = await this.getAllActivityTypes();
    if (!response.success) return response;
    const sorted = [...response.data].sort((a, b) => {
      const nameA = (a.TypeName || "").toLowerCase();
      const nameB = (b.TypeName || "").toLowerCase();
      return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return { success: true, data: sorted, message: `Activity types sorted ${ascending ? "ascending" : "descending"}` };
  }

  async getActivityTypeByName(typeName) {
    if (!typeName || typeName.trim() === "") return { success: false, data: null, message: "Type name is required" };
    const response = await this.getAllActivityTypes();
    if (!response.success) return response;
    const activityType = response.data.find(at => at.TypeName?.toLowerCase() === typeName.toLowerCase());
    if (!activityType) return { success: false, data: null, message: `Activity type "${typeName}" not found` };
    return { success: true, data: activityType, message: "Activity type found successfully" };
  }

  async checkActivityTypeNameExists(typeName, excludeId = null) {
    if (!typeName || typeName.trim() === "") return { success: true, data: { exists: false }, message: "No name provided" };
    const response = await this.getAllActivityTypes();
    if (!response.success) return response;
    const normalizedName = typeName.trim().toLowerCase();
    const exists = response.data.some(at =>
      at.TypeName && at.TypeName.toLowerCase() === normalizedName && (!excludeId || at.TypeID !== excludeId)
    );
    return { success: true, data: { exists, name: typeName.trim() }, message: exists ? "Activity type name already exists" : "Activity type name is available" };
  }

  // -----------------------
  // Bulk Operations
  // -----------------------

  async bulkDeleteActivityTypes(typeIds) {
    if (!Array.isArray(typeIds) || typeIds.length === 0) return { success: false, data: null, message: "Array of activity type IDs is required" };
    const results = await Promise.allSettled(typeIds.map(id => this.deleteActivityType(id)));
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
    const failed = results.filter(r => r.status === "rejected" || !r.value.success);
    return { success: failed.length === 0, data: { successful: successful.length, failed: failed.length, total: typeIds.length }, message: `Deleted ${successful.length} out of ${typeIds.length} activity types` };
  }

  async bulkActivateActivityTypes(typeIds, activate = true) {
    if (!Array.isArray(typeIds) || typeIds.length === 0) return { success: false, data: null, message: "Array of activity type IDs is required" };
    const action = activate ? "reactivateActivityType" : "deactivateActivityType";
    const results = await Promise.allSettled(typeIds.map(id => this[action](id)));
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
    const failed = results.filter(r => r.status === "rejected" || !r.value.success);
    const actionText = activate ? "activated" : "deactivated";
    return { success: failed.length === 0, data: { successful: successful.length, failed: failed.length, total: typeIds.length }, message: `${actionText} ${successful.length} out of ${typeIds.length} activity types` };
  }

  async bulkCreateActivityTypes(activityTypeDataArray) {
    if (!Array.isArray(activityTypeDataArray) || activityTypeDataArray.length === 0) return { success: false, data: null, message: "Array of activity type data is required" };
    const results = await Promise.allSettled(activityTypeDataArray.map(data => this.createActivityType(data)));
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success);
    const failed = results.filter(r => r.status === "rejected" || !r.value.success);
    return { success: failed.length === 0, data: { successful: successful.length, failed: failed.length, total: activityTypeDataArray.length, createdActivityTypes: successful.map(r => r.value.data) }, message: `Created ${successful.length} out of ${activityTypeDataArray.length} activity types` };
  }

  // -----------------------
  // Stats & Dropdown Helpers
  // -----------------------

  async getActivityTypeStats() {
    const response = await this.getAllActivityTypes();
    if (!response.success) return response;
    const activityTypes = response.data;
    const total = activityTypes.length;
    const active = activityTypes.filter(at => at.IsActive === true || at.IsActive === 1).length;
    const inactive = total - active;
    const categories = {};
    activityTypes.forEach(at => { if (at.Category) categories[at.Category] = (categories[at.Category] || 0) + 1; });
    return { success: true, data: { total, active, inactive, activePercentage: total ? ((active / total) * 100).toFixed(1) : '0.0', categories, categoryCount: Object.keys(categories).length }, message: "Activity type statistics retrieved successfully" };
  }

  async getActivityTypeCategories() {
    const response = await this.getAllActivityTypes();
    if (!response.success) return response;
    const categories = [...new Set(response.data.filter(at => at.Category && at.Category.trim() !== '').map(at => at.Category.trim()))].sort();
    return { success: true, data: categories, message: `Found ${categories.length} unique activity type categories` };
  }

  async getActivityTypesForDropdown(includeInactive = false, groupByCategory = false) {
    const response = includeInactive ? await this.getAllActivityTypes() : await this.getActiveActivityTypes();
    if (!response.success) return response;

    const sorted = [...response.data].sort((a, b) => (a.TypeName || "").toLowerCase().localeCompare((b.TypeName || "").toLowerCase()));

    if (!groupByCategory) {
      const options = sorted.map(at => ({ value: at.TypeID, label: this.formatActivityTypeForDisplay(at), description: at.Description, category: at.Category, isActive: at.IsActive === true || at.IsActive === 1, raw: at }));
      return { success: true, data: options, message: "Activity type dropdown options retrieved successfully" };
    }

    const grouped = sorted.reduce((groups, at) => {
      const category = at.Category || "Uncategorized";
      if (!groups[category]) groups[category] = [];
      groups[category].push({ value: at.TypeID, label: at.TypeName, description: at.Description, isActive: at.IsActive === true || at.IsActive === 1, raw: at });
      return groups;
    }, {});
    return { success: true, data: grouped, message: "Activity type dropdown options grouped by category retrieved successfully" };
  }
}

const activityTypeService = new ActivityTypeService();
export default activityTypeService;
export { ActivityTypeService };
