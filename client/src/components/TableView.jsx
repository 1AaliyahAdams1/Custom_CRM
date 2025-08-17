import React, { useState } from 'react';
import { Box } from '@mui/material';

// Import components
import TableControls from './TableControls';
import DataTable from './DataTable';
import ActionMenu from './ActionMenu';
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
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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

  const handleColumnsSave = (newVisibleColumns) => {
    setVisibleColumns(newVisibleColumns);
    setColumnsDialogOpen(false);
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
          // Use includes for partial matching
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

  return (
    <>
      {/* Search + Controls */}
      <TableControls
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filtersExpanded={filtersExpanded}
        onToggleFilters={handleToggleFilters}
        onOpenColumnsDialog={handleOpenColumnsDialog}
        activeFiltersCount={Object.keys(filters).length}
      />

      {/* Collapsible Filter Dialog */}
      {filtersExpanded && (
        <FilterDialog
          columns={columns}
          onApplyFilters={handleApplyFilters}
          deals={data}
        />
      )}

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={displayedColumns}
        idField={idField}
        selected={selected}
        onSelectClick={onSelectClick}
        onSelectAllClick={onSelectAllClick}
        showSelection={showSelection}
        showActions={showActions}
        onMenuClick={handleMenuClick}
        formatters={formatters}
      />

      {/* Action Menu */}
      <ActionMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        menuRow={menuRow}
        idField={idField}
        entityType={entityType}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddNote={onAddNote}
        onAddAttachment={onAddAttachment}
        onClaimAccount={onClaimAccount}
        onAssignUser={onAssignUser}
        menuItems={menuItems}
      />

      {/* Columns Dialog */}
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