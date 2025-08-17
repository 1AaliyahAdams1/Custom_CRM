// Client/services/dealService.js
import api from "../utils/api";

const RESOURCE = "/deals";

/**
 * Centralized error handler for logging and rethrowing
 */
const handleError = (context, error) => {
  console.error(`${context}:`, error?.response?.data || error.message || error);
  throw error;
};

/**
 * Validate deal data before API calls
 */
const validateDealData = (dealData, isUpdate = false) => {
  if (!dealData) throw new Error("Deal data is required");

  const { DealName, AccountID, DealStageID, Value, CloseDate, Probability } =
    dealData;

  if (!DealName?.trim()) throw new Error("Deal name is required");
  if (!AccountID) throw new Error("Account is required");
  if (!DealStageID) throw new Error("Deal stage is required");
  if (Value == null || Value <= 0)
    throw new Error("Value must be greater than 0");
  if (!CloseDate) throw new Error("Close date is required");
  if (
    Probability != null &&
    (isNaN(Probability) || Probability < 0 || Probability > 100)
  ) {
    throw new Error("Probability must be a number between 0 and 100");
  }
};

// ----------------------------------------------------------------------
// API Methods
// ----------------------------------------------------------------------

export const getAllDeals = async (onlyActive = true) => {
  try {
    const response = await api.get(RESOURCE, { params: { onlyActive } });
    return response?.data || [];
  } catch (error) {
    handleError("Error fetching deals", error);
  }
};

export const getDealById = async (id) => {
  if (!id) throw new Error("Deal ID is required");

  try {
    const response = await api.get(`${RESOURCE}/${encodeURIComponent(id)}`);
    return response?.data;
  } catch (error) {
    handleError(`Error fetching deal ${id}`, error);
  }
};

export const createDeal = async (dealData) => {
  try {
    validateDealData(dealData);
    const response = await api.post(RESOURCE, dealData);
    return response?.data;
  } catch (error) {
    handleError("Error creating deal", error);
  }
};

export const updateDeal = async (dealId, dealData) => {
  if (!dealId) throw new Error("Deal ID is required");

  try {
    validateDealData(dealData, true);
    const response = await api.put(
      `${RESOURCE}/${encodeURIComponent(dealId)}`,
      dealData
    );
    return response?.data;
  } catch (error) {
    handleError(`Error updating deal ${dealId}`, error);
  }
};

export const deactivateDeal = async (dealId) => {
  if (!dealId) throw new Error("Deal ID is required");

  try {
    const response = await api.patch(
      `${RESOURCE}/${encodeURIComponent(dealId)}/deactivate`
    );
    return response?.data;
  } catch (error) {
    handleError(`Error deactivating deal ${dealId}`, error);
  }
};

export const reactivateDeal = async (dealId) => {
  if (!dealId) throw new Error("Deal ID is required");

  try {
    const response = await api.patch(
      `${RESOURCE}/${encodeURIComponent(dealId)}/reactivate`
    );
    return response?.data;
  } catch (error) {
    handleError(`Error reactivating deal ${dealId}`, error);
  }
};

export const deleteDeal = async (dealId) => {
  if (!dealId) throw new Error("Deal ID is required");

  try {
    const response = await api.delete(
      `${RESOURCE}/${encodeURIComponent(dealId)}/delete`
    );
    return response?.data;
  } catch (error) {
    handleError(`Error deleting deal ${dealId}`, error);
  }
};

export const getDealsByUser = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const response = await api.get(
      `${RESOURCE}/user/${encodeURIComponent(userId)}`
    );
    return response?.data || [];
  } catch (error) {
    handleError(`Error fetching deals for user ${userId}`, error);
  }
};
