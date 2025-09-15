
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
