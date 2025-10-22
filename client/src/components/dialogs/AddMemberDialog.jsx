import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import SmartDropdown from '../../components/SmartDropdown';
import { employeeService } from '../../services/dropdownServices';

const AddMemberDialog = ({ open, onClose, onAddMember, menuRow }) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedEmployee("");
      setError("");
    }
  }, [open]);

  // Handle adding member
  const handleAddMember = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }

    if (!menuRow?.TeamID) {
      setError("Team information is missing");
      return;
    }

    setAdding(true);
    setError("");
    
    try {
      // Call the onAddMember callback with UserID and TeamID
      // selectedEmployee is already the UserID from the SmartDropdown
      await onAddMember({
        UserID: selectedEmployee,
        TeamID: menuRow.TeamID
      });
      
      // Reset form and close dialog
      setSelectedEmployee("");
      onClose();
    } catch (error) {
      console.error("Error adding member:", error);
      setError(error.message || "Failed to add member. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    if (!adding) {
      setSelectedEmployee("");
      setError("");
      onClose();
    }
  };

  const handleChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Member to Team</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 2 }}>
          <SmartDropdown
            label="Select Employee"
            name="selectedEmployee"
            value={selectedEmployee}
            onChange={handleChange}
            service={employeeService}
            displayField="EmployeeName"
            valueField="UserID"
            placeholder="Search for employee..."
            disabled={adding}
          />
        </Box>

        {menuRow && (
          <Box sx={{ mt: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
            Team: {menuRow.TeamName || `Team ID: ${menuRow.TeamID}`}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={adding}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAddMember}
          disabled={!selectedEmployee || adding}
        >
          {adding ? <><CircularProgress size={20} sx={{ mr: 1 }} /> Adding...</> : "Add Member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;