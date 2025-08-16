//PAGE : Main Deals Page (presentational only, no data fetching)

//IMPORTS
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Add,
} from "@mui/icons-material";
import {ThemeProvider } from "@mui/material/styles";
import { formatters } from '../utils/formatters';
import UniversalTable from '../components/TableView';
import { getAllDeals } from '../services/dealService';
import theme from "../components/Theme";


// Table configuration for deals
const dealsTableConfig = {
  idField: 'DealID',
  columns: [
    { field: 'DealName', headerName: 'Deal Name', type: 'tooltip' },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: 'SymbolValue', headerName: 'Amount' },
    { field: 'LocalName', headerName: 'Currency symbol' }, //currency name
    { field: 'CloseDate', headerName: 'Close Date', type: 'date' },
    { field: 'Probability', headerName: 'Probability (%)', type: 'percentage' },
    {
      field: 'CreatedAt',
      headerName: 'Created',
      type: 'dateTime',
    },
    {
      field: 'UpdatedAt',
      headerName: 'Updated',
      type: 'date',
    },
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
      const processedData = data.map(deal => ({
        ...deal, // keep all original deal fields
        SymbolValue: deal.Prefix
          ? `${deal.Symbol}${deal.Value}` // symbol before value
          : `${deal.Value}${deal.Symbol}` // symbol after value
      }));

      setDeals(processedData);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Action handlers - implement these based on your needs
  const onCreate = () => {
    navigate('/deals/create');
  };

  const onView = (dealId) => {
    navigate(`/deals/${dealId}`);
  };

  const onEdit = (deal) => {
    navigate(`/deals/${deal.DealID}/edit`);
  };

  const onDeactivate = (dealId) => {
    // Implement delete/deactivate logic
    console.log('Deactivate deal:', dealId);
    // Example:
    // if (window.confirm('Are you sure you want to delete this deal?')) {
    //   // Call your delete API
    // }
  };

  const onAddNote = (deal) => {
    // Implement add note logic
    console.log('Add note to deal:', deal.DealID);
  };

  const onAddAttachment = (deal) => {
    // Implement add attachment logic
    console.log('Add attachment to deal:', deal.DealID);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
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
        (deal.DealStageID && deal.DealStageID.toString().includes(searchTerm));

      const matchesStatus = !statusFilter ||
        (statusFilter === 'high' && deal.Probability >= 75) ||
        (statusFilter === 'medium' && deal.Probability >= 50 && deal.Probability < 75) ||
        (statusFilter === 'low' && deal.Probability < 50);

      return matchesSearch && matchesStatus;
    });
  }, [deals, searchTerm, statusFilter]);

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
      setSelected(deals.map(deal => deal.DealID));
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
          {/* Toolbar*/}
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
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
                disabled={loading}
                sx={{
                  backgroundColor: '#050505',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#333333' },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                    color: '#666666',
                  },
                }}
              >
                Add Deal
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
              data={deals}
              columns={dealsTableConfig.columns}
              idField={dealsTableConfig.idField}
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
              Showing {deals.length} of {deals.length} deals
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