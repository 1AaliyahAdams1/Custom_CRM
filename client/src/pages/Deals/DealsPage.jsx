import React, { useState, useEffect } from 'react';
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
import { ThemeProvider } from "@mui/material/styles";
import { formatters } from '../../utils/formatters';
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";

// Table configuration for deals
const dealsTableConfig = {
  idField: 'DealID',
  columns: [
    { field: 'DealName', headerName: 'Deal Name', type: 'tooltip' },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: 'SymbolValue', headerName: 'Amount' },
    { field: 'LocalName', headerName: 'Currency symbol' },
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

const DealsPage = ({ 
  deals = [],
  loading = false,
  error = null,
  successMessage = "",
  searchTerm = "",
  statusFilter = "",
  setSuccessMessage,
  setSearchTerm,
  setStatusFilter,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  clearFilters,
  totalCount = 0
}) => {
  const [selected, setSelected] = useState([]);

  // Process deals data to add SymbolValue field
  const processedDeals = deals.map(deal => ({
    ...deal,
    SymbolValue: deal.Prefix
      ? `${deal.Symbol}${deal.Value}`
      : `${deal.Value}${deal.Symbol}`
  }));

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        if (setSuccessMessage) {
          setSuccessMessage("");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

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
      setSelected(processedDeals.map(deal => deal.DealID));
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
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage && setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
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
            <TableView
              data={processedDeals}
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
              entityType="deal"
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
              Showing {processedDeals.length} of {totalCount} deals
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