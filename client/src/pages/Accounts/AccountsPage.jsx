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
  Tooltip,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Info } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from "../../components/tableFormat/TableView";
import BulkActionsToolbar from "../../components/BulkActionsToolbar";
import theme from "../../components/Theme";
import { formatters } from "../../utils/formatters";
import StatusMessage from "../../components/StatusMessage";

const AccountsPage = ({
  accounts = [],
  loading = false,
  error,
  selected = [],
  selectedItems = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onClaimAccount,
  onAssignUser,
  onFilterChange,
  onBulkClaim,
  onBulkAssign,
  onBulkDeactivate,
  onBulkExport,
  onClearSelection,
  bulkLoading = false,
  userRoles = [],
  statusMessage,
  setStatusMessage,
  statusSeverity = "success",
}) => {
  // Local filter state
  const [accountFilter, setAccountFilter] = useState("all");

  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setAccountFilter(newFilter);
    if (onFilterChange) onFilterChange(newFilter);
  };

  const filterOptions = [
    { value: "all", label: "All Accounts" },
    { value: "my", label: "My Accounts" },
    { value: "team", label: "My Team's Accounts" },
    { value: "unassigned", label: "Unassigned Accounts" },
  ];

  const columns = [
    { field: "AccountName", headerName: "Name", type: "clickable", defaultVisible: true, onClick: onView },
    { field: "CityName", headerName: "City", defaultVisible: true },
    { field: "StateProvince_Name", headerName: "State Province", defaultVisible: false },
    { field: "CountryName", headerName: "Country", defaultVisible: true },
    { field: "street_address", headerName: "Street", type: "truncated", maxWidth: 200, defaultVisible: false },
    { field: "postal_code", headerName: "Postal Code", defaultVisible: false },
    { field: "PrimaryPhone", headerName: "Phone", defaultVisible: true },
    { field: "IndustryName", headerName: "Industry", defaultVisible: false },
    { field: "fax", headerName: "Fax", defaultVisible: false },
    { field: "email", headerName: "Email", defaultVisible: false },
    { field: "Website", headerName: "Website", type: "link", defaultVisible: false },
    { field: "number_of_employees", headerName: "# Employees", defaultVisible: false },
    { field: "number_of_venues", headerName: "# Venues", defaultVisible: false },
    { field: "number_of_releases", headerName: "# Releases", defaultVisible: false },
    { field: "number_of_events_anually", headerName: "# Events Annually", defaultVisible: false },
    { field: "annual_revenue", headerName: "Annual Revenue", defaultVisible: false },
    { field: "ParentAccountName", headerName: "Parent Account", defaultVisible: false },
    { field: "CreatedAt", headerName: "Created", type: "dateTime", defaultVisible: true },
    { field: "UpdatedAt", headerName: "Updated", type: "dateTime", defaultVisible: false },
    {
      field: "ownerStatus",
      headerName: "Ownership",
      type: "chip",
      chipLabels: { owned: "Owned", unowned: "Unowned", "n/a": "N/A" },
      chipColors: { owned: "#079141ff", unowned: "#999999", "n/a": "#999999" },
      defaultVisible: true,
    },
    {
      field: "Active",
      headerName: "Active",
      type: "chip",
      chipLabels: { true: "Active", false: "Inactive" },
      chipColors: { true: "#079141ff", false: "#999999" },
      defaultVisible: true,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "100%", backgroundColor: "#fafafa", minHeight: "100vh", p: 3 }}>
        
        {/* Status Message */}
        {statusMessage && (
          <Box sx={{ mb: 2 }}>
            <StatusMessage
              message={statusMessage}
              severity={statusSeverity}
              onClose={() => setStatusMessage("")}
              duration={4000}
            />
          </Box>
        )}

        {/* Error Alert */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "hidden" }}>
          {/* Bulk Actions Toolbar */}
          <BulkActionsToolbar
            selectedCount={selected.length}
            selectedItems={selectedItems}
            entityType="account"
            onBulkAssign={onBulkAssign}
            onBulkClaim={onBulkClaim}
            onBulkDeactivate={onBulkDeactivate}
            onBulkExport={onBulkExport}
            onClearSelection={onClearSelection}
            userRole={userRoles}
            loading={bulkLoading}
            disabled={loading}
          />

          {/* Main Toolbar */}
          <Toolbar sx={{
            backgroundColor: "#fff",
            borderBottom: selected.length > 0 ? "none" : "1px solid #e5e5e5",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            py: 2
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" component="div" sx={{ color: "#050505", fontWeight: 600 }}>
                  Accounts
                </Typography>
                <Tooltip title="Manage and view all customer accounts in your system" arrow>
                  <Info sx={{ fontSize: 18, color: "#666666", cursor: "help" }} />
                </Tooltip>
              </Box>

              {/* Account Filter */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select value={accountFilter} onChange={handleFilterChange} displayEmpty
                  sx={{
                    backgroundColor: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c0c0c0" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
                  }}
                >
                  {filterOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selected.length > 0 && (
                <Tooltip title={`${selected.length} account${selected.length === 1 ? "" : "s"} selected`} arrow>
                  <Chip label={`${selected.length} selected`} size="small" sx={{ backgroundColor: "#e0e0e0", color: "#050505" }} />
                </Tooltip>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Tooltip title="Create a new account in the system" arrow>
                <Button variant="contained" startIcon={<Add />} onClick={onCreate}>
                  Add Account
                </Button>
              </Tooltip>
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2, color: "#666666" }}>
                Loading accounts...
              </Typography>
            </Box>
          ) : (
            <TableView
              data={accounts}
              columns={columns}
              idField="AccountID"
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              onClaimAccount={onClaimAccount}
              onAssignUser={onAssignUser}
              formatters={formatters}
              entityType="account"
              tooltips={{
                search: "Search records by any visible field or keyword",
                filter: "Show/hide advanced filtering options",
                columns: "Customize which columns are visible",
                actionMenu: {
                  view: "View detailed information",
                  edit: "Edit record information",
                  delete: "Delete or deactivate",
                  addNote: "Add internal notes",
                  addAttachment: "Attach files",
                  claimAccount: "Claim ownership",
                  assignUser: "Assign a team member",
                }
              }}
            />
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default AccountsPage;
