// PAGE : Main Accounts Page (presentational only, no data fetching) 

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
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { formatters } from '../utils/formatters';
import UniversalTable from '../components/TableView';
import theme from "../components/Theme";

// Table config for accounts
const accountsTableConfig = {
  idField: 'AccountID',
  columns: [
    { field: 'AccountName', headerName: 'Name', type: 'tooltip' },
    { field: 'CityName', headerName: 'City Name' },
    { field: 'StateProvinceID', headerName: 'State Province Name' },//change to name
    { field: 'CountryID', headerName: 'Country Name' },//change to name
    { field: 'street_address', headerName: 'Street Address', type: 'truncated', maxWidth: 200 },
    { field: 'postal_code', headerName: 'Postal Code' },
    { field: 'PrimaryPhone', headerName: 'Phone' },
    { field: 'IndustryID', headerName: 'Industry Name' }, //change to name
    { field: 'fax', headerName: 'Fax' },
    { field: 'email', headerName: 'Email' },
    { field: 'Website', headerName: 'Website', type: 'link' },
    { field: 'number_of_employees', headerName: '# Employees' },
    { field: 'number_of_venues', headerName: '# Venues' },
    { field: 'number_of_releases', headerName: '# Releases' },
    { field: 'number_of_events_anually', headerName: '# Events Anually' },
    { field: 'annual_revenue', headerName: 'Annual Revenue' },
    { field: 'ParentAccount', headerName: 'Parent Account' },
    { field: 'CreatedAt', headerName: 'Created'},
    { field: 'UpdatedAt', headerName: 'Updated'},
    {
      field: 'ownerStatus',
      headerName: 'Ownership',
      type: 'chip',
      chipLabels: { owned: 'Owned', unowned: 'Unowned', 'n/a': 'N/A' },
      chipColors: { owned: '#079141ff', unowned: '#999999', 'n/a': '#999999' }
    },
  ],
};

const AccountsPage = ({
  accounts,
  loading,
  error,
  successMessage,
  setSuccessMessage,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
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
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(accounts.map(account => account.AccountID));
    } else {
      setSelected([]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            mb: 2,
            border: '0px solid #e5e5e5',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {/* Toolbar with title and Add button */}
          <Toolbar
            sx={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e5e5e5',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Accounts
              </Typography>
              {selected.length > 0 && (
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
                  sx={{ backgroundColor: '#e0e0e0', color: '#050505' }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
                sx={{
                  backgroundColor: '#050505',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                Add Account
              </Button>
            </Box>
          </Toolbar>

          {/* Loading spinner or table */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <UniversalTable
              data={accounts}
              columns={accountsTableConfig.columns}
              idField={accountsTableConfig.idField}
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
            />
          )}

          {/* Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #e5e5e5',
              backgroundColor: '#fafafa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Showing {accounts.length} accounts
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default AccountsPage;
