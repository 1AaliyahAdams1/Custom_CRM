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

  // Search handler
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  // Filter handlers
  const handleToggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Column handlers
  const handleOpenColumnsDialog = () => {
    setColumnsDialogOpen(true);
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
          if (itemVal?.toString() !== filterValue.toString()) return false;
        }
      }
    }
    return true;
  });

  // Columns to show based on visibility state
  const displayedColumns = columns.filter((col) => visibleColumns[col.field]);

  return (
    <>
      {/* Search + Filter + Columns controls */}
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

        <Button variant="outlined" startIcon={<ColumnsIcon />} onClick={() => setColumnsDialogOpen(true)}>
          Columns
        </Button>
      </Box>

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

      {/* Dialogs */}
      <FiltersDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        onSave={setFilters}
        columns={columns}
        data={data}
        currentFilters={filters}
      />

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