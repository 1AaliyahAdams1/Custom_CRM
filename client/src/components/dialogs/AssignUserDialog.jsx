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
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { getAllEmployees } from "../../services/employeeService";

const AssignUserDialog = ({ open, onClose, onAssign, menuRow }) => {
  const theme = useTheme(); // Use MUI theme
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedEmployee("");
      setError("");
      return;
    }

    setLoadingEmployees(true);
    getAllEmployees()
      .then((res) => setEmployees(res || []))
      .catch((err) => setError("Failed to load employees"))
      .finally(() => setLoadingEmployees(false));
  }, [open]);

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
      await onAssign(selectedEmployee, menuRow);
      setSelectedEmployee("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to assign employee");
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{`Assign Employee to Account`}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loadingEmployees ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
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
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Account to assign:
            </Typography>
            <Box
              sx={{
                maxHeight: 150,
                overflow: "auto",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={menuRow.AccountName || `Account ID: ${menuRow.AccountID}`}
                    secondary={`${menuRow.CityName || "Unknown"}, ${menuRow.CountryName || "Unknown"}`}
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          disabled={assigning}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedEmployee || assigning || loadingEmployees}
        >
          {assigning ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignUserDialog;
