import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { formatters } from '../../utils/formatters';
import TableView from '../../components/tableFormat/TableView';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`deals-tabpanel-${index}`}
      aria-labelledby={`deals-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const DealsPage = ({
  deals = [],
  loading = false,
  error = null,
  setError,
  successMessage = "",
  setSuccessMessage,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  clearFilters,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onFilterChange,
  totalCount = 0,
  currentFilter = 'all',
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [dealFilter, setDealFilter] = useState(currentFilter);

// Handle account name click
  const handleViewAccount = (deal) => {
    if (!deal?.AccountID) {
      if (setError) {
        setError("Cannot view account - missing ID");
      }
      return;
    }
    navigate(`/accounts/${deal.AccountID}`);
  };

  // Table configuration for deals
  const dealsTableConfig = {
    idField: 'DealID',
    columns: [
      { field: 'DealName', headerName: 'Deal Name', type: 'tooltip' },
      { field: "AccountName", headerName: "Account", type: "clickable", defaultVisible: true, onClick: handleViewAccount },
      { field: "StageName", headerName: "Stage", width: 150 },
      { field: 'SymbolValue', headerName: 'Amount' },
      { field: 'LocalName', headerName: 'Currency symbol' },
      { field: 'CloseDate', headerName: 'Close Date', type: 'date' },
      { field: 'Progression', headerName: 'Probability (%)', type: 'percentage' },
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
      {
        field: 'Active',
        headerName: 'Active',
        type: 'chip',
        chipLabels: { true: 'Active', false: 'Inactive' },
        chipColors: { true: '#079141ff', false: '#999999' },
        defaultVisible: true,
      }
    ]
  };

  // Define available tabs
  const userTabs = [
    { id: 'deals', label: 'Deals', component: 'deals' },
  ];

  // Sync filter state from parent
  useEffect(() => {
    setDealFilter(currentFilter);
  }, [currentFilter]);

  // Update filter in container
  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setDealFilter(newFilter);
    if (onFilterChange) onFilterChange(newFilter);
  };

  const filterOptions = [
    { value: 'all', label: 'All Deals' },
    { value: 'my', label: 'My Account Deals' },
    { value: 'team', label: 'My Team\'s Account Deals' },
    { value: 'unassigned', label: 'Unassigned Account Deals' },
  ];

  // Add SymbolValue for display
  const processedDeals = deals.map(deal => ({
    ...deal,
    SymbolValue: deal.Prefix
      ? `${deal.Symbol}${deal.Value}`
      : `${deal.Value}${deal.Symbol}`
  }));

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        if (setSuccessMessage) setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

  // Selection handlers
  const handleSelectClick = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(processedDeals.map(deal => deal.DealID));
    } else {
      setSelected([]);
    }
  };

  return (
    <Box sx={{ 
      width: "100%", 
      backgroundColor: theme.palette.background.default, 
      minHeight: "100vh", 
      p: 3 
    }}>
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider }}>
          <Tabs
            value={currentTab}
            onChange={(e, v) => setCurrentTab(v)}
            sx={{
              backgroundColor: theme.palette.background.paper,
              '& .MuiTab-root': { 
                textTransform: 'none', 
                fontSize: '1rem', 
                fontWeight: 500,
                color: theme.palette.text.secondary 
              },
              '& .MuiTabs-indicator': { 
                backgroundColor: theme.palette.primary.main 
              }
            }}
          >
            {userTabs.map((tab, idx) => (
              <Tab
                key={tab.id}
                label={tab.label}
                sx={{
                  '&.Mui-selected': { 
                    color: theme.palette.primary.main, 
                    fontWeight: 600 
                  }
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Deals Tab */}
        <TabPanel value={currentTab} index={0}>
          {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
          {successMessage && (
            <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccessMessage("")}>
              {successMessage}
            </Alert>
          )}

          {/* Toolbar */}
          <Toolbar
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              py: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, flexWrap: "wrap" }}>
              <Typography variant="h6" sx={{ 
                color: theme.palette.text.primary, 
                fontWeight: 600 
              }}>
                Deals 
              </Typography>
              <Tooltip title="Filter deals by ownership" arrow>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <Select 
                    value={dealFilter} 
                    onChange={handleFilterChange}
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
                    {filterOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Tooltip>

              {selected.length > 0 && (
                <Chip 
                  label={`${selected.length} selected`} 
                  size="small"
                  sx={{ 
                    backgroundColor: theme.palette.mode === 'dark' ? '#333' : "#e0e0e0", 
                    color: theme.palette.text.primary 
                  }}
                />
              )}
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onCreate}
              disabled={loading}
            >
              Add Deal
            </Button>
          </Toolbar>

          {/* Table */}
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
                Loading deals...
              </Typography>
            </Box>
          ) : (
            <TableView
              data={processedDeals}
              columns={dealsTableConfig.columns}
              idField={dealsTableConfig.idField}
              selected={selected}
              onSelectClick={handleSelectClick}
              onSelectAllClick={handleSelectAllClick}
              onViewAccount={handleViewAccount}
              showSelection
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={formatters}
              entityType="deal"
            />
          )}
        </TabPanel>

        {/* Footer with counts */}
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`, 
          backgroundColor: theme.palette.background.default, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Tooltip title="Total number of deals displayed in the table" arrow>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary, 
              cursor: 'help' 
            }}>
              Showing {deals.length} deals
            </Typography>
          </Tooltip>
          {selected.length > 0 && (
            <Tooltip title="Number of deals currently selected for bulk operations" arrow>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.primary, 
                fontWeight: 500, 
                cursor: 'help' 
              }}>
                {selected.length} selected
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default DealsPage;