import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEmployees, deactivateEmployee, updateEmployee } from "../../services/employeeService";
import EmployeesPage from "../../pages/Employees/EmployeePage";

const EmployeesContainer = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllEmployees();
      setEmployees(data);
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
    // Navigate to employee details page
    navigate(`/employees/${employee.EmployeeID}`);
  };

  const handleEdit = (employee) => {
    // Navigate to edit page with employee data
    navigate(`/employees/edit/${employee.EmployeeID}`, { 
      state: { employee } 
    });
  };

  const handleDeactivate = async (employee) => {
    if (window.confirm(`Are you sure you want to deactivate ${employee.EmployeeName}?`)) {
      try {
        await deactivateEmployee(employee.EmployeeID);
        setSuccessMessage(`${employee.EmployeeName} has been deactivated.`);
        // Refresh the list
        fetchEmployees();
      } catch (err) {
        setError("Failed to deactivate employee.");
        console.error(err);
      }
    }
  };

  const handleAddNote = (employee) => {
    // TODO: Implement note functionality
    console.log("Add note for employee:", employee);
    // You might want to open a modal or navigate to a notes page
  };

  const handleAddAttachment = (employee) => {
    // TODO: Implement attachment functionality
    console.log("Add attachment for employee:", employee);
    // You might want to open a file upload modal
  };

  const handleFilterChange = async (filterType) => {
    setLoading(true);
    try {
      const data = await getAllEmployees();
      
      // Apply filter logic
      let filtered = data;
      if (filterType === "active") {
        filtered = data.filter(emp => emp.Active === true);
      } else if (filterType === "inactive") {
        filtered = data.filter(emp => emp.Active === false);
      }
      // Add other filter logic as needed
      
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
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleCreate}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
    />
  );
};

export default EmployeesContainer;