import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import PriorityLevelPage from '../../pages/PriorityLevelsPage';
import {
  getAllCategories,
      getCategoryById,
      createCategory, 
      updateCategory,
      deactivateCategory,
      reactivateCategory
} from '../../services/categoryService';
import { 
  getAllDepartments, 
  getDepartmentById,
    createDepartment,
    updateDepartment,
    deactivateDepartment,
    reactivateDepartment

} from '../../services/departmentServices';

const PriorityLevelContainer = () => {
  // Priority Levels State
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('success');
  const [selected, setSelected] = useState([]);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [categoriesSuccessMessage, setCategoriesSuccessMessage] = useState('');
  const [categoriesSelected, setCategoriesSelected] = useState([]);

  // Departments State
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState(null);
  const [departmentsSuccessMessage, setDepartmentsSuccessMessage] = useState('');
  const [departmentsSelected, setDepartmentsSelected] = useState([]);

  // ============================================
  // PRIORITY LEVELS HANDLERS
  // ============================================

  // Fetch all priority levels
  const loadPriorityLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/prioritylevels');
      console.log('Priority levels loaded from backend:', response.data);
      
      setPriorityLevels(response.data || []);
    } catch (err) {
      console.error('Error loading priority levels:', err);
      setError(err.message || 'Failed to load priority levels');
      setPriorityLevels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPriorityLevels();
  }, [loadPriorityLevels]);

  const handleSelectClick = useCallback((id) => {
    setSelected(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(selectedId => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, []);

  const handleSelectAllClick = useCallback((event) => {
    if (event.target.checked) {
      const allIds = priorityLevels.map(priorityLevel => priorityLevel.PriorityLevelID);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  }, [priorityLevels]);

  const handleCreate = useCallback(async (priorityLevelData) => {
  try {
    setLoading(true);
    
    console.log('🔍 Received data:', priorityLevelData);
    
    // Map form fields to backend fields
    const dataToSend = {
      PriorityLevelName: priorityLevelData.PriorityName,
      PriorityLevelValue: priorityLevelData.PriorityOrder
    };
    
    console.log('📤 Sending:', dataToSend);
    
    const response = await api.post('/prioritylevels', dataToSend);
    
    if (response.data) {
      await loadPriorityLevels();
      setSuccessMessage('Priority level created successfully');
      setStatusMessage('Priority level created successfully');
      setStatusSeverity('success');
    }
  } catch (err) {
    console.error('Error creating priority level:', err);
    setError(err.message || 'Failed to create priority level');
    throw err;
  } finally {
    setLoading(false);
  }
}, [loadPriorityLevels]);

  const handleEdit = useCallback(async (priorityLevel) => {
    console.log('Edit priority level:', priorityLevel);
    setStatusMessage('Edit functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleView = useCallback((priorityLevel) => {
    console.log('View priority level:', priorityLevel);
    setStatusMessage('View functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleDelete = useCallback(async (priorityLevelId) => {
    try {
      await api.delete(`/prioritylevels/${priorityLevelId}`);
      await loadPriorityLevels();
      setSelected(prev => prev.filter(id => id !== priorityLevelId));
      setSuccessMessage('Priority level deleted successfully');
      setStatusMessage('Priority level deleted successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error deleting priority level:', err);
      setError(err.message || 'Failed to delete priority level');
    }
  }, [loadPriorityLevels]);

  const handleDeactivate = useCallback(async (priorityLevelId) => {
    try {
      await api.patch(`/prioritylevels/${priorityLevelId}/deactivate`);
      await loadPriorityLevels();
      setSuccessMessage('Priority level deactivated successfully');
      setStatusMessage('Priority level deactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error deactivating priority level:', err);
      setError(err.message || 'Failed to deactivate priority level');
    }
  }, [loadPriorityLevels]);

  const handleReactivate = useCallback(async (priorityLevelId) => {
    try {
      await api.patch(`/prioritylevels/${priorityLevelId}/reactivate`);
      await loadPriorityLevels();
      setSuccessMessage('Priority level reactivated successfully');
      setStatusMessage('Priority level reactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error reactivating priority level:', err);
      setError(err.message || 'Failed to reactivate priority level');
    }
  }, [loadPriorityLevels]);

  const handleBulkDeactivate = useCallback(async () => {
    try {
      const promises = selected.map(id => 
        api.patch(`/prioritylevels/${id}/deactivate`)
      );
      
      await Promise.all(promises);
      await loadPriorityLevels();
      setSelected([]);
      setSuccessMessage(`${selected.length} priority levels deactivated successfully`);
      setStatusMessage(`${selected.length} priority levels deactivated successfully`);
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error bulk deactivating priority levels:', err);
      setError(err.message || 'Failed to deactivate priority levels');
    }
  }, [selected, loadPriorityLevels]);

  const handleAddNote = useCallback((priorityLevel) => {
    console.log('Add note to priority level:', priorityLevel);
    setStatusMessage('Add note functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleAddAttachment = useCallback((priorityLevel) => {
    console.log('Add attachment to priority level:', priorityLevel);
    setStatusMessage('Add attachment functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleAssignUser = useCallback((priorityLevel) => {
    console.log('Assign user to priority level:', priorityLevel);
    setStatusMessage('Assign user functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  // ============================================
  // CATEGORIES HANDLERS
  // ============================================

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      
      const data = await getAllCategories();
      console.log('Categories loaded:', data);
      
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategoriesError(err.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
  loadCategories();
}, [loadCategories]);

  const handleCategorySelectClick = useCallback((id) => {
    setCategoriesSelected(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(selectedId => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, []);

  const handleCategorySelectAllClick = useCallback((event) => {
    if (event.target.checked) {
      const allIds = categories.map(category => category.CategoryID);
      setCategoriesSelected(allIds);
    } else {
      setCategoriesSelected([]);
    }
  }, [categories]);

  const handleCategoryCreate = useCallback(async (categoryData) => {
    try {
      setCategoriesLoading(true);
      await createCategory(categoryData);
      await loadCategories();
      setCategoriesSuccessMessage('Category created successfully');
      setStatusMessage('Category created successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error creating category:', err);
      setCategoriesError(err.message || 'Failed to create category');
      throw err;
    } finally {
      setCategoriesLoading(false);
    }
  }, [loadCategories]);

  const handleCategoryEdit = useCallback(async (category) => {
    console.log('Edit category:', category);
    setStatusMessage('Category edit functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleCategoryView = useCallback((category) => {
    console.log('View category:', category);
    setStatusMessage('Category view functionality to be implemented');
    setStatusSeverity('info');
  }, []);



  const handleCategoryDeactivate = useCallback(async (categoryId) => {
    try {
      await deactivateCategory(categoryId);
      await loadCategories();
      setCategoriesSuccessMessage('Category deactivated successfully');
      setStatusMessage('Category deactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error deactivating category:', err);
      setCategoriesError(err.message || 'Failed to deactivate category');
    }
  }, [loadCategories]);

  const handleCategoryReactivate = useCallback(async (categoryId) => {
    try {
      await reactivateCategory(categoryId);
      await loadCategories();
      setCategoriesSuccessMessage('Category reactivated successfully');
      setStatusMessage('Category reactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error reactivating category:', err);
      setCategoriesError(err.message || 'Failed to reactivate category');
    }
  }, [loadCategories]);

  const handleCategoryBulkDeactivate = useCallback(async () => {
    try {
      const promises = categoriesSelected.map(id => deactivateCategory(id));
      await Promise.all(promises);
      await loadCategories();
      setCategoriesSelected([]);
      setCategoriesSuccessMessage(`${categoriesSelected.length} categories deactivated successfully`);
      setStatusMessage(`${categoriesSelected.length} categories deactivated successfully`);
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error bulk deactivating categories:', err);
      setCategoriesError(err.message || 'Failed to deactivate categories');
    }
  }, [categoriesSelected, loadCategories]);

  // ============================================
  // DEPARTMENTS HANDLERS
  // ============================================

  const loadDepartments = useCallback(async () => {
  try {
    setDepartmentsLoading(true);
    setDepartmentsError(null);
    
    console.log('Attempting to load departments...');
    const data = await getAllDepartments();
    console.log('Departments loaded successfully:', data);
    
    setDepartments(data || []);
  } catch (err) {
    console.error('Error loading departments:', err);
    console.error('Error details:', err.response?.data); // See backend error
    console.error('Error status:', err.response?.status); // See status code
    setDepartmentsError(err.message || 'Failed to load departments');
    setDepartments([]);
  } finally {
    setDepartmentsLoading(false);
  }
}, []);

  const handleDepartmentSelectClick = useCallback((id) => {
    setDepartmentsSelected(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(selectedId => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, []);

  const handleDepartmentSelectAllClick = useCallback((event) => {
    if (event.target.checked) {
      const allIds = departments.map(dept => dept.DepartmentID);
      setDepartmentsSelected(allIds);
    } else {
      setDepartmentsSelected([]);
    }
  }, [departments]);

  const handleDepartmentCreate = useCallback(async (departmentData) => {
  try {
    setDepartmentsLoading(true);
    
    console.log('🔍 Creating department with:', departmentData);
    
    // Actually create the department
    await createDepartment(departmentData.DepartmentName);
    
    console.log('✅ Department created successfully');
    
    // Now reload the departments list
    await loadDepartments();
    
    setDepartmentsSuccessMessage('Department created successfully');
    setStatusMessage('Department created successfully');
    setStatusSeverity('success');
  } catch (err) {
    console.error('Error creating department:', err);
    setDepartmentsError(err.response?.data?.message || err.message || 'Failed to create department');
    throw err;
  } finally {
    setDepartmentsLoading(false);
  }
}, [loadDepartments]);

  const handleDepartmentEdit = useCallback(async (department) => {
    console.log('Edit department:', department);
    setStatusMessage('Department edit functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleDepartmentView = useCallback((department) => {
    console.log('View department:', department);
    setStatusMessage('Department view functionality to be implemented');
    setStatusSeverity('info');
  }, []);

  const handleDepartmentDelete = useCallback(async (departmentId) => {
    try {
      await api.delete(`/departments/${departmentId}`);
      await loadDepartments();
      setDepartmentsSelected(prev => prev.filter(id => id !== departmentId));
      setDepartmentsSuccessMessage('Department deleted successfully');
      setStatusMessage('Department deleted successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error deleting department:', err);
      setDepartmentsError(err.message || 'Failed to delete department');
    }
  }, [loadDepartments]);

  const handleDepartmentDeactivate = useCallback(async (departmentId) => {
    try {
      await api.patch(`/departments/${departmentId}/deactivate`);
      await loadDepartments();
      setDepartmentsSuccessMessage('Department deactivated successfully');
      setStatusMessage('Department deactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error deactivating department:', err);
      setDepartmentsError(err.message || 'Failed to deactivate department');
    }
  }, [loadDepartments]);

  const handleDepartmentReactivate = useCallback(async (departmentId) => {
    try {
      await api.patch(`/departments/${departmentId}/reactivate`);
      await loadDepartments();
      setDepartmentsSuccessMessage('Department reactivated successfully');
      setStatusMessage('Department reactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error reactivating department:', err);
      setDepartmentsError(err.message || 'Failed to reactivate department');
    }
  }, [loadDepartments]);

  const handleDepartmentBulkDeactivate = useCallback(async () => {
    try {
      const promises = departmentsSelected.map(id => 
        api.patch(`/departments/${id}/deactivate`)
      );
      await Promise.all(promises);
      await loadDepartments();
      setDepartmentsSelected([]);
      setDepartmentsSuccessMessage(`${departmentsSelected.length} departments deactivated successfully`);
      setStatusMessage(`${departmentsSelected.length} departments deactivated successfully`);
      setStatusSeverity('success');
    } catch (err) {
      console.error('Error bulk deactivating departments:', err);
      setDepartmentsError(err.message || 'Failed to deactivate departments');
    }
  }, [departmentsSelected, loadDepartments]);

  // ============================================
  // BUILD PROPS OBJECTS FOR CHILD COMPONENTS
  // ============================================

  const categoryProps = {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    setError: setCategoriesError,
    successMessage: categoriesSuccessMessage,
    setSuccessMessage: setCategoriesSuccessMessage,
    statusMessage,
    statusSeverity,
    setStatusMessage,
    selected: categoriesSelected,
    onSelectClick: handleCategorySelectClick,
    onSelectAllClick: handleCategorySelectAllClick,
    onDeactivate: handleCategoryDeactivate,
    onReactivate: handleCategoryReactivate,
    
    onBulkDeactivate: handleCategoryBulkDeactivate,
    onEdit: handleCategoryEdit,
    onView: handleCategoryView,
    onCreate: handleCategoryCreate,
    loadCategories,
  };

  const departmentProps = {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
    setError: setDepartmentsError,
    successMessage: departmentsSuccessMessage,
    setSuccessMessage: setDepartmentsSuccessMessage,
    statusMessage,
    statusSeverity,
    setStatusMessage,
    selected: departmentsSelected,
    onSelectClick: handleDepartmentSelectClick,
    onSelectAllClick: handleDepartmentSelectAllClick,
    onDeactivate: handleDepartmentDeactivate,
    onReactivate: handleDepartmentReactivate,
    onDelete: handleDepartmentDelete,
    onBulkDeactivate: handleDepartmentBulkDeactivate,
    onEdit: handleDepartmentEdit,
    onView: handleDepartmentView,
    onCreate: handleDepartmentCreate,
    loadDepartments,
  };

  return (
    <PriorityLevelPage
      // Priority Levels Props
      priorityLevels={priorityLevels}
      loading={loading}
      error={error}
      setError={setError}
      successMessage={successMessage}
      setSuccessMessage={setSuccessMessage}
      statusMessage={statusMessage}
      statusSeverity={statusSeverity}
      setStatusMessage={setStatusMessage}
      selected={selected}
      onSelectClick={handleSelectClick}
      onSelectAllClick={handleSelectAllClick}
      onDeactivate={handleDeactivate}
      onReactivate={handleReactivate}
      onDelete={handleDelete}
      onBulkDeactivate={handleBulkDeactivate}
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleCreate}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
      onAssignUser={handleAssignUser}
      // Category Props
      categoryProps={categoryProps}
      // Department Props
      departmentProps={departmentProps}
    />
  );
};

export default PriorityLevelContainer;