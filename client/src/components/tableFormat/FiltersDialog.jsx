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
  MenuItem,
  InputAdornment
} from '@mui/material';
import { Add, Clear, FilterList, TrendingUp } from '@mui/icons-material';

const FiltersDialog = ({ columns, onApplyFilters, deals = [], currentFilters = {} }) => {
  const [filters, setFilters] = useState(currentFilters);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [filterType, setFilterType] = useState('contains'); // 'contains', 'min', 'max', 'equals', 'range', 'after', 'before', 'on', 'dateRange'
  const [filterValue, setFilterValue] = useState('');
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // Sync local filters with parent's currentFilters
  useEffect(() => {
    setFilters(currentFilters || {});
  }, [currentFilters]);

  // Initialize selected column when columns are available
  useEffect(() => {
    if (columns && columns.length > 0 && !selectedColumn) {
      setSelectedColumn(columns[0].field);
      // Set default filter type based on column type
      if (isDateField(columns[0].field)) {
        setFilterType('after');
      } else if (isRangeField(columns[0].field)) {
        setFilterType('min');
      } else {
        setFilterType('contains');
      }
    }
  }, [columns, selectedColumn]);

  // Update filter type when column changes
  useEffect(() => {
    if (selectedColumn) {
      if (isDateField(selectedColumn)) {
        setFilterType('after');
      } else if (isRangeField(selectedColumn)) {
        setFilterType('min');
      } else {
        setFilterType('contains');
      }
      // Clear values when switching columns
      setFilterValue('');
      setRangeMin('');
      setRangeMax('');
      setDateValue('');
      setDateRangeStart('');
      setDateRangeEnd('');
    }
  }, [selectedColumn]);

  // Check if current column is a date field
  const isDateField = (field) => {
    const dateFields = ['Date', 'Created', 'Updated', 'Modified', 'Start', 'End', 'Deadline', 'Due', 'Scheduled', 'Time'];
    return dateFields.some(dateField => 
      field.toLowerCase().includes(dateField.toLowerCase())
    );
  };

  // Check if current column is an amount/currency field
  const isAmountField = (field) => {
    const amountFields = ['SymbolValue', 'Amount', 'Value', 'Price', 'Cost', 'Revenue', 'Venues'];
    return amountFields.some(amountField => 
      field.toLowerCase().includes(amountField.toLowerCase())
    );
  };

  // Check if current column is a percentage/probability field
  const isPercentageField = (field) => {
    const percentageFields = ['Progression', 'Probability', 'Percent', 'Rate', 'Ratio'];
    return percentageFields.some(percentageField => 
      field.toLowerCase().includes(percentageField.toLowerCase())
    );
  };

  // Check if field supports range filtering
  const isRangeField = (field) => {
    return isAmountField(field) || isPercentageField(field);
  };

  // Extract numeric value from amount string (e.g., "$1,234.56" -> 1234.56)
  const extractNumericValue = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    
    // Remove currency symbols, commas, and spaces, then parse
    const numericString = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(numericString);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Parse date value to Date object
  const parseDate = (value) => {
    if (!value) return null;
    
    // If it's already a Date object
    if (value instanceof Date) return value;
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Handle various date formats
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // If it's a timestamp
    if (typeof value === 'number') {
      return new Date(value);
    }
    
    return null;
  };

  // Format date for display and comparison (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return '';
    const dateObj = parseDate(date);
    if (!dateObj) return '';
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Compare dates (returns -1, 0, or 1)
  const compareDates = (date1, date2) => {
    const d1 = parseDate(date1);
    const d2 = parseDate(date2);
    
    if (!d1 || !d2) return 0;
    
    // Compare only the date part (ignore time)
    const d1Date = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const d2Date = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    
    if (d1Date < d2Date) return -1;
    if (d1Date > d2Date) return 1;
    return 0;
  };

  // Check if a value matches the filter
  const matchesFilter = (itemValue, filterConfig, field) => {
    const { type, value, min, max, dateStart, dateEnd } = filterConfig;
    
    if (isDateField(field)) {
      const itemDate = parseDate(itemValue);
      if (!itemDate) return false;
      
      switch (type) {
        case 'after':
          const afterDate = parseDate(value);
          return afterDate ? compareDates(itemValue, afterDate) >= 0 : true;
        case 'before':
          const beforeDate = parseDate(value);
          return beforeDate ? compareDates(itemValue, beforeDate) <= 0 : true;
        case 'on':
          const onDate = parseDate(value);
          return onDate ? compareDates(itemValue, onDate) === 0 : true;
        case 'dateRange':
          const startDate = parseDate(dateStart);
          const endDate = parseDate(dateEnd);
          if (!startDate || !endDate) return true;
          return compareDates(itemValue, startDate) >= 0 && compareDates(itemValue, endDate) <= 0;
        default:
          return true;
      }
    } else if (isRangeField(field)) {
      let numericValue = extractNumericValue(itemValue);
      
      const compareValue = parseFloat(value);
      const compareMin = parseFloat(min);
      const compareMax = parseFloat(max);
      
      switch (type) {
        case 'min':
          return numericValue >= compareValue;
        case 'max':
          return numericValue <= compareValue;
        case 'equals':
          return numericValue === compareValue;
        case 'range':
          return numericValue >= compareMin && numericValue <= compareMax;
        default:
          return true;
      }
    } else {
      // Standard text filtering for non-range fields
      if (type === 'contains') {
        return itemValue?.toString().toLowerCase().includes(value.toString().toLowerCase());
      } else if (type === 'equals') {
        return itemValue?.toString().toLowerCase() === value.toString().toLowerCase();
      }
    }
    
    return true;
  };

  const handleAddFilter = () => {
    if (!selectedColumn) return;
    
    let filterConfig;
    
    if (isDateField(selectedColumn)) {
      if (filterType === 'dateRange') {
        if (!dateRangeStart.trim() || !dateRangeEnd.trim()) return;
        filterConfig = {
          type: 'dateRange',
          dateStart: dateRangeStart.trim(),
          dateEnd: dateRangeEnd.trim(),
          displayValue: `${dateRangeStart} to ${dateRangeEnd}`
        };
      } else {
        if (!dateValue.trim()) return;
        filterConfig = {
          type: filterType,
          value: dateValue.trim(),
          displayValue: dateValue.trim()
        };
      }
    } else if (isRangeField(selectedColumn)) {
      if (filterType === 'range') {
        if (!rangeMin.trim() || !rangeMax.trim()) return;
        filterConfig = {
          type: 'range',
          min: rangeMin.trim(),
          max: rangeMax.trim(),
          displayValue: `${rangeMin} - ${rangeMax}`
        };
      } else {
        if (!filterValue.trim()) return;
        filterConfig = {
          type: filterType,
          value: filterValue.trim(),
          displayValue: filterValue.trim()
        };
      }
    } else {
      if (!filterValue.trim()) return;
      filterConfig = {
        type: filterType,
        value: filterValue.trim(),
        displayValue: filterValue.trim()
      };
    }
    
    const newFilters = { ...filters, [selectedColumn]: filterConfig };
    setFilters(newFilters);
    setFilterValue('');
    setRangeMin('');
    setRangeMax('');
    setDateValue('');
    setDateRangeStart('');
    setDateRangeEnd('');
    
    // Apply filters
    applyFilters(newFilters);
  };

  const handleRemoveFilter = (field) => {
    const newFilters = { ...filters };
    delete newFilters[field];
    setFilters(newFilters);
    
    // Apply filters
    applyFilters(newFilters);
  };

  const applyFilters = (filtersToApply = filters) => {
    if (onApplyFilters) {
      // Create a custom filtering function that handles all filter types
      const customFilteredDeals = deals.filter((deal) => {
        for (const [field, filterConfig] of Object.entries(filtersToApply)) {
          if (filterConfig && typeof filterConfig === 'object') {
            const itemValue = deal[field];
            if (!matchesFilter(itemValue, filterConfig, field)) {
              return false;
            }
          }
        }
        return true;
      });
      
      // Pass both the filters and pre-filtered data to parent
      onApplyFilters(filtersToApply, customFilteredDeals);
    }
  };

  const handleClearAllFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    setFilterValue('');
    setRangeMin('');
    setRangeMax('');
    setDateValue('');
    setDateRangeStart('');
    setDateRangeEnd('');
    if (onApplyFilters) {
      onApplyFilters(emptyFilters);
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

  const getFilterTypeOptions = (field) => {
    if (isDateField(field)) {
      return [
        { value: 'after', label: 'After' },
        { value: 'before', label: 'Before' },
        { value: 'on', label: 'On' },
        { value: 'dateRange', label: 'Date Range' }
      ];
    } else if (isRangeField(field)) {
      return [
        { value: 'min', label: 'Minimum' },
        { value: 'max', label: 'Maximum' },
        { value: 'equals', label: 'Equal to' },
        { value: 'range', label: 'Range' }
      ];
    } else {
      return [
        { value: 'contains', label: 'Contains' },
        { value: 'equals', label: 'Equal to' }
      ];
    }
  };

  const formatFilterDisplay = (field, filterConfig) => {
    if (!filterConfig || typeof filterConfig !== 'object') {
      return `${getColumnDisplayName(field)}: ${filterConfig}`;
    }
    
    const { type, value, min, max, dateStart, dateEnd } = filterConfig;
    const columnName = getColumnDisplayName(field);
    
    switch (type) {
      case 'min':
        return `${columnName}: ≥ ${value}`;
      case 'max':
        return `${columnName}: ≤ ${value}`;
      case 'equals':
        return `${columnName}: = ${value}`;
      case 'range':
        return `${columnName}: ${min} - ${max}`;
      case 'contains':
        return `${columnName}: contains "${value}"`;
      case 'after':
        return `${columnName}: after ${value}`;
      case 'before':
        return `${columnName}: before ${value}`;
      case 'on':
        return `${columnName}: on ${value}`;
      case 'dateRange':
        return `${columnName}: ${dateStart} to ${dateEnd}`;
      default:
        return `${columnName}: ${value}`;
    }
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

  // Render filter value inputs based on field type and filter type
  const renderFilterInputs = () => {
    if (isDateField(selectedColumn)) {
      if (filterType === 'dateRange') {
        return (
          <>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </>
        );
      } else {
        return (
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={
                filterType === 'after' ? 'After Date' :
                filterType === 'before' ? 'Before Date' :
                filterType === 'on' ? 'On Date' :
                'Select Date'
              }
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        );
      }
    } else if (isRangeField(selectedColumn)) {
      if (filterType === 'range') {
        return (
          <>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Minimum"
                value={rangeMin}
                onChange={(e) => setRangeMin(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Maximum"
                value={rangeMax}
                onChange={(e) => setRangeMax(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                type="number"
              />
            </Grid>
          </>
        );
      } else {
        return (
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={
                filterType === 'min' ? 'Minimum Value' :
                filterType === 'max' ? 'Maximum Value' :
                filterType === 'equals' ? 'Equal to' :
                'Filter Value'
              }
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              type="number"
              placeholder={
                `Enter ${isPercentageField(selectedColumn) ? 'percentage' : 'amount'}`
              }
            />
          </Grid>
        );
      }
    } else {
      return (
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={
              filterType === 'equals' ? 'Equal to' : 'Filter Value'
            }
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            type="text"
            placeholder={`Enter ${getColumnDisplayName(selectedColumn).toLowerCase()}`}
          />
        </Grid>
      );
    }
  };

  // Check if add button should be disabled
  const isAddButtonDisabled = () => {
    if (!selectedColumn) return true;
    
    if (isDateField(selectedColumn)) {
      if (filterType === 'dateRange') {
        return !dateRangeStart.trim() || !dateRangeEnd.trim();
      } else {
        return !dateValue.trim();
      }
    } else if (isRangeField(selectedColumn)) {
      if (filterType === 'range') {
        return !rangeMin.trim() || !rangeMax.trim();
      } else {
        return !filterValue.trim();
      }
    } else {
      return !filterValue.trim();
    }
  };

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

        {/* Filter Type Selector */}
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter Type"
            >
              {getFilterTypeOptions(selectedColumn).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Filter Value Input(s) */}
        {renderFilterInputs()}

        {/* Add Filter Button */}
        <Grid item xs={12} sm={1}>
          <Button
            variant="contained"
            onClick={handleAddFilter}
            disabled={isAddButtonDisabled()}
            fullWidth
            startIcon={<Add />}
            size="small"
          >
            Add
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
            {Object.entries(filters).map(([field, filterConfig]) => (
              <Chip
                key={field}
                label={formatFilterDisplay(field, filterConfig)}
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
            No filters applied. Select a column, choose a filter type, and add filters above to narrow down your results.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FiltersDialog;