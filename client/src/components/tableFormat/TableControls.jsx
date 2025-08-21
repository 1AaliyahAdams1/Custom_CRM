//This component is for the Search, Filter and Column buttons
import React from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewColumn as ColumnsIcon,
} from '@mui/icons-material';

const TableControls = ({
  searchTerm,
  onSearchChange,
  filtersExpanded,
  onToggleFilters,
  onOpenColumnsDialog,
  activeFiltersCount = 0,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
      <Button
        variant="outlined"
        startIcon={<FilterIcon />}
        onClick={onToggleFilters}
        sx={{
          backgroundColor: filtersExpanded ? 'primary.main' : 'transparent',
          color: filtersExpanded ? 'primary.contrastText' : 'primary.main',
          '&:hover': {
            backgroundColor: filtersExpanded ? 'primary.dark' : 'primary.light',
            color: filtersExpanded ? 'primary.contrastText' : 'primary.main',
          }
        }}
      >
        {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
        {activeFiltersCount > 0 && (
          <Chip
            label={activeFiltersCount}
            size="small"
            color={filtersExpanded ? "secondary" : "primary"}
            sx={{ ml: 1 }}
          />
        )}
      </Button>

      <TextField
        size="small"
        variant="outlined"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1 }} />,
        }}
        sx={{ minWidth: 250 }}
      />

      <Button 
        variant="outlined" 
        startIcon={<ColumnsIcon />} 
        onClick={onOpenColumnsDialog}
      >
        Columns
      </Button>
    </Box>
  );
};

export default TableControls;