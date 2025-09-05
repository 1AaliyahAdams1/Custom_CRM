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
  Snackbar,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import TableView from "../../components/tableFormat/TableView";
import theme from "../../components/Theme";
import { ThemeProvider } from "@mui/material/styles";

const ActivityTypePage = ({
  activityTypes = [],
  loading = false,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  statusMessage,
  statusSeverity,
  setStatusMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onReactivate,
  onDelete,
  onBulkDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  showStatus,
}) => {

  const columns = [
    { field: "TypeName", headerName: "Type Name", type: "tooltip", defaultVisible: true },
    { field: "Description", headerName: "Description", type: "tooltip", defaultVisible: true },
  ];

  const activityTypeFormatters = {
    IsActive: (value) => {
      const isActive = value === true || value === 1;
      return (
        <Chip
          label={isActive ? "Active" : "Inactive"}
          size="small"
          sx={{
            backgroundColor: isActive ? "#079141ff" : "#999999",
            color: "#fff",
            fontWeight: 500,
          }}
        />
      );
    },
    Description: (value) => value || "No description",
  };

  const getMenuItems = (activityType) => {
    const isActive = activityType.IsActive === true || activityType.IsActive === 1;
    return [
      { label: "View", onClick: () => onView && onView(activityType) },
      { label: "Edit", onClick: () => onEdit && onEdit(activityType) },
      { label: isActive ? "Deactivate" : "Reactivate", onClick: () => isActive ? onDeactivate(activityType.TypeID) : onReactivate(activityType.TypeID) },
      { label: "Delete", onClick: () => onDelete && onDelete(activityType.TypeID) },
      { label: "Add Notes", onClick: () => onAddNote && onAddNote(activityType) },
      { label: "Add Attachments", onClick: () => onAddAttachment && onAddAttachment(activityType) },
    ];
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "100%", backgroundColor: "#fafafa", minHeight: "100vh", p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError && setError("")}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage && setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "hidden" }}>
          <Toolbar sx={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e5e5", justifyContent: "space-between" }}>
            <Typography variant="h6" component="div">
              Activity Types
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={onCreate}>
                Add Activity Type
              </Button>
              {selected.length > 0 && (
                <Button variant="outlined" color="warning" onClick={onBulkDeactivate}>
                  Deactivate Selected
                </Button>
              )}
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <TableView
              data={activityTypes}
              columns={columns}
              idField="TypeID"
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={activityTypeFormatters}
              entityType="activityType"
              getMenuItems={getMenuItems}
            />
          )}

          <Box sx={{ p: 2, borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#666666" }}>
              Showing {activityTypes.length} activity types
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>

        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => setStatusMessage && setStatusMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={() => setStatusMessage && setStatusMessage("")} severity={statusSeverity} sx={{ width: "100%" }}>
            {statusMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default ActivityTypePage;
