// EmployeesPage.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
} from "@mui/material";
import {
  Add,
  Close as CloseIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from "../../components/tableFormat/TableView";
import theme from "../../components/Theme";
import { formatters } from "../../utils/formatters";
import { createDepartment } from "../../services/departmentService";

const EmployeesPage = ({
  employees = [],
  loading = false,
  error,
  successMessage,
  setSuccessMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onDepartmentCreated, // New prop to handle department creation
}) => {
  // Add Department Dialog State
  const [addDepartmentDialogOpen, setAddDepartmentDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    DepartmentName: "",
    Active: true,
  });
  const [touched, setTouched] = useState({});
  const [addDepartmentLoading, setAddDepartmentLoading] = useState(false);
  const columns = [
    { field: "EmployeeName", headerName: "Employee Name", type: "tooltip", wrap: false, minWidth: 160 },
    { field: "EmployeeEmail", headerName: "Email", wrap: false, hideBelow: 'sm', minWidth: 180 },
    { field: "EmployeePhone", headerName: "Phone", wrap: false, minWidth: 140 },
    { field: "HireDate", headerName: "Hire Date", type: "dateTime", wrap: false, hideBelow: 'md', minWidth: 140 },
    { field: "Salary", headerName: "Salary", type: "currency", wrap: false, hideBelow: 'md', minWidth: 120 },
    { field: "Department", headerName: "Department", wrap: true, minWidth: 140 },
    { field: "JobTitle", headerName: "Job Title", wrap: true, minWidth: 140 },
    { field: "CreatedAt", headerName: "Created", type: "dateTime", wrap: false, hideBelow: 'md', minWidth: 140 },
    { field: "UpdatedAt", headerName: "Updated", type: "dateTime", wrap: false, hideBelow: 'md', minWidth: 140 },
    {
      field: "Active",
      headerName: "Active",
      type: "chip",
      chipLabels: { true: "Active", false: "Inactive" },
      chipColors: { true: "#079141ff", false: "#999999" },
      defaultVisible: true,
      minWidth: 100,
    },
  ];

  // Handle Add Department Dialog
  const handleOpenAddDepartmentDialog = () => {
    setAddDepartmentDialogOpen(true);
    setNewDepartment({
      DepartmentName: "",
      Active: true,
    });
    setTouched({});
  };

  const handleCloseAddDepartmentDialog = () => {
    setAddDepartmentDialogOpen(false);
    setNewDepartment({
      DepartmentName: "",
      Active: true,
    });
    setTouched({});
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.DepartmentName.trim()) {
      setSuccessMessage && setSuccessMessage("Department name is required");
      return;
    }

    setAddDepartmentLoading(true);
    try {
      await createDepartment(newDepartment);
      handleCloseAddDepartmentDialog();
      setSuccessMessage && setSuccessMessage("Department added successfully");
      // Call the callback to refresh department data
      if (onDepartmentCreated) {
        onDepartmentCreated();
      }
    } catch (error) {
      setSuccessMessage && setSuccessMessage("Failed to add department");
    } finally {
      setAddDepartmentLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewDepartment((prev) => ({
      ...prev,
      [field]: value,
    }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage && setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <Paper
          sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "clip", maxWidth: '100%' }}>
          <Toolbar
            sx={{
              backgroundColor: "#fff",
              borderBottom: "1px solid #e5e5e5",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              py: 2,
            }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{ color: "#050505", fontWeight: 600 }}>
                Employees
              </Typography>
              {selected.length > 0 && (
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
                  sx={{ backgroundColor: "#e0e0e0", color: "#050505" }}
                />
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}>
                Add Employee
              </Button>
              {/* <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleOpenAddDepartmentDialog}
                disabled={loading}
                sx={{
                  borderColor: "#050505",
                  color: "#050505",
                  "&:hover": {
                    borderColor: "#333333",
                    backgroundColor: "#f5f5f5",
                  },
                  "&:disabled": {
                    borderColor: "#cccccc",
                    color: "#666666",
                  },
                }}>
                Add Department
              </Button> */}
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <TableView
              data={employees}
              columns={columns}
              idField="EmployeeID"
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={formatters}
              entityType="employee"
            />
          )}

          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e5e5e5",
              backgroundColor: "#fafafa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Typography variant="body2" sx={{ color: "#666666" }}>
              Showing {employees.length} employees
            </Typography>
            {selected.length > 0 && (
              <Typography
                variant="body2"
                sx={{ color: "#050505", fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Add Department Dialog */}
        <Dialog
          open={addDepartmentDialogOpen}
          onClose={handleCloseAddDepartmentDialog}
          maxWidth="sm"
          fullWidth>
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e5e5e5",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BusinessIcon sx={{ color: "#1976d2" }} />
              Add New Department
            </Box>
            <IconButton onClick={handleCloseAddDepartmentDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Department Name"
                value={newDepartment.DepartmentName}
                onChange={(e) =>
                  handleInputChange("DepartmentName", e.target.value)
                }
                fullWidth
                required
                variant="outlined"
                error={
                  touched.DepartmentName && !newDepartment.DepartmentName.trim()
                }
                helperText={
                  touched.DepartmentName && !newDepartment.DepartmentName.trim()
                    ? "Department name is required"
                    : "Enter the name of the department (e.g., Engineering, Sales, Marketing)"
                }
                inputProps={{ maxLength: 255 }}
                sx={{ mt: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={newDepartment.Active}
                    onChange={(e) =>
                      handleInputChange("Active", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e5e5" }}>
            <Button onClick={handleCloseAddDepartmentDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleAddDepartment}
              variant="contained"
              disabled={
                addDepartmentLoading || !newDepartment.DepartmentName.trim()
              }>
              {addDepartmentLoading ? (
                <CircularProgress size={20} />
              ) : (
                "Add Department"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default EmployeesPage;
