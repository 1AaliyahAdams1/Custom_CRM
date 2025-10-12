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
import { useTheme } from "@mui/material/styles"; 
import TableView from "../../components/tableFormat/TableView";
import BulkActionsToolbar from "../../components/tableFormat/BulkActionsToolbar";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { formatters } from "../../utils/formatters";
import StatusMessage from "../../components/tableFormat/StatusMessage";

const AccountsPage = ({
  accounts = [],
  loading = false,
  error,
  selected = [],
  selectedItems = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onReactivate, 
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onClaimAccount,
  onUnclaimAccount,
  onAssignUser,
  onUnassignUsers,
  onFilterChange,
  onBulkClaim,
  onBulkClaimAndSequence,
  onBulkAssign,
  onBulkDeactivate,
  onBulkExport,
  onClearSelection,
  bulkLoading = false,
  userRoles = [],
  statusMessage,
  onCloseStatusMessage,
  statusSeverity = "success",
  notesPopupOpen,
  setNotesPopupOpen,
  selectedAccount,
  handleSaveNote,
  handleEditNote,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  onAssignSequence,
  userName,
}) => {
  const theme = useTheme();
  
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
        chipLabels: (value, row) => {
          if (value === "owned") return "Owned";
          if (value === "owned-shared") return row.ownerDisplayName || "Shared";
          if (value === "owned-by-multiple") return row.ownerDisplayName || "Multiple users";
          if (value === "unowned") return "Unowned";
          if (value === "n/a") return "N/A";
          if (value && value.startsWith("owned-by-")) {
            return row.ownerDisplayName || value.replace("owned-by-", "");
          }
          return value || "N/A";
          },
        chipColors: (value, row) => {
          if (value === "owned") return "#079141ff"; // green - owned by you only
          if (value === "owned-shared") return "#2196f3"; // blue - shared with you
          if (value === "owned-by-multiple") return "#ff9800"; // orange - multiple others
          if (value === "unowned") return "#999999"; // gray
          if (value === "n/a") return "#999999"; // gray
          if (value && value.startsWith("owned-by-")) return "#ff9800"; // orange - single other user
            return "#999999"; // default gray
          },
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
    
    <Box sx={{ 
      width: "100%", 
      backgroundColor: theme.palette.background.default, 
      minHeight: "100vh", 
      p: 3 
    }}>

      {/* Status Message */}
      {statusMessage && (
        <Box sx={{ mb: 2 }}>
          <StatusMessage
            message={statusMessage}
            severity={statusSeverity}
            onClose={() => onCloseStatusMessage("")}
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
            onBulkClaimAndSequence={onBulkClaimAndSequence}
            onBulkDeactivate={onBulkDeactivate}
            onBulkExport={onBulkExport}
            onClearSelection={onClearSelection}
            userRole={userRoles}
            loading={bulkLoading}
            disabled={loading}
          />

        {/* Main Toolbar */}
        <Toolbar sx={{
          backgroundColor: theme.palette.background.paper, 
          borderBottom: selected.length > 0 ? "none" : `1px solid ${theme.palette.divider}`, 
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
                Accounts
              </Typography>
              <Tooltip title="Manage and view all customer accounts in your system" arrow>
                <Info sx={{ 
                  fontSize: 18, 
                  color: theme.palette.text.secondary,
                  cursor: "help" 
                }} />
              </Tooltip>
            </Box>

            {/* Account Filter */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select value={accountFilter} onChange={handleFilterChange} displayEmpty
                sx={{
                  backgroundColor: theme.palette.background.paper, 
                  "& .MuiOutlinedInput-notchedOutline": { 
                    borderColor: theme.palette.divider 
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": { 
                    borderColor: theme.palette.text.secondary
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                    borderColor: theme.palette.primary.main 
                  },
                }}
              >
                {filterOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {selected.length > 0 && (
              <Tooltip title={`${selected.length} account${selected.length === 1 ? "" : "s"} selected`} arrow>
                <Chip label={`${selected.length} selected`} size="small" sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? '#333' : "#e0e0e0", 
                  color: theme.palette.text.primary 
                }} />
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
              onReactivate={onReactivate} 
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              onClaimAccount={onClaimAccount}
              onUnclaimAccount={onUnclaimAccount}
              onAssignUser={onAssignUser}
              onUnassignUsers={onUnassignUsers}
              onAssignSequence={onAssignSequence}
              formatters={formatters}
              entityType="account"
              tooltips={{
                search: "Search records by any visible field or keyword",
                filter: "Show/hide advanced filtering options",
                columns: "Customize which columns are visible",
                actionMenu: {
                  view: "View detailed information",
                  edit: "Edit record information",
                  delete: "Deactivate",
                  addNote: "Add internal notes",
                  addAttachment: "Attach files",
                  claimAccount: "Claim ownership",
                  assignUser: "Assign a team member",
                }
              }}
            />
          )}
        </Paper>

      {/* Notes Popup */}
      {notesPopupOpen && (
        <NotesPopup
          open={notesPopupOpen}
          onClose={() => setNotesPopupOpen(false)}
          onSave={handleSaveNote}
          onEdit={handleEditNote}
          entityType="Account"
          entityId={selectedAccount?.AccountID}
          entityName={selectedAccount?.AccountName}
          showExistingNotes={true}
          maxLength={255}
          required={false}
        />
      )}

      {/* Attachments Popup */}
      {attachmentsPopupOpen && selectedAccount && (
        <AttachmentsPopup
          open={attachmentsPopupOpen}
          onClose={() => setAttachmentsPopupOpen(false)}
          entityType="account"
          entityId={selectedAccount?.AccountID}
          entityName={selectedAccount?.AccountName}
          userName={userName}
          maxFileSize={10}
          maxFiles={5}
          onAttachmentsChange={(attachments) => {
            console.log('Attachments updated:', attachments);
          }}
        />
      )}

    </Box>

  );
};

export default AccountsPage;