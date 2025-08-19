// PAGE : Main Activities Page (presentational only, no data fetching)

// IMPORTS
import React from "react";
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
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Clear } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { formatters } from "../utils/formatters";
import UniversalTable from "../components/TableView";
import theme from "../components/Theme";

// Table configuration for activities
const activitiesTableConfig = {
  idField: "ActivityID",
  columns: [
    { field: "ActivityType", headerName: "Activity Type", type: "tooltip" },
    { field: "AccountName", headerName: "Account Name", type: "tooltip" },
    { field: "PriorityLevelName", headerName: "Priority" },
    { field: "note", headerName: "Notes", type: "truncated", maxWidth: 150 },
    { field: "attachment", headerName: "Attachments" },
    { field: "DueToStart", headerName: "Due To Start", type: "date" },
    { field: "DueToEnd", headerName: "Due To End", type: "date" },
    {
      field: "CreatedAt",
      headerName: "Created",
      type: "dateTime",
    },
    {
      field: "UpdatedAt",
      headerName: "Updated",
      type: "date",
    },
    {
      field: "Completed",
      headerName: "Status",
      type: "boolean",
    },
  ],
};

const ActivitiesPage = ({
  activities = [], // Added default prop
  loading = false,
  error,
  successMessage,
  searchTerm,
  statusFilter,
  priorityFilter,
  setSuccessMessage,
  setSearchTerm,
  setStatusFilter,
  setPriorityFilter,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  clearFilters,
  totalCount,
}) => {
  const [selected, setSelected] = React.useState([]);

  // Selection handlers
  const handleSelectClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(activities.map((activity) => activity.ActivityID));
    } else {
      setSelected([]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            mb: 2,
            border: "0px solid #e5e5e5",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* Toolbar*/}
          <Toolbar
            sx={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e5e5e5",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              py: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flex: 1,
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{ color: "#050505", fontWeight: 600 }}
              >
                Activities
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
              }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
                disabled={loading}
                sx={{
                  backgroundColor: "#050505",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#333333" },
                  "&:disabled": {
                    backgroundColor: "#cccccc",
                    color: "#666666",
                  },
                }}
              >
                Add Activity
              </Button>

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    backgroundColor: "#ffffff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e5e5",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cccccc",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#050505",
                    },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>

              {/* Priority Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  sx={{
                    backgroundColor: "#ffffff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e5e5",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cccccc",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#050505",
                    },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="1">Low</MenuItem>
                  <MenuItem value="2">Medium</MenuItem>
                  <MenuItem value="3">High</MenuItem>
                  <MenuItem value="4">Critical</MenuItem>
                </Select>
              </FormControl>

              {/* Clear Filters */}
              {(searchTerm || statusFilter || priorityFilter) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                  startIcon={<Clear />}
                  sx={{
                    borderColor: "#e5e5e5",
                    color: "#666666",
                    "&:hover": {
                      borderColor: "#cccccc",
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Toolbar>

          {/* Loading spinner or table */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <TableView
              data={activities}
              columns={activitiesTableConfig.columns}
              idField={activitiesTableConfig.idField}
              selected={selected}
              onSelectClick={handleSelectClick}
              onSelectAllClick={handleSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={formatters}
              entityType="activity"
            />
          )}

          {/* Results footer */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e5e5e5",
              backgroundColor: "#fafafa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#666666" }}>
              Showing {activities.length} of {totalCount || activities.length}{" "}
              activities
            </Typography>
            {selected.length > 0 && (
              <Typography
                variant="body2"
                sx={{ color: "#050505", fontWeight: 500 }}
              >
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default ActivitiesPage;
