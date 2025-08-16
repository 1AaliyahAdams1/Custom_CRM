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
  Business,
  PersonAdd,
  Business,
  PersonAdd,
} from '@mui/icons-material';

import ColumnsDialog from './ColumnsDialog';
import FilterDialog from './FiltersDialog';

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
  onClaimAccount,
  entityType,
  onAssignUser,
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

  // Dialog open states - removed filterDialogOpen since we're not using a dialog anymore
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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
  const handleAssignUser = () => {
    if (onAssignUser && menuRow) onAssignUser(menuRow);
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
  const handleClaimAccount = () => {
  if (onClaimAccount && menuRow) onClaimAccount(menuRow);
  handleMenuClose();
};

  // Get filtered data based on search term and filters
  const filteredData = data.filter((item) => {
    // Search term filter
    if (searchTerm) {
      const searchableFields = columns.map((c) => c.field);
      const found = searchableFields.some((field) => {
        const val = item[field];
        return val && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!found) return false;
    }

    // Apply filters from FilterComponent
    for (const [filterField, filterValue] of Object.entries(filters)) {
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        const itemVal = item[filterField];
        if (typeof filterValue === 'boolean') {
          if (itemVal !== filterValue) return false;
        } else {
          // Use includes for partial matching (like the old implementation)
          if (!itemVal?.toString().toLowerCase().includes(filterValue.toString().toLowerCase())) {
            return false;
          }
        }
      }
    }
    return true;
  });

  // Columns to show based on visibility state
  const displayedColumns = columns.filter((col) => visibleColumns[col.field]);

  // Selection handlers
  const handleSelectAll = (event) => {
    onSelectAllClick && onSelectAllClick(event);
  };
  const handleSelectRow = (id) => {
    onSelectClick && onSelectClick(id);
  };

  // Render cell content (with formatters and different column types)
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

  // Default menu actions if none provided
  const defaultMenuItems = [
    {
    label: 'Assign User',  
    icon: <PersonAdd sx={{ mr: 2 }} />, 
    onClick: handleAssignUser,
    show: !!onAssignUser,  
    sx: { color: '#7c3aed' },  
  },
  
    {
     label: 'Claim Account',  
      icon: <Business sx={{ mr: 2 }} />, 
      onClick: handleClaimAccount,
      show: entityType === 'account' && !!onClaimAccount,  // Only show for accounts, this is not showin up
     sx: { color: '#f59e0b' },  
    },
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
   
  ];

  const allMenuItems = menuItems.length > 0 ? menuItems : defaultMenuItems;

  // Columns dialog save handler
  const handleColumnsSave = (newVisibleColumns) => {
    setVisibleColumns(newVisibleColumns);
    setColumnsDialogOpen(false);
  };

  return (
    <>
      {/* Search + Columns controls */}
      <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setFiltersExpanded(!filtersExpanded)}
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
          {Object.keys(filters).length > 0 && (
            <Chip
              label={Object.keys(filters).length}
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
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ minWidth: 250 }}
        />

        <Button variant="outlined" startIcon={<ColumnsIcon />} onClick={() => setColumnsDialogOpen(true)}>
          Columns
        </Button>
      </Box>

      {/* Collapsible FilterComponent */}
      {filtersExpanded && (
        <FilterDialog
          columns={columns}
          onApplyFilters={handleApplyFilters}
          deals={data}
        />
      )}

      {/* Table */}
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

      {/* Action Menu */}
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

      {/* Columns Dialog - kept as is */}
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