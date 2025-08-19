// AccountsPage.jsx
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
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../components/TableView';
import theme from "../components/Theme";
import { formatters } from '../utils/formatters';

const AccountsPage = ({
  accounts = [],
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
  onClaimAccount,
  onAssignUser,
  tableConfig,
  notesPopupOpen,
  setNotesPopupOpen,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  selectedAccount,
  popupLoading,
  popupError,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  handleUploadAttachment,
  handleDeleteAttachment,
  handleDownloadAttachment,
}) => {
  const columns = [
    { field: 'AccountName', headerName: 'Name', type: 'tooltip' },
    { field: 'CityName', headerName: 'City' },
    { field: 'StateProvince_Name', headerName: 'State Province' },
    { field: 'CountryName', headerName: 'Country' },
    { field: 'street_address', headerName: 'Street', type: 'truncated', maxWidth: 200 },
    { field: 'postal_code', headerName: 'Postal Code' },
    { field: 'PrimaryPhone', headerName: 'Phone' },
    { field: 'IndustryName', headerName: 'Industry' },
    { field: 'fax', headerName: 'Fax' },
    { field: 'email', headerName: 'Email' },
    { field: 'Website', headerName: 'Website', type: 'link' },
    { field: 'number_of_employees', headerName: '# Employees' },
    { field: 'number_of_venues', headerName: '# Venues' },
    { field: 'number_of_releases', headerName: '# Releases' },
    { field: 'number_of_events_anually', headerName: '# Events Annually' },
    { field: 'annual_revenue', headerName: 'Annual Revenue' },
    { field: 'ParentAccountName', headerName: 'Parent Account' },
    { field: 'CreatedAt', headerName: 'Created', type: 'dateTime' },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime' },
    {
      field: 'ownerStatus',
      headerName: 'Ownership',
      type: 'chip',
      chipLabels: { owned: 'Owned', unowned: 'Unowned', 'n/a': 'N/A' },
      chipColors: { owned: '#079141ff', unowned: '#999999', 'n/a': '#999999' },
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
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

        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Toolbar sx={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Accounts
              </Typography>
              {selected.length > 0 && <Chip label={`${selected.length} selected`} size="small" sx={{ backgroundColor: '#e0e0e0', color: '#050505' }} />}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
              >
                Add Account
              </Button>

            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>
          ) : (
            <TableView
              data={accounts}
              columns={columns}
              idField="AccountID" 
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              onClaimAccount={onClaimAccount}
              onAssignUser={onAssignUser}
              formatters={formatters}
              entityType="account"
            />
          )}

          <Box sx={{ p: 2, borderTop: '1px solid #e5e5e5', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>Showing {accounts.length} accounts</Typography>
            {selected.length > 0 && <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>{selected.length} selected</Typography>}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default AccountsPage;
