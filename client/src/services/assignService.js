import api from '../utils/api';

export const claimAccount = async (accountId) => {
  try {
    const response = await api.patch(`/assign/${accountId}/claim`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to claim account';
    throw new Error(errorMessage);
  }
};

export const assignUser = async (accountId, employeeId) => {
  try {
    const response = await api.post(`/assign/${accountId}/assign`, {
      employeeId: employeeId
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to assign user';
    throw new Error(errorMessage);
  }
};

export const removeAssignedUser = async (accountUserId) => {
  try {
    const response = await api.delete(`/assign/${accountUserId}`);
    
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to remove assigned user';
    throw new Error(errorMessage);
  }
};

export const removeSpecificUsers = async (accountId, userIds) => {
  try {
    const response = await api.delete(`/assign/account/${accountId}/users`, {
      data: { userIds }
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to unassign users';
    throw new Error(errorMessage);
  }
};

export const unclaimAccount = async (accountId) => {
  try {
    const response = await api.patch(`/assign/${accountId}/unclaim`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to unclaim account';
    throw new Error(errorMessage);
  }
};