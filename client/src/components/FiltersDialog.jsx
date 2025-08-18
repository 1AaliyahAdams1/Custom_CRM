import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Typography,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Clear, FilterList } from '@mui/icons-material';

const FiltersDialog = ({ columns, onApplyFilters, deals = [] }) => {
  const [filters, setFilters] = useState({});
  const [selectedColumn, setSelectedColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');

  // Initialize selected column when columns are available
  useEffect(() => {
    if (columns && columns.length > 0 && !selectedColumn) {
      setSelectedColumn(columns[0].field);
    }
  }, [columns, selectedColumn]);

  // Reset filters when columns change
  useEffect(() => {
    if (columns && columns.length > 0) {
      setFilters({});
    }
  }, [columns]);

  const handleAddFilter = () => {
    if (selectedColumn && filterValue.trim()) {
      const newFilters = { ...filters, [selectedColumn]: filterValue.trim() };
      setFilters(newFilters);
      setFilterValue('');
      
      // Auto-apply filters after adding
      applyFilters(newFilters);
    }
  };

  const handleRemoveFilter = (field) => {
    const newFilters = { ...filters };
    delete newFilters[field];
    setFilters(newFilters);
    
    // Auto-apply filters after removing
    applyFilters(newFilters);
  };

  const applyFilters = (filtersToApply = filters) => {
    if (onApplyFilters) {
      onApplyFilters(filtersToApply);
    }
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setFilterValue('');
    if (onApplyFilters) {
      onApplyFilters({});
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddFilter();
    }
  };

  const getColumnDisplayName = (field) => {
    const column = columns?.find(col => col.field === field);
    return column?.headerName || field;
  };

  // Show loading state if columns haven't been provided yet
  if (!columns || columns.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="center" minHeight={100}>
          <Typography color="text.secondary">
            Loading filter options...
          </Typography>
        </Box>
      </Paper>
    );
  }

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <FilterList color="primary" />
        <Typography variant="h6" component="h2">
          Filter Data
        </Typography>
        {activeFiltersCount > 0 && (
          <Chip 
            label={`${activeFiltersCount} active`} 
            size="small" 
            color="primary" 
          />
        )}
      </Box>
      
      {/* Filter Controls */}
      <Grid container spacing={2} alignItems="flex-end">
        {/* Column Selector */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Column to Filter</InputLabel>
            <Select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              label="Column to Filter"
            >
              {columns.map((column) => (
                <MenuItem key={column.field} value={column.field}>
                  {column.headerName || column.field}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filter Value Input */}
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label={`Filter by ${getColumnDisplayName(selectedColumn)}`}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            placeholder={`Enter ${getColumnDisplayName(selectedColumn).toLowerCase()} to filter...`}
          />
        </Grid>

        {/* Add Filter Button */}
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            onClick={handleAddFilter}
            disabled={!selectedColumn || !filterValue.trim()}
            fullWidth
            startIcon={<Add />}
            size="small"
          >
            Add Filter
          </Button>
        </Grid>

        {/* Clear All Button */}
        <Grid item xs={12} sm={2}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearAllFilters}
            disabled={activeFiltersCount === 0}
            fullWidth
            startIcon={<Clear />}
            size="small"
          >
            Clear All
          </Button>
        </Grid>
      </Grid>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Active Filters ({activeFiltersCount}):
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(filters).map(([field, value]) => (
              <Chip
                key={field}
                label={`${getColumnDisplayName(field)}: ${value}`}
                onDelete={() => handleRemoveFilter(field)}
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiChip-deleteIcon': {
                    fontSize: '1.1rem',
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Filter Summary */}
      {activeFiltersCount === 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            No filters applied. Add filters above to narrow down your results.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FiltersDialog;