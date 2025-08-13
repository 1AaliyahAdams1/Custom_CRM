//PAGE : Main Deals Page
//Combines the UI components onto one page using UniversalTable

//IMPORTS
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Toolbar,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Add,
  Clear,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UniversalTable from '../components/TableView';

import {
  getAllDeals,
  deactivateDeal,
} from "../services/dealService";

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

// Table configuration for deals
const dealsTableConfig = {
  idField: 'DealID',
  columns: [
    { field: "DealName", headerName: "Deal Name", width: 200 },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: "Value", headerName: "Value", width: 150 },
    { field: "CloseDate", headerName: "Close Date", width: 150 },
    { field: "Probability", headerName: "Probability (%)", width: 150 },
    { field: "CreatedAt", headerName: "Created At", width: 180 },
    { field: "UpdatedAt", headerName: "Updated At", width: 180 }
  ]
};

const DealsPage = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Function to fetch deals data from backend API
  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllDeals(true);
      console.log("Fetched deals:", data);
      setDeals(data);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch deals once when component mounts
  useEffect(() => {
    fetchDeals();
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
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        (deal.DealName && deal.DealName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deal.AccountID && deal.AccountID.toString().includes(searchTerm)) ||
        (deal.DealStageID && deal.DealStageID.toString().includes(searchTerm)) ||
        (deal.Value && deal.Value.toString().includes(searchTerm));

      const matchesStatus = !statusFilter ||
        (statusFilter === 'high' && deal.Probability >= 75) ||
        (statusFilter === 'medium' && deal.Probability >= 50 && deal.Probability < 75) ||
        (statusFilter === 'low' && deal.Probability < 50);

      return matchesSearch && matchesStatus;
    });
  }, [deals, searchTerm, statusFilter]);

  // Selection handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(filteredDeals.map(deal => deal.DealID));
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

  // Navigate to create deal page
  const handleOpenCreate = () => {
    navigate("/deals/create");
  };

  // Deactivates a deal 
  const handleDeactivate = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this deal? This will deactivate it.");
    if (!confirm) return;

    setError(null);
    try {
      console.log("Deactivating (soft deleting) deal with ID:", id);
      await deactivateDeal(id);
      setSuccessMessage("Deal deleted successfully.");
      await fetchDeals();
    } catch (error) {
      console.log("Deactivating (soft deleting) deal with ID:", id);
      console.error("Delete failed:", error);
      setError("Failed to delete deal. Please try again.");
    }
  };

  const handleEdit = (deal) => {
    // Pass the full deal object like in your original onEdit
    navigate(`/deals/edit/${deal.DealID}`, { state: { deal } });
  };

  const handleView = (dealId) => {
    navigate(`/deals/${dealId}`);
  };

  //  Handle adding notes
  const handleAddNote = (deal) => {
    console.log("Adding note for deal:", deal);
    // Navigate to notes page or open modal
    navigate(`/deals/${deal.DealID}/notes`);
  };

  // Handle adding attachments
  const handleAddAttachment = (deal) => {
    console.log("Adding attachment for deal:", deal);
    // Navigate to attachments page or open file picker
    navigate(`/deals/${deal.DealID}/attachments`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  // Custom formatters for the table
  const formatters = {
    Value: (value) => {
      if (!value) return "-";
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    },
    Probability: (value) => {
      if (!value && value !== 0) return "-";
      return `${value}%`;
    },
    CloseDate: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      if (isNaN(date)) return "-";
      return date.toLocaleDateString();
    },
    CreatedAt: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      if (isNaN(date)) return "-";
      return date.toLocaleDateString();
    },
    UpdatedAt: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      if (isNaN(date)) return "-";
      return date.toLocaleDateString();
    },
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
            border: '0px solid #e5e5e5',
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
                Deals
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
              {/* Add Deal Button */}
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
                Add Deal
              </Button>

              {/* Search */}
              <TextField
                size="small"
                placeholder="Search deals..."
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

              {/* Probability Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Probability</InputLabel>
                <Select
                  value={statusFilter}
                  label="Probability"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e5e5' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cccccc' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#050505' },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="high">High (75%+)</MenuItem>
                  <MenuItem value="medium">Medium (50-74%)</MenuItem>
                  <MenuItem value="low">Low (&lt;50%)</MenuItem>
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

          {/* Universal Table */}
          <UniversalTable
            data={filteredDeals}
            columns={dealsTableConfig.columns}
            idField={dealsTableConfig.idField}
            selected={selected}
            onSelectClick={handleSelectClick}
            onSelectAllClick={handleSelectAllClick}
            showSelection={true}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeactivate}
            onAddNote={handleAddNote}
            onAddAttachment={handleAddAttachment}
            formatters={formatters}
          />

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
              Showing {filteredDeals.length} of {deals.length} deals
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

export default DealsPage;