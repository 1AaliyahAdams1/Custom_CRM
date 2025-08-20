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
} from "@mui/material";
import { getAllEmployees } from "../services/employeeService"; 

const AssignUserDialog = ({ open, onClose, onAssign, menuRow }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Fetch all employees when dialog opens
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    getAllEmployees()
      .then((res) => setEmployees(res || []))
      .catch((err) => console.error("Error fetching employees:", err))
      .finally(() => setLoading(false));
  }, [open]);

  // Handle assignment
  const handleAssign = async () => {
    if (!selectedEmployee) return;

    setAssigning(true);
    try {
      // Call the onAssign callback passed from parent
      // You can also directly call a backend API here if you want
      await onAssign(selectedEmployee, menuRow);
      setSelectedEmployee("");
      onClose();
    } catch (error) {
      console.error("Error assigning employee:", error);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Assign Employee</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <FormControl fullWidth>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.EmployeeID} value={emp.EmployeeID}>
                  {emp.EmployeeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={assigning}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedEmployee || assigning}
        >
          {assigning ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignUserDialog;
