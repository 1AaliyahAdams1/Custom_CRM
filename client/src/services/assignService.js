import api from "../utils/api";

export const claimAccount = async (accountId) => {
    try {
        const response = await api.patch(`/assign/${accountId}/claim`);
        return response.data;
    } catch (err) {
        console.error("Failed to claim account:", err);
        throw err?.response?.data || { message: err.message };
    }
};

export const assignUser = async (accountId, employeeId) => { 
    try {
        const response = await api.post(`/assign/${accountId}/assign`, { employeeId }); 
        return response.data;
    } catch (err) {
        console.error("Failed to assign user:", err);
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err.message;
        throw { message: errorMessage };
    }
};