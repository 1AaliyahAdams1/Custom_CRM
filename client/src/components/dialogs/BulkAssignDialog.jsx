import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getAllEmployees } from "../../services/employeeService";

const BulkAssignDialog = ({ open, onClose, selectedItems = [], onConfirm, loading = false }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [error, setError] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    if (open) loadEmployees();
  }, [open]);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await getAllEmployees();
      setEmployees(res.data || res || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }
    if (selectedItems.length === 0) {
      setError("No accounts selected to assign");
      return;
    }
    setError("");
    onConfirm(selectedEmployee);
  };

  const handleClose = () => {
    setError("");
    setSelectedEmployee("");
    onClose();
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 200,
        zIndex: 2000,
      },
    },
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Assign Accounts</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography sx={{ mb: 2 }}>
          You are about to assign <strong>{selectedItems.length}</strong> account{selectedItems.length !== 1 ? "s" : ""}.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="bulk-assign-employee-label">Select Employee</InputLabel>
            {loadingEmployees ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Select
                labelId="bulk-assign-employee-label"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                MenuProps={MenuProps}
              >
                {employees.length === 0 ? (
                  <MenuItem disabled>No employees available</MenuItem>
                ) : (
                  employees.map((emp) => (
                    <MenuItem key={emp.EmployeeID} value={emp.EmployeeID}>
                      {emp.EmployeeName || emp.FullName || `Employee ${emp.EmployeeID}`}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          </FormControl>
        </Box>

        {/* Scrollable list of accounts */}
        {selectedItems.length > 0 && (
          <Box sx={{ maxHeight: 200, overflow: "auto", border: "1px solid #ccc", borderRadius: 1, backgroundColor: "#f9f9f9", p: 1 }}>
            <List dense>
              {selectedItems.map((acc, i) => (
                <ListItem key={acc.AccountID || i}>
                  <ListItemText
                    primary={acc.AccountName}
                    secondary={`Status: ${acc.ownerStatus || "N/A"}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedEmployee || loading}
        >
          {loading ? "Assigning..." : `Assign ${selectedItems.length} Account${selectedItems.length !== 1 ? "s" : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAssignDialog;
