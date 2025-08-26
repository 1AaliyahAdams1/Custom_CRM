<<<<<<< HEAD
// AccountsPage.jsx
import React from "react";
=======

import React, { useState } from "react";
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
<<<<<<< HEAD
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/TableView';
=======
  Snackbar,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const AccountsPage = ({
  accounts = [],
  loading = false,
  error,
<<<<<<< HEAD
  successMessage,
  setSuccessMessage,
=======
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
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
}) => {
  const columns = [
    { field: 'AccountName', headerName: 'Name', type: 'tooltip', defaultVisible: true },
    { field: 'CityName', headerName: 'City', defaultVisible: true },
    { field: 'StateProvince_Name', headerName: 'State Province', defaultVisible: false },
    { field: 'CountryName', headerName: 'Country', defaultVisible: true },
    { field: 'street_address', headerName: 'Street', type: 'truncated', maxWidth: 200, defaultVisible: false },
    { field: 'postal_code', headerName: 'Postal Code', defaultVisible: false },
    { field: 'PrimaryPhone', headerName: 'Phone', defaultVisible: true },
    { field: 'IndustryName', headerName: 'Industry', defaultVisible: false },
    { field: 'fax', headerName: 'Fax', defaultVisible: false },
    { field: 'email', headerName: 'Email', defaultVisible: false },
    { field: 'Website', headerName: 'Website', type: 'link', defaultVisible: false },
    { field: 'number_of_employees', headerName: '# Employees', defaultVisible: false },
    { field: 'number_of_venues', headerName: '# Venues', defaultVisible: false },
    { field: 'number_of_releases', headerName: '# Releases', defaultVisible: false },
    { field: 'number_of_events_anually', headerName: '# Events Annually', defaultVisible: false },
    { field: 'annual_revenue', headerName: 'Annual Revenue', defaultVisible: false },
    { field: 'ParentAccountName', headerName: 'Parent Account', defaultVisible: false },
    { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
    {
      field: 'ownerStatus',
      headerName: 'Ownership',
      type: 'chip',
      chipLabels: { owned: 'Owned', unowned: 'Unowned', 'n/a': 'N/A' },
      chipColors: { owned: '#079141ff', unowned: '#999999', 'n/a': '#999999' },
<<<<<<< HEAD
    },
  ];

=======
      defaultVisible: true,
    },
  ];

  // Local state for status messages
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('success');

  const showStatus = (message, severity = 'success') => {
    setStatusMessage(message);
    setStatusSeverity(severity);
  };

>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
<<<<<<< HEAD
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage && setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}
=======
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495

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
<<<<<<< HEAD

=======
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>
          ) : (
            <TableView
              data={accounts}
              columns={columns}
<<<<<<< HEAD
              idField="AccountID" 
=======
              idField="AccountID"
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
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
<<<<<<< HEAD
=======

        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => setStatusMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setStatusMessage('')} severity={statusSeverity} sx={{ width: '100%' }}>
            {statusMessage}
          </Alert>
        </Snackbar>
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
      </Box>
    </ThemeProvider>
  );
};

export default AccountsPage;
