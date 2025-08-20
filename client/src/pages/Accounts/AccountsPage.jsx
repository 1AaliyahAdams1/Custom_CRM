// AccountsPage.jsx
import React, { useState, useMemo } from "react";
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
import TableView from '../../components/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

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
}) => {
  // Add state for managing filters
  const [activeFilters, setActiveFilters] = useState({});

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

  // Filter accounts based on active filters
  const filteredAccounts = useMemo(() => {
    if (Object.keys(activeFilters).length === 0) {
      return accounts;
    }

    return accounts.filter(account => {
      return Object.entries(activeFilters).every(([field, value]) => {
        const accountValue = String(account[field] || '').toLowerCase();
        const filterValue = String(value).toLowerCase();
        return accountValue.includes(filterValue);
      });
    });
  }, [accounts, activeFilters]);

  // Handle filter changes from TableView
  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
  };

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
              {Object.keys(activeFilters).length > 0 && (
                <Chip 
                  label={`${Object.keys(activeFilters).length} filter${Object.keys(activeFilters).length > 1 ? 's' : ''} applied`} 
                  size="small" 
                  sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }} 
                />
              )}
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
              data={filteredAccounts} // Use filtered data
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
              // Pass filter props
              activeFilters={activeFilters}
              onFiltersChange={handleFiltersChange}
            />
          )}

          <Box sx={{ p: 2, borderTop: '1px solid #e5e5e5', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Showing {filteredAccounts.length} of {accounts.length} accounts
              {Object.keys(activeFilters).length > 0 && (
                <span style={{ color: '#1976d2', marginLeft: '8px' }}>
                  (filtered)
                </span>
              )}
            </Typography>
            {selected.length > 0 && <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>{selected.length} selected</Typography>}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default AccountsPage;