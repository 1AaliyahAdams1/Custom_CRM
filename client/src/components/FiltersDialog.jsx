import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const FiltersDialog = ({
  open,
  onClose,
  onSave,
  columns = [],
  data = [],
  currentFilters = {},
}) => {
  // Internal temp filter state to apply on save
  const [localFilters, setLocalFilters] = useState({});

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, open]);

  // Helper: get unique values for a field from data
  const getUniqueValues = (field) =>
    [...new Set(data.map((item) => item[field]).filter(Boolean))].sort();

  // Determine which columns are filterable (same logic as in TableView)
  const filterableColumns = columns.filter(
    (col) =>
      col.type === 'chip' ||
      col.type === 'boolean' ||
      ((col.type === 'tooltip' || col.type === 'truncated' || !col.type) &&
        getUniqueValues(col.field).length <= 20)
  );

  const handleFilterChange = (field, value) => {
    setLocalFilters((prev) => {
      const updated = { ...prev };
      if (value === '') {
        delete updated[field];
      } else {
        let parsedVal = value;
        const col = columns.find((c) => c.field === field);
        if (col?.type === 'boolean') {
          parsedVal = value === 'true';
        }
        updated[field] = parsedVal;
      }
      return updated;
    });
  };

  const handleClear = () => {
    setLocalFilters({});
  };

  const handleSave = () => {
    onSave(localFilters);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Filters</DialogTitle>
      <DialogContent dividers>
        {filterableColumns.length === 0 && <Box>No filterable columns</Box>}
        {filterableColumns.map((col) => (
          <FormControl fullWidth key={col.field} sx={{ mt: 2 }} size="small">
            <InputLabel>{col.headerName}</InputLabel>
            <Select
              value={localFilters[col.field] !== undefined ? localFilters[col.field].toString() : ''}
              label={col.headerName}
              onChange={(e) => handleFilterChange(col.field, e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {getUniqueValues(col.field).map((value) => (
                <MenuItem key={value} value={value.toString()}>
                  {col.chipLabels ? col.chipLabels[value] || value : value}
                </MenuItem>
              ))}
              {col.type === 'boolean' && (
                <>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </>
              )}
            </Select>
          </FormControl>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} color="secondary" startIcon={<CloseIcon />}>
          Clear Filters
        </Button>
        <Button onClick={handleSave} variant="contained">
          Apply
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FiltersDialog;
