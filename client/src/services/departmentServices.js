import api from '../utils/api';
const RESOURCE = '/departments';

//======================================
// Get all departments
//======================================
export async function getAllDepartments() {
   try {
    console.log('📡 Fetching departments from:', RESOURCE);
    const response = await api.get(RESOURCE);
    
    console.log('📡 Response.data:', response.data);
    
    // Handle if backend returns single object instead of array
    if (response.data && !Array.isArray(response.data) && response.data.DepartmentID) {
      console.log('📡 Converting single object to array');
      return [response.data]; // Wrap in array
    }
    
    // Return array or empty array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
}

//======================================
// Get department by ID
//======================================
export async function getDepartmentById(departmentId) {
  try {
    const response = await api.get(`${RESOURCE}/${departmentId}`);
    return response.data;
  }
    catch (error) {
    console.error(`Error fetching department with ID ${departmentId}:`, error);
    throw error;
  }
}
//======================================
// Create a new department
//======================================
export async function createDepartment(departmentName) {
    if (!departmentName) throw new Error('Department name is required');
    try {
        const response = await api.post(RESOURCE, { departmentName });
        return response.data;
    } catch (error) {
        console.error('Error creating department:', error);
        throw error;
    }
}

//======================================
// Update an existing department
//======================================
export async function updateDepartment(departmentId, departmentName) {
    if (!departmentId) throw new Error('Department ID is required');
    if (!departmentName) throw new Error('Department name is required');    
    try {
        const response = await api.put(`${RESOURCE}/${departmentId}`, { departmentName });
        return response.data;
    }
    catch (error) {
        console.error(`Error updating department with ID ${departmentId}:`, error);
        throw error;
    }
}

//======================================
// Deactivate a department
//======================================
export async function deactivateDepartment(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    try {
        const response = await api.delete(`${RESOURCE}/${departmentId}`);
        return response.data;
    }
    catch (error) {
        console.error(`Error deactivating department with ID ${departmentId}:`, error);
        throw error;
    }
}

//======================================
// Reactivate a department
//======================================
export async function reactivateDepartment(departmentId) {
    if (!departmentId) throw new Error('Department ID is required');
    try {
        const response = await api.patch(`${RESOURCE}/${departmentId}/reactivate`);
        return response.data;
    }
    catch (error) {
        console.error(`Error reactivating department with ID ${departmentId}:`, error);
        throw error;
    }
}

//======================================
// Exports
//======================================
export default {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deactivateDepartment,
    reactivateDepartment
};