import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Link,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import {
  MoreVert,
  Info,
  Edit,
  Delete,
  Note,
  AttachFile,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewColumn as ColumnsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import ColumnsDialog from './ColumnsDialog';

const TableView = ({
  data = [],
  columns = [],
  idField = 'id',
  selected = [],
  onSelectClick,
  onSelectAllClick,
  showSelection = false,
  showActions = true,
  onView,
  onEdit,
  onDelete,
  onAddNote,
  onAddAttachment,
  menuItems = [],
  formatters = {},
}) => {
  // State for action menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.field]: true }), {})
  );

  // Dialog open states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);

  // Helpers
  const isSelected = (id) => selected.includes(id);

  // Menu handlers
  const handleMenuClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  // Action handlers
  const handleView = () => {
    if (onView && menuRow) onView(menuRow[idField]);
    handleMenuClose();
  };
  const handleEdit = () => {
    if (onEdit && menuRow) onEdit(menuRow);
    handleMenuClose();
  };
  const handleDelete = () => {
    if (onDelete && menuRow) onDelete(menuRow[idField]);
    handleMenuClose();
  };
  const handleAddNote = () => {
    if (onAddNote && menuRow) onAddNote(menuRow);
    handleMenuClose();
  };
  const handleAddAttachment = () => {
    if (onAddAttachment && menuRow) onAddAttachment(menuRow);
    handleMenuClose();
  };

  // Unique values for filters
  const getUniqueValues = (field) =>
    [...new Set(data.map((item) => item[field]).filter(Boolean))].sort();

  // Filterable columns (chip, boolean, or limited unique values)
  const filterableColumns = columns.filter(
    (col) =>
      col.type === 'chip' ||
      col.type === 'boolean' ||
      ((col.type === 'tooltip' || col.type === 'truncated' || !col.type) &&
        getUniqueValues(col.field).length <= 20)
  );

  // Filter data by search term and filters
  const filteredData = data.filter((item) => {
    if (searchTerm) {
      const searchableFields = columns.map((c) => c.field);
      const found = searchableFields.some((field) => {
        const val = item[field];
        return val && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!found) return false;
    }
    for (const [filterField, filterValue] of Object.entries(filters)) {
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        const itemVal = item[filterField];
        if (typeof filterValue === 'boolean') {
          if (itemVal !== filterValue) return false;
        } else {
          if (itemVal?.toString() !== filterValue.toString()) return false;
        }
      }
    }
    return true;
  });

  // Columns to display based on visibility
  const displayedColumns = columns.filter((col) => visibleColumns[col.field]);

  // Selection handlers
  const handleSelectAll = (event) => {
    onSelectAllClick && onSelectAllClick(event);
  };
  const handleSelectRow = (id) => {
    onSelectClick && onSelectClick(id);
  };

  // Render cell content with formatting
  const renderCellContent = (row, column) => {
    const value = row[column.field];
    if (formatters[column.field]) {
      return formatters[column.field](value, row);
    }
    switch (column.type) {
      case 'chip':
        return (
          <Chip
            label={column.chipLabels ? column.chipLabels[value] : value}
            sx={{
              backgroundColor: column.chipColors ? column.chipColors[value] : '#1976d2',
              color: '#fff',
              fontWeight: 500,
            }}
            size="small"
          />
        );
      case 'boolean':
        return (
          <Chip
            label={value ? 'Yes' : 'No'}
            sx={{
              backgroundColor: value ? '#4caf50' : '#f44336',
              color: '#fff',
              fontWeight: 500,
            }}
            size="small"
          />
        );
      case 'link':
        if (!value) return '-';
        const href = value.startsWith('http') ? value : `https://${value}`;
        return (
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            {value}
          </Link>
        );
      case 'truncated':
        if (!value) return '-';
        return (
          <Tooltip title={value}>
            <span
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: column.maxWidth || 200,
              }}
            >
              {value}
            </span>
          </Tooltip>
        );
      case 'tooltip':
        return (
          <Tooltip title={value || ''}>
            <span>{value || '-'}</span>
          </Tooltip>
        );
      default:
        return value || '-';
    }
  };

  // Filter dialog UI
  const FilterDialog = () => (
    <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
      <DialogTitle>Filters</DialogTitle>
      <DialogContent dividers>
        {filterableColumns.length === 0 && <Box>No filterable columns</Box>}
        {filterableColumns.map((col) => (
          <FormControl fullWidth key={col.field} sx={{ mt: 2 }} size="small">
            <InputLabel>{col.headerName}</InputLabel>
            <Select
              value={filters[col.field] !== undefined ? filters[col.field] : ''}
              label={col.headerName}
              onChange={(e) => {
                const val = e.target.value;
                setFilters((prev) => {
                  const newFilters = { ...prev };
                  if (val === '') {
                    delete newFilters[col.field];
                  } else {
                    let parsedVal = val;
                    if (col.type === 'boolean') {
                      parsedVal = val === 'true';
                    }
                    newFilters[col.field] = parsedVal;
                  }
                  return newFilters;
                });
              }}
            >
              <MuiMenuItem value="">All</MuiMenuItem>
              {getUniqueValues(col.field).map((value) => (
                <MuiMenuItem key={value} value={value.toString()}>
                  {col.chipLabels ? col.chipLabels[value] || value : value}
                </MuiMenuItem>
              ))}
              {col.type === 'boolean' && (
                <>
                  <MuiMenuItem value="true">Yes</MuiMenuItem>
                  <MuiMenuItem value="false">No</MuiMenuItem>
                </>
              )}
            </Select>
          </FormControl>
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setFilters({});
            setFilterDialogOpen(false);
          }}
          color="secondary"
          startIcon={<CloseIcon />}
        >
          Clear Filters
        </Button>
        <Button onClick={() => setFilterDialogOpen(false)} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Open columns dialog
  const openColumnsDialog = () => {
    setColumnsDialogOpen(true);
  };

  // Save columns visibility from dialog
  const handleColumnsSave = (newVisibleColumns) => {
    setVisibleColumns(newVisibleColumns);
    setColumnsDialogOpen(false);
  };

  // Default menu actions
  const defaultMenuItems = [
    {
      label: 'View Details',
      icon: <Info sx={{ mr: 2 }} />,
      onClick: handleView,
      show: !!onView,
    },
    {
      label: 'Edit',
      icon: <Edit sx={{ mr: 2 }} />,
      onClick: handleEdit,
      show: !!onEdit,
    },
    {
      label: 'Add Notes',
      icon: <Note sx={{ mr: 2 }} />,
      onClick: handleAddNote,
      show: !!onAddNote,
      sx: { color: '#2563eb' },
    },
    {
      label: 'Add Attachments',
      icon: <AttachFile sx={{ mr: 2 }} />,
      onClick: handleAddAttachment,
      show: !!onAddAttachment,
      sx: { color: '#059669' },
    },
    {
      label: 'Delete',
      icon: <Delete sx={{ mr: 2 }} />,
      onClick: handleDelete,
      show: !!onDelete,
      sx: { color: '#dc2626' },
      disabled: (row) => row?.Active === false,
    },
    {
      label: 'Delete',
      icon: <Delete sx={{ mr: 2 }} />,
      onClick: handleDelete,
      show: !!onDelete,
      sx: { color: '#dc2626' },
      disabled: (row) => row?.Active === false, // Can be customized per table
    }
  ];

  const allMenuItems = menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <>
      {/* Search + Filter + Columns */}
      <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ minWidth: 250 }}
        />

        <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => setFilterDialogOpen(true)}>
          Filters
          {Object.keys(filters).length > 0 && (
            <Chip label={Object.keys(filters).length} size="small" color="primary" sx={{ ml: 1 }} />
          )}
        </Button>

        <Button variant="outlined" startIcon={<ColumnsIcon />} onClick={openColumnsDialog}>
          Columns
        </Button>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {showSelection && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < filteredData.length}
                    checked={filteredData.length > 0 && selected.length === filteredData.length}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'select all rows' }}
                  />
                </TableCell>
              )}
              {displayedColumns.map((column) => (
                <TableCell key={column.field} sx={{ fontWeight: 600 }}>
                  {column.headerName || column.field}
                </TableCell>
              ))}
              {showActions && <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.map((row) => {
              const isItemSelected = showSelection ? isSelected(row[idField]) : false;
              return (
                <TableRow
                  key={row[idField]}
                  hover
                  selected={isItemSelected}
                  onClick={showSelection ? () => handleSelectRow(row[idField]) : undefined}
                  sx={{ cursor: showSelection ? 'pointer' : 'default' }}
                >
                  {showSelection && (
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} />
                    </TableCell>
                  )}
                  {displayedColumns.map((column) => (
                    <TableCell key={column.field}>{renderCellContent(row, column)}</TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menus */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {allMenuItems
          .filter((item) => item.show !== false)
          .map((item, index) => (
            <MenuItem
              key={index}
              onClick={item.onClick}
              disabled={typeof item.disabled === 'function' ? item.disabled(menuRow) : item.disabled}
              sx={item.sx}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
      </Menu>

      {/* Dialogs */}
      <FilterDialog />
      <ColumnsDialog
        open={columnsDialogOpen}
        visibleColumns={visibleColumns}
        onClose={() => setColumnsDialogOpen(false)}
        onSave={handleColumnsSave}
        columns={columns}
      />
    </>
  );
};

export default TableView;
