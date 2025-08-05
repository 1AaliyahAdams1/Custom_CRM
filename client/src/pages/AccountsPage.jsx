//PAGE : Main Accounts Page
//Combines the UI components onto one page

//IMPORTS
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Toolbar,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Info,
  Clear,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AccountsTable from '../components/AccountsTable';

import {
  getAllAccounts,
  deactivateAccount,
} from "../services/accountService";

// Monochrome theme for MUI components
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#050505',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#666666',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#050505',
      secondary: '#666666',
    },
    divider: '#e5e5e5',
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f0f0f0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          '&.Mui-selected': {
            backgroundColor: '#e0e0e0',
            '&:hover': {
              backgroundColor: '#d5d5d5',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 500,
        },
      },
    },
  },
});

const AccountsPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);

  // Function to fetch accounts data from backend API
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllAccounts();
      console.log("Fetched accounts:", response.data);
      setAccounts(response.data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounts once when component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Cleanup timer if component unmounts or successMessage changes
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter and search logic
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const fullAddress = [account.street_address1, account.street_address2, account.street_address3]
        .filter(Boolean)
        .join(" ");

      const matchesSearch =
        (account.AccountName && account.AccountName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (account.PrimaryPhone && account.PrimaryPhone.includes(searchTerm)) ||
        (account.Website && account.Website.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fullAddress && fullAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (account.postal_code && account.postal_code.includes(searchTerm)) ||
        (account.fax && account.fax.includes(searchTerm));

      const matchesStatus = !statusFilter ||
        (statusFilter === 'active' && account.Active) ||
        (statusFilter === 'inactive' && !account.Active);

      return matchesSearch && matchesStatus;
    });
  }, [accounts, searchTerm, statusFilter]);

  // Selection handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(filteredAccounts.map(account => account.AccountID));
    } else {
      setSelected([]);
    }
  };

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

  // Menu handlers
  const handleMenuClick = (event, account) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuRowId(account);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  // Navigate to create account page
  const handleOpenCreate = () => {
    navigate("/accounts/create");
  };

  // Deactivates an account 
  const handleDeactivate = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this account? This will deactivate it.");
    if (!confirm) return;

    setError(null);
    try {
      console.log("Deactivating (soft deleting) account with ID:", id);
      await deactivateAccount(id);
      setSuccessMessage("Account deleted successfully.");
      await fetchAccounts();
    } catch (error) {
      console.log("Deactivating (soft deleting) account with ID:", id);
      console.error("Delete failed:", error);
      setError("Failed to delete account. Please try again.");
    }
    handleMenuClose();
  };

  const handleEdit = (account) => {
    // Pass the full account object like in your original onEdit
    navigate(`/accounts/edit/${account.AccountID}`, { state: { account } });
    handleMenuClose();
  };

  const handleView = (accountId) => {
    navigate(`/accounts/${accountId}`);
    handleMenuClose();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#000000' : '#999999';
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const formatAddress = (account) => {
    const fullAddress = [account.street_address1, account.street_address2, account.street_address3]
      .filter(Boolean)
      .join(" ");
    return fullAddress || "-";
  };

  const formatRevenue = (revenue) => {
    if (!revenue) return "-";
    return new Intl.NumberFormat().format(revenue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {/* Display error alert if any error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Display success alert on successful operation */}
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
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {/* Toolbar with search and filters */}
          <Toolbar
            sx={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e5e5e5',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              py: 2
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
              {/* Add Account Button */}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenCreate}
                sx={{
                  backgroundColor: '#050505',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#333333',
                  },
                }}
              >
                Add Account
              </Button>

              {/* Search */}
              <TextField
                size="small"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#666666' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': { borderColor: '#e5e5e5' },
                    '&:hover fieldset': { borderColor: '#cccccc' },
                    '&.Mui-focused fieldset': { borderColor: '#050505' },
                  }
                }}
              />

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e5e5' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cccccc' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#050505' },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              {/* Clear Filters */}
              {(searchTerm || statusFilter) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                  startIcon={<Clear />}
                  sx={{
                    borderColor: '#e5e5e5',
                    color: '#666666',
                    '&:hover': {
                      borderColor: '#cccccc',
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Toolbar>

          {/* Table */}
          <AccountsTable
            accounts={filteredAccounts}
            selected={selected}
            onSelectClick={handleSelectClick}
            onSelectAllClick={handleSelectAllClick}
            isSelected={isSelected}
            formatAddress={formatAddress}
            formatRevenue={formatRevenue}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            onMenuClick={handleMenuClick}
            anchorEl={anchorEl}
            menuRowId={menuRowId}
            onMenuClose={handleMenuClose}
            onView={handleView}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
          />


          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                border: '1px solid #e5e5e5',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }
            }}
          >
            <MenuItem onClick={() => handleView(menuRowId?.AccountID)} sx={{ color: '#050505' }}>
              <Info sx={{ mr: 2, fontSize: 18 }} />
              View Details
            </MenuItem>
            <MenuItem onClick={() => handleEdit(menuRowId)} sx={{ color: '#050505' }}>
              <Edit sx={{ mr: 2, fontSize: 18 }} />
              Edit Account
            </MenuItem>
            <MenuItem
              onClick={() => handleDeactivate(menuRowId?.AccountID)}
              sx={{ color: '#dc2626' }}
              disabled={!menuRowId?.Active}
            >
              <Delete sx={{ mr: 2, fontSize: 18 }} />
              {menuRowId?.Active ? 'Delete Account' : 'Account Inactive'}
            </MenuItem>
          </Menu>

          {/* Results footer */}
          <Box sx={{
            p: 2,
            borderTop: '1px solid #e5e5e5',
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Showing {filteredAccounts.length} of {accounts.length} accounts
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