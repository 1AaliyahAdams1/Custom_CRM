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
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Add, Info } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { formatters } from '../../utils/formatters';
import TableView from '../../components/tableFormat/TableView';

// Status configuration for active/inactive sequences
const statusConfig = {
  active: { label: "Active", color: "#4caf50" },
  inactive: { label: "Inactive", color: "#f44336" }
};

// Custom formatter for the Active status field
const activeStatusFormatter = (value) => {
  const status = value ? "active" : "inactive";
  const config = statusConfig[status];
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.color,
        color: "#fff",
        fontWeight: 500,
      }}
    />
  );
};

const SequencesPage = ({
  // Sequences props
  sequences = [],
  loading = false,
  error,
  successMessage,
  setSuccessMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onClearSelection,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onFilterChange,
  totalCount,
  currentFilter = 'active',
  userRole = [],
  
  // Bulk action handlers
  onBulkDeactivate,
  onBulkReactivate,
}) => {
  const theme = useTheme();
  
  // Local state for filter
  const [sequenceFilter, setSequenceFilter] = useState(currentFilter);

  // Table configuration for sequences
  const sequencesTableConfig = {
    idField: "SequenceID",
    columns: [
      { field: "SequenceName", headerName: "Sequence Name", type: "tooltip" },
      { 
        field: "SequenceDescription", 
        headerName: "Description", 
        type: "truncated",
        maxWidth: 400 // Limit width for better table layout
      },
      { field: "CreatedAt", headerName: "Created", type: "date" },
      { field: "UpdatedAt", headerName: "Updated", type: "date" },
      {
        field: "Active",
        headerName: "Status",
        type: "custom",
        formatter: activeStatusFormatter,
      },
    ],
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setSequenceFilter(newFilter);
    
    // Call the parent component's filter handler if provided
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  // Update local filter when prop changes
  useEffect(() => {
    setSequenceFilter(currentFilter);
  }, [currentFilter]);

  const filterOptions = [
    { value: 'active', label: 'Active Sequences' },
    { value: 'inactive', label: 'Inactive Sequences' },
    { value: 'all', label: 'All Sequences' },
  ];

  // Get selected sequences data for bulk actions
  const selectedSequences = sequences.filter(sequence => 
    selected.includes(sequence.SequenceID)
  );

  // Combine imported formatters with custom formatters
  const enhancedFormatters = {
    ...formatters,
    Active: activeStatusFormatter,
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            sx={{ m: 2 }}
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        {/* Sequences Toolbar */}
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{ 
                  color: theme.palette.text.primary, 
                  fontWeight: 600 
                }}
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

            {/* Sequence Filter Dropdown */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={sequenceFilter}
                onChange={handleFilterChange}
                displayEmpty
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.text.secondary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                {filterOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selected.length > 0 && (
              <Tooltip title={`${selected.length} sequence${selected.length === 1 ? '' : 's'} selected for operations`} arrow>
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
                  sx={{ 
                    backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#e0e0e0', 
                    color: theme.palette.text.primary 
                  }}
                />
              </Tooltip>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Tooltip title="Create a new sequence workflow" arrow>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
                disabled={loading}
              >
                Add Sequence
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>

        {/* Sequences Table */}
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
            <CircularProgress />
            <Tooltip title="Loading sequence data from the database" arrow>
              <Typography variant="body2" sx={{ 
                mt: 2, 
                color: theme.palette.text.secondary,
                cursor: 'help' 
              }}>
                Loading sequences...
              </Typography>
            </Tooltip>
          </Box>
        ) : (
          <TableView
            data={sequences}
            columns={sequencesTableConfig.columns}
            idField={sequencesTableConfig.idField}
            selected={selected}
            onSelectClick={onSelectClick}
            onSelectAllClick={onSelectAllClick}
            showSelection={true}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDeactivate}
            onAddNote={onAddNote}
            onAddAttachment={onAddAttachment}
            formatters={enhancedFormatters}
            entityType="sequence"
            tooltips={{
              search: "Search sequences by name or description",
              filter: "Show/hide advanced filtering options",
              columns: "Customize which columns are visible in the table",
              actionMenu: {
                view: "View detailed information for this sequence",
                edit: "Edit this sequence's information",
                delete: "Deactivate or reactivate this sequence",
                addNote: "Add internal notes or comments",
                addAttachment: "Attach files or documents"
              }
            }}
          />
        )}

        {/* Sequences Results Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Tooltip title="Total number of sequences currently displayed in the table" arrow>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary, 
              cursor: 'help' 
            }}>
              Showing {sequences.length} of {totalCount || sequences.length} sequences
            </Typography>
          </Tooltip>
          {selected.length > 0 && (
            <Tooltip title="Number of sequences currently selected for operations" arrow>
              <Typography
                variant="body2"
                sx={{ 
                  color: theme.palette.text.primary, 
                  fontWeight: 500, 
                  cursor: 'help' 
                }}
              >
                {selected.length} selected
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SequencesPage;