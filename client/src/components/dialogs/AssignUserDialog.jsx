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
import { getAllEmployees } from "../../services/employeeService";

const AssignUserDialog = ({ 
  open, 
  onClose, 
  onAssign, 
  menuRow,
  account,  // Keep for backward compatibility
  restrictToTeam = false,  // NEW: Restrict to team members only
  teamMembers = []  // NEW: Array of team member employees
}) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  // Use menuRow or account prop for backward compatibility
  const currentAccount = menuRow || account;

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
    
    // NEW: If Sales Manager, use team members instead of all employees
    if (restrictToTeam && teamMembers.length > 0) {
      console.log("Using team members for assignment:", teamMembers);
      setEmployees(teamMembers);
      setLoading(false);
    } else if (restrictToTeam && teamMembers.length === 0) {
      // Sales Manager but no team members
      setEmployees([]);
      setError("No team members available for assignment");
      setLoading(false);
    } else {
      // C-level or other roles - fetch all employees
      getAllEmployees()
        .then((res) => {
          console.log("Fetched all employees:", res);
          setEmployees(res || []);
        })
        .catch((err) => {
          console.error("Error fetching employees:", err);
          setError("Failed to load employees. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  }, [open, restrictToTeam, teamMembers]);

  // Handle assignment
  const handleAssign = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }

    if (!currentAccount?.AccountID) {
      setError("Account information is missing");
      return;
    }

    setAssigning(true);
    setError("");
    
    try {
      // Call the onAssign callback passed from parent
      // Support both old (with menuRow) and new (with just employeeId) signature
      if (menuRow) {
        await onAssign(selectedEmployee, menuRow);
      } else {
        await onAssign(selectedEmployee);
      }
      
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
        {/* NEW: Show info alert for Sales Managers */}
        {restrictToTeam && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You can only assign members from your team
          </Alert>
        )}

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
                <MenuItem disabled>
                  {restrictToTeam 
                    ? "No team members available" 
                    : "No employees available"}
                </MenuItem>
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

        {currentAccount && (
          <div style={{ marginTop: '16px', fontSize: '0.875rem', color: '#666' }}>
            Account: {currentAccount.AccountName || `Account ID: ${currentAccount.AccountID}`}
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