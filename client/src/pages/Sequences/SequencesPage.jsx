import React, { useState, useEffect } from "react";
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
  Snackbar,
  FormControl,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Info,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';
import SequenceItemsPage from '../SequenceItems/SequenceItemsPage';
import ConfirmDialog from '../../components/dialogs/ConfirmDialog';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sequence-tabpanel-${index}`}
      aria-labelledby={`sequence-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const SequencePage = ({
  // Sequences Props
  sequences = [],
  loading = false,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  statusMessage,
  statusSeverity,
  setStatusMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onFilterChange,
  currentFilter = 'all',
  onDeactivate,
  onReactivate,
  onBulkDeactivate,
  onEdit,
  onView,
  onCreate,
  
  // Sequence Items Tab Props
  sequenceItemsProps = {},
  
  // Tab Management
  currentTab = 0,
  onTabChange,
  
  // Confirm Dialog Props
  confirmDialog = {},
  onConfirmDialogClose,
}) => {
  const theme = useTheme();
  const [sequenceFilter, setSequenceFilter] = useState(currentFilter);

  const availableTabs = [
    { id: 'sequences', label: 'Sequences', component: 'sequences' },
    { id: 'sequence-items', label: 'Sequence Items', component: 'items' },
  ];

  const handleTabChange = (event, newValue) => {
    if (onTabChange) onTabChange(newValue);
  };

  // Table columns configuration
  const columns = [
    { 
      field: 'SequenceName', 
      headerName: 'Sequence Name', 
      type: 'tooltip', 
      defaultVisible: true 
    },
    { 
      field: 'SequenceDescription', 
      headerName: 'Description', 
      type: 'truncated',
      defaultVisible: true 
    },
    { 
      field: 'CreatedAt', 
      headerName: 'Created', 
      type: 'date',
      defaultVisible: true 
    },
    { 
      field: 'UpdatedAt', 
      headerName: 'Updated', 
      type: 'date',
      defaultVisible: true 
    },
    { 
      field: 'Active', 
      headerName: 'Status', 
      defaultVisible: true 
    },
  ];

  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setSequenceFilter(newFilter);
    if (onFilterChange) onFilterChange(newFilter);
  };

  useEffect(() => {
    setSequenceFilter(currentFilter);
  }, [currentFilter]);
  
  const filterOptions = [
    { value: 'all', label: 'All Sequences' },
    { value: 'active', label: 'Active Sequences' },
    { value: 'inactive', label: "Inactive Sequences" },
  ];
  
  // Custom formatters
  const sequenceFormatters = {
    ...formatters,
    Active: (value) => {
      const isActive = value === true || value === 1;
      return (
        <Chip 
          label={isActive ? 'Active' : 'Inactive'} 
          size="small" 
          sx={{ 
            backgroundColor: isActive ? theme.palette.success.main : theme.palette.grey[500], 
            color: theme.palette.common.white, 
            fontWeight: 500 
          }} 
        />
      );
    },
  };

  // Filter sequences based on selected filter
  const filteredSequences = React.useMemo(() => {
    if (!sequences) return [];

    switch (sequenceFilter) {
      case "active":
        return sequences.filter(seq => seq.Active === true || seq.Active === 1);
      case "inactive":
        return sequences.filter(seq => !seq.Active || seq.Active === 0);
      default:
        return sequences;
    }
  }, [sequences, sequenceFilter]);

  return (
    <Box sx={{ width: "100%", backgroundColor: theme.palette.background.default, minHeight: "100vh", p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            sx={{ backgroundColor: theme.palette.background.paper }}
          >
            {availableTabs.map((tab, index) => (
              <Tab
                key={tab.id}
                label={tab.label}
                sx={{
                  color: currentTab === index ? theme.palette.text.primary : theme.palette.text.secondary,
                  '&.Mui-selected': { 
                    color: theme.palette.text.primary, 
                    fontWeight: 600 
                  },
                  textTransform: 'none',
                  fontSize: '1rem',
                  minHeight: 56
                }}
              />
            ))}
          </Tabs>
        </Box>

        {availableTabs.map((tab, index) => (
          <TabPanel key={tab.id} value={currentTab} index={index}>
            {tab.component === 'sequences' && (
              <>
                {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
                {successMessage && (
                  <Alert 
                    severity="success" 
                    sx={{ m: 2 }} 
                    onClose={() => setSuccessMessage && setSuccessMessage("")}
                  >
                    {successMessage}
                  </Alert>
                )}

                <Toolbar 
                  sx={{ 
                    backgroundColor: theme.palette.background.paper, 
                    borderBottom: `1px solid ${theme.palette.divider}`, 
                    justifyContent: 'space-between', 
                    flexWrap: 'wrap', 
                    gap: 2, 
                    py: 2 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
                      >
                        Sequences
                      </Typography>
                      <Tooltip title="Manage activity sequences and their workflow steps" arrow>
                        <Info sx={{ 
                          fontSize: 18, 
                          color: theme.palette.text.secondary, 
                          cursor: 'help' 
                        }} />
                      </Tooltip>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 240 }}>
                      <Select value={sequenceFilter} onChange={handleFilterChange} displayEmpty
                        sx={{ 
                          backgroundColor: theme.palette.background.paper,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.secondary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                        }}>
                        {filterOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      startIcon={<Add />} 
                      onClick={onCreate} 
                      disabled={loading}
                      sx={{ 
                        backgroundColor: theme.palette.primary.main, 
                        color: theme.palette.primary.contrastText, 
                        "&:hover": { backgroundColor: theme.palette.primary.dark } 
                      }}
                    >
                      Add Sequence
                    </Button>
                    
                    {selected.length > 0 && (
                      <Button 
                        variant="outlined" 
                        color="warning" 
                        onClick={onBulkDeactivate}
                      >
                        Deactivate Selected
                      </Button>
                    )}
                  </Box>
                </Toolbar>

                {loading ? (
                  <Box display="flex" justifyContent="center" p={8}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableView
                    data={filteredSequences}
                    columns={columns}
                    idField="SequenceID"
                    selected={selected}
                    onSelectClick={onSelectClick}
                    onSelectAllClick={onSelectAllClick}
                    showSelection={true}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDeactivate}
                    onReactivate={onReactivate}
                    formatters={sequenceFormatters}
                    entityType="sequence"
                    tooltips={{
                      search: "Search sequences by name or description",
                      filter: "Show/hide advanced filtering options",
                      columns: "Customize which columns are visible in the table",
                      actionMenu: {
                        view: "View detailed information for this sequence",
                        edit: "Edit this sequence's information",
                        delete: "Deactivate this sequence",
                        reactivate: "Reactivate this sequence"
                      }
                    }}
                  />
                )}

                <Box 
                  sx={{ 
                    p: 2, 
                    borderTop: `1px solid ${theme.palette.divider}`, 
                    backgroundColor: theme.palette.background.default, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Showing {filteredSequences.length} sequences
                  </Typography>
                  
                  {selected.length > 0 && (
                    <Typography 
                      variant="body2" 
                      sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                    >
                      {selected.length} selected
                    </Typography>
                  )}
                </Box>
              </>
            )}

            {tab.component === 'items' && <SequenceItemsPage {...sequenceItemsProps} />}
          </TabPanel>
        ))}
      </Paper>

      {/* Status Snackbar */}
      <Snackbar 
        open={!!statusMessage} 
        autoHideDuration={4000} 
        onClose={() => setStatusMessage && setStatusMessage('')} 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setStatusMessage && setStatusMessage('')} 
          severity={statusSeverity} 
          sx={{ width: '100%' }}
        >
          {statusMessage}
        </Alert>
      </Snackbar>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          open={confirmDialog.open || false}
          title={confirmDialog.title || ''}
          description={confirmDialog.description || ''}
          onConfirm={confirmDialog.onConfirm}
          onCancel={onConfirmDialogClose}
        />
      )}
    </Box>
  );
};

export default SequencePage;