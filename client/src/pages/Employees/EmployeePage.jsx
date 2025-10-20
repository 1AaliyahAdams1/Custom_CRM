import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Add, Info } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';
import RoleBasedAccess from '../../components/auth/RoleBasedAccess';
import { AuthContext } from '../../context/auth/authContext';
////

const EmployeesPage = ({
  employees = [],
  loading = false,
  error,
  successMessage,
  setSuccessMessage,
  setError,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onReactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onFilterChange,
  userRoles = [],
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  // Debug role information
  useEffect(() => {
    console.log('=== EMPLOYEE PAGE ROLE DEBUG ===');
    console.log('Current user:', user);
    console.log('User roles:', user?.roles);
    console.log('User roles type:', typeof user?.roles);
    console.log('User roles array:', Array.isArray(user?.roles) ? user.roles : 'Not an array');
    console.log('User role names:', user?.RoleNames);
    console.log('User role names type:', typeof user?.RoleNames);
    console.log('================================');
  }, [user]);

  const columns = [
    { field: "EmployeeName", headerName: "Name", type: "text", defaultVisible: true },
    { field: "EmployeeEmail", headerName: "Email", defaultVisible: true },
    { field: "EmployeePhone", headerName: "Phone", defaultVisible: true },
    { field: "JobTitleName", headerName: "Job Title", defaultVisible: true },
    { field: "DepartmentName", headerName: "Department", defaultVisible: true },
   
    { field: "HireDate", headerName: "Hire Date", type: "date", defaultVisible: true },
    { field: "TerminationDate", headerName: "Termination Date", type: "date", defaultVisible: false },
    { field: "salary", headerName: "Salary", type: "currency", defaultVisible: false },
    { field: "Holidays_PA", headerName: "Holidays/Year", defaultVisible: false },
    { field: "CityName", headerName: "City", defaultVisible: false },
    { field: "StateProvinceName", headerName: "State/Province", defaultVisible: false },
    { field: "CreatedAt", headerName: "Created", type: "dateTime", defaultVisible: false },
    { field: "UpdatedAt", headerName: "Updated", type: "dateTime", defaultVisible: false },
    {
      field: "Active",
      headerName: "Status",
      type: "chip",
      chipLabels: { true: "Active", false: "Inactive" },
      chipColors: { true: "#079141ff", false: "#999999" },
      defaultVisible: true,
    }
  ];

  const [employeeFilter, setEmployeeFilter] = useState("all");

  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setEmployeeFilter(newFilter);
    
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const filterOptions = [
    { value: "all", label: "All Employees" },
    { value: "active", label: "Active Employees" },
    { value: "inactive", label: "Inactive Employees" },
    { value: "myTeam", label: "My Team" },
  ];

  return (
    <RoleBasedAccess allowedRoles={['C-level', 'Clevel', 'Admin', 'Administrator']} fallbackPath="/unauthorized">
      <Box sx={{ 
        width: "100%", 
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh", 
        p: 3 
      }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage && setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "hidden" }}>
          <Toolbar sx={{ 
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            justifyContent: "space-between", 
            flexWrap: "wrap", 
            gap: 2, 
            py: 2 
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" component="div" sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 600 
                }}>
                  Employees
                </Typography>
                <Tooltip title="Manage and view all employee records in the system" arrow>
                  <Info sx={{ 
                    fontSize: 18, 
                    color: theme.palette.text.secondary,
                    cursor: "help" 
                  }} />
                </Tooltip>
              </Box>

              {/* Employee Filter Dropdown */}
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <Select
                  value={employeeFilter}
                  onChange={handleFilterChange}
                  displayEmpty
                  sx={{ 
                    backgroundColor: theme.palette.background.paper,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.divider,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.text.secondary,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  {filterOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selected.length > 0 && (
                <Tooltip title={`${selected.length} employee${selected.length === 1 ? "" : "s"} selected for operations`} arrow>
                  <Chip
                    label={`${selected.length} selected`}
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
                      color: theme.palette.text.primary
                    }}
                  />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Tooltip title="Create a new employee record in the system" arrow>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={onCreate}
                >
                  Add Employee
                </Button>
              </Tooltip>
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
              <CircularProgress />
              <Tooltip title="Loading employee data from the database" arrow>
                <Typography variant="body2" sx={{ 
                  mt: 2, 
                  color: theme.palette.text.secondary
                }}>
                  Loading employees...
                </Typography>
              </Tooltip>
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
              onReactivate={onReactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={formatters}
              entityType="employee"
              tooltips={{
                search: "Search employees by name, email, phone, department, or job title",
                filter: "Show/hide advanced filtering options",
                columns: "Customize which columns are visible in the table",
                actionMenu: {
                  view: "View detailed information for this employee",
                  edit: "Edit this employee's information",
                  delete: "Deactivate this employee record",
                  addNote: "Add internal notes or comments",
                  addAttachment: "Attach files or documents"
                }
              }}
            />
          )}

          <Box sx={{ 
            p: 2, 
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <Tooltip title="Total number of employees currently displayed in the table" arrow>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                cursor: "help" 
              }}>
                Showing {employees.length} employees
              </Typography>
            </Tooltip>
            {selected.length > 0 && (
              <Tooltip title="Number of employees currently selected for operations" arrow>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.primary,
                  fontWeight: 500, 
                  cursor: "help" 
                }}>
                  {selected.length} selected
                </Typography>
              </Tooltip>
            )}
          </Box>
        </Paper>
      </Box>
    </RoleBasedAccess>
  );
};

export default EmployeesPage;
