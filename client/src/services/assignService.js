// services/assignService.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const claimAccount = async (accountId) => {
  try {
    console.log('=== CLAIM SERVICE DEBUG ===');
    console.log('Claiming account ID:', accountId);
    
    const response = await api.patch(`/assign/${accountId}/claim`);
    
    console.log('Claim response:', response.data);
    console.log('=== END CLAIM SERVICE DEBUG ===');
    
    return response.data;
  } catch (error) {
    console.error('=== CLAIM SERVICE ERROR ===');
    console.error('Error claiming account:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('=== END CLAIM SERVICE ERROR ===');
    
    // Extract meaningful error message
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to claim account';
    
    throw new Error(errorMessage);
  }
};

export const assignUser = async (accountId, employeeId) => {
  try {
    console.log('=== ASSIGN SERVICE DEBUG ===');
    console.log('Assigning to account ID:', accountId, 'Employee ID:', employeeId);
    
    const response = await api.post(`/assign/${accountId}/assign`, {
      employeeId: employeeId
    });
    
    console.log('Assign response:', response.data);
    console.log('=== END ASSIGN SERVICE DEBUG ===');
    
    return response.data;
  } catch (error) {
    console.error('=== ASSIGN SERVICE ERROR ===');
    console.error('Error assigning user:', error);
    console.error('Error response:', error.response?.data);
    console.error('=== END ASSIGN SERVICE ERROR ===');
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to assign user';
    
    throw new Error(errorMessage);
  }
};