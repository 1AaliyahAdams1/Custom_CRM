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
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  TextField,
  IconButton,
} from "@mui/material";
import {
  Add,
  Info,
  Clear,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { formatters } from '../../utils/formatters';
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";

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

const DealsPage = ({
const DealsPage = ({
  deals = [],
  loading = false,
  error = null,
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
  const [selected, setSelected] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [dealFilter, setDealFilter] = useState(currentFilter);

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
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "100%", backgroundColor: "#fafafa", minHeight: "100vh", p: 3 }}>
        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={(e, v) => setCurrentTab(v)}
              sx={{
                backgroundColor: '#fff',
                '& .MuiTab-root': { textTransform: 'none', fontSize: '1rem', fontWeight: 500 },
                '& .MuiTabs-indicator': { backgroundColor: '#050505' }
              }}
            >
              {userTabs.map((tab, idx) => (
                <Tab
                  key={tab.id}
                  label={tab.label}
                  sx={{
                    color: currentTab === idx ? '#050505' : '#666',
                    '&.Mui-selected': { color: '#050505', fontWeight: 600 }
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
                backgroundColor: "#fff",
                borderBottom: "1px solid #e5e5e5",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                py: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, flexWrap: "wrap" }}>
                <Typography variant="h6" sx={{ color: "#050505", fontWeight: 600 }}>
                  Deals 
                </Typography>
                <Tooltip title="Filter deals by ownership" arrow>
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <Select value={dealFilter} onChange={handleFilterChange}>
                      {filterOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>

                {/* <TextField
                  size="small"
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                {(searchTerm || statusFilter) && (
                  <IconButton onClick={clearFilters} size="small">
                    <Clear />
                  </IconButton>
                )}

                {selected.length > 0 && (
                  <Chip label={`${selected.length} selected`} size="small" />
                )} */}
              </Box>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
                disabled={loading}
                sx={{
                  backgroundColor: "#050505",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#333" },
                  "&:disabled": { backgroundColor: "#ccc", color: "#666" },
                }}
              >
                Add Deal
              </Button>
            </Toolbar>

            {/* Table */}
            {loading ? (
              <Box display="flex" alignItems="center" justifyContent="center" p={8}>
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
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default DealsPage;