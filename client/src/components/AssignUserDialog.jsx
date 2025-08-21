import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getAllEmployees } from "../services/employeeService";

const AssignUserDialog = ({ open, onClose, onAssign, menuRow }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  // Fetch all employees when dialog opens
  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setSelectedEmployee("");
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    getAllEmployees()
      .then((res) => {
        console.log("Fetched employees:", res); // Debug log
        setEmployees(res || []);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setError("Failed to load employees. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [open]);

  // Handle assignment
  const handleAssign = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }

    if (!menuRow?.AccountID) {
      setError("Account information is missing");
      return;
    }

    setAssigning(true);
    setError("");
    
    try {
      // Call the onAssign callback passed from parent
      await onAssign(selectedEmployee, menuRow);
      
      // Reset form and close dialog
      setSelectedEmployee("");
      onClose();
    } catch (error) {
      console.error("Error assigning employee:", error);
      setError(error.message || "Failed to assign employee. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    if (!assigning) {
      setSelectedEmployee("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Assign Employee to Account</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : (
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedEmployee}
              label="Select Employee"
              onChange={(e) => setSelectedEmployee(e.target.value)}
              disabled={assigning}
            >
              {employees.length === 0 ? (
                <MenuItem disabled>No employees available</MenuItem>
              ) : (
                employees.map((emp) => (
                  <MenuItem key={emp.EmployeeID} value={emp.EmployeeID}>
                    {emp.EmployeeName || `Employee ${emp.EmployeeID}`}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}

        {menuRow && (
          <div style={{ marginTop: '16px', fontSize: '0.875rem', color: '#666' }}>
            Account: {menuRow.AccountName || `Account ID: ${menuRow.AccountID}`}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={assigning}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedEmployee || assigning || loading}
        >
          {assigning ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignUserDialog;