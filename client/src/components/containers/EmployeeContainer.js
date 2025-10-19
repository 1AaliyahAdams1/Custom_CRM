import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllJobTitles
}from "../../services/jobTitleService";

import {
  getAllDepartments
} from "../../services/departmentServices";

import{
  getAllCities
} from "../../services/cityService";

import{
  getAllStatesProvinces
} from "../../services/stateProvinceService";

import {
  getAllEmployees, 
  deactivateEmployee, 
  updateEmployee,
  reactivateEmployee
} from "../../services/employeeService";
import EmployeesPage from "../../pages/Employees/EmployeePage";

import NotesPopup from "../../components/dialogs/NotesComponent";
import AttachmentsPopup from "../../components/dialogs/AttachmentsComponent";

const EmployeesContainer = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);

  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  //z Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [employeesData, jobTitles, departments, cities, stateProvince] = await Promise.all([
        getAllEmployees(),
        getAllJobTitles(),
        getAllDepartments(),
        getAllCities(),
        getAllStatesProvinces()
      ]);

         console.log("Employee sample:", employeesData[0]);
      console.log("StateProvince array:", stateProvince);
      console.log("StateProvince sample:", stateProvince[0]);
      console.log("Employee StateProvinceID:", employeesData[0]?.StateProvinceID);

      // employee data with names
      const enrichedEmployees = employeesData.map(emp => ({
        ...emp,
        JobTitleName: jobTitles.find(jt => jt.JobTitleID === emp.JobTitleID)?.JobTitleName || 'N/A',
        DepartmentName: departments.find(d => d.DepartmentID === emp.DepartmentID)?.DepartmentName || 'N/A',
        CityName: cities.find(c => c.CityID === emp.CityID)?.CityName || 'N/A',
        StateProvinceName: stateProvince.find(sp => sp.StateProvinceID === emp.StateProvinceID)?.StateProvince_Name || 'N/A',
      }));

        console.log("Enriched employees sample:", enrichedEmployees[0]);

      setEmployees(enrichedEmployees);
    } catch (err) {
      setError("Failed to load employees. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/employees/create");
  };



const handleView = (employee) => {
 
  const employeeId = typeof employee === 'object' ? employee.EmployeeID : employee;
  console.log("View employee ID:", employeeId);
  navigate(`/employees/${employeeId}`);
};
  

  const handleEdit = (employee) => {
    // Navigate to edit page with employee data
    navigate(`/employees/edit/${employee.EmployeeID}`, { 
      state: { employee } 
    });
  };

 const handleReactivate = async (employee) => {
  if (window.confirm(`Are you sure you want to reactivate ${employee.EmployeeName}?`)) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user.id || user.EmployeeID;
      
      if (!currentUserId) {
        setError("Current user information not found");
        return;
      }

      // Pass any valid integer since the stored procedure doesn't use it
      const actionTypeId = 1;

      await reactivateEmployee(employee, currentUserId, actionTypeId);
      setSuccessMessage(`${employee.EmployeeName} has been reactivated.`);
      fetchEmployees();
    } catch (err) {
      setError("Failed to reactivate employee.");
      console.error(err);
    }
  }
};

const handleDeactivate = async (employee) => {

  const storedUser = localStorage.getItem('user');
  console.log("Stored user string:", storedUser);
  
  const user = JSON.parse(storedUser || '{}');
  console.log("Parsed user object:", user);
  console.log("User ID:", user.id);
  console.log("User EmployeeID:", user.EmployeeID);
  
  const currentUserId = user.id || user.EmployeeID;
  console.log("Current user ID to use:", currentUserId);
  
  if (!currentUserId) {
    setError("Current user information not found");
    return;
  }
  if (!employee?.EmployeeID) {
    setError("Employee ID is missing");
    return;
  }

  if (window.confirm(`Are you sure you want to deactivate ${employee.EmployeeName}?`)) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user.id || user.EmployeeID;
      
      if (!currentUserId) {
        setError("Current user information not found");
        return;
      }

      const actionTypeId = 1;

      await deactivateEmployee(employee, currentUserId, actionTypeId);
      setSuccessMessage(`${employee.EmployeeName} has been deactivated.`);
      fetchEmployees();
    } catch (err) {
      setError("Failed to deactivate employee.");
      console.error(err);
    }
  }
};


  const handleAddNote = (employee) => {
    setSelectedEmployee(employee);
    setNotesDialogOpen(true);
  };

  const handleAddAttachment = (employee) => {
    setSelectedEmployee(employee);
    setAttachmentsDialogOpen(true);
  };

  const handleCloseNotesDialog = () => {
    setNotesDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleCloseAttachmentsDialog = () => {
    setAttachmentsDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleFilterChange = async (filterType) => {
     setLoading(true);
    try {
      // Fetch all data again
      const [employeesData, jobTitles, departments, cities, stateProvince] = await Promise.all([
        getAllEmployees(),
        getAllJobTitles(),
        getAllDepartments(),
        getAllCities(),
        getAllStatesProvinces()
      
      ]);

      // Enrich employee data
      const enrichedEmployees = employeesData.map(emp => ({
        ...emp,
        JobTitleName: jobTitles.find(jt => jt.JobTitleID === emp.JobTitleID)?.JobTitleName || 'N/A',
        DepartmentName: departments.find(d => d.DepartmentID === emp.DepartmentID)?.DepartmentName || 'N/A',
        CityName: cities.find(c => c.CityID === emp.CityID)?.CityName || 'N/A',
        StateProvinceName: stateProvince.find(sp => sp.StateProvinceID === emp.StateProvinceID)?.StateProvince_Name || 'N/A',
       
      }));

      // Apply filter logic
      let filtered = enrichedEmployees;
      if (filterType === "active") {
        filtered = enrichedEmployees.filter(emp => emp.Active === true);
      } else if (filterType === "inactive") {
        filtered = enrichedEmployees.filter(emp => emp.Active === false);
      }
      
      setEmployees(filtered);
    } catch (err) {
      setError("Failed to filter employees.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClick = (id) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      setSelected(employees.map(emp => emp.EmployeeID));
    } else {
      setSelected([]);
    }
  };

  

  return (
  <>
    <EmployeesPage
      employees={employees}
      loading={loading}
      error={error}
      successMessage={successMessage}
      setSuccessMessage={setSuccessMessage}
      setError={setError}
      selected={selected}
      onSelectClick={handleSelectClick}
      onSelectAllClick={handleSelectAllClick}
      onFilterChange={handleFilterChange}
      onDeactivate={handleDeactivate}
      onReactivate={handleReactivate}
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleCreate}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
    />

    {/* Notes Dialog */}
    {selectedEmployee && (
      <NotesPopup
        open={notesDialogOpen}
        onClose={handleCloseNotesDialog}
        entityType="employee"
        entityId={selectedEmployee.EmployeeID}
        entityName={selectedEmployee.EmployeeName}
        showExistingNotes={true}
        maxLength={500}
      />
    )}

    {/* Attachments Dialog */}
    {selectedEmployee && (
      <AttachmentsPopup
        open={attachmentsDialogOpen}
        onClose={handleCloseAttachmentsDialog}
        entityType="employee"
        entityId={selectedEmployee.EmployeeID}
        entityName={selectedEmployee.EmployeeName}
        maxFileSize={10}
        maxFiles={5}
      />
    )}
  </>
);
};

export default EmployeesContainer;