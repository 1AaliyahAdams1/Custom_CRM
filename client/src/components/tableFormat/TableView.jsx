import React, { useState } from "react";
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
  Tooltip,
  Link,
  TextField,
  Button,
} from "@mui/material";
import { MoreVert, Search as SearchIcon, FilterList as FilterIcon, ViewColumn as ColumnsIcon } from "@mui/icons-material";

import ColumnsDialog from "./ColumnsDialog";
import FiltersDialog from "./FiltersDialog";
import ActionMenu from "./ActionMenu";
import AssignUserDialog from "../AssignUserDialog"; 

const TableView = ({
  data = [],
  columns = [],
  idField = "id",
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
  onAssignUser,
  entityType = "records",
  menuItems = [],
  formatters = {},
  tooltips = {}, // Generic tooltips configuration
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [customFilteredData, setCustomFilteredData] = useState(null);

  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.field]: col.defaultVisible !== false }), {})
  );

  const isSelected = (id) => selected.includes(id);

  // --- Menu Handling ---
  const handleMenuClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Delay clearing menuRow to prevent flash of hidden buttons
    setTimeout(() => setMenuRow(null), 200); // matches MUI transition
  };

  // --- Enhanced Filters Handling ---
  const handleApplyFilters = (newFilters, preFilteredData = null) => {
    setFilters(newFilters);
    setCustomFilteredData(preFilteredData);
  };

  const handleSelectAll = (event) => onSelectAllClick && onSelectAllClick(event);
  const handleSelectRow = (id) => onSelectClick && onSelectClick(id);

  // --- Generic Tooltip Messages ---
  const getSearchTooltip = () => {
    return tooltips?.search || `Search ${entityType} by any visible field or keyword`;
  };

  const getFilterTooltip = () => {
    const activeFiltersCount = Object.keys(filters).length;
    const baseMessage = tooltips?.filter || `${filtersExpanded ? 'Hide' : 'Show'} advanced filtering options`;
    return activeFiltersCount > 0 
      ? `${baseMessage} (${activeFiltersCount} filter${activeFiltersCount === 1 ? '' : 's'} active)`
      : baseMessage;
  };

  const getColumnsTooltip = () => {
    return tooltips?.columns || 'Customize which columns are visible in the table';
  };

  const getActionsTooltip = () => {
    return tooltips?.actions || `Available actions for this ${entityType || 'record'}`;
  };

  // Use custom filtered data if available, otherwise apply standard filtering
  const getFilteredData = () => {
    let baseData = data;
    
    // If we have custom filtered data from FiltersDialog, use it as the base
    if (customFilteredData && Object.keys(filters).length > 0) {
      baseData = customFilteredData;
    }
    
    // Apply search term filtering on top of any existing filters
    if (!searchTerm) return baseData;
    
    return baseData.filter((item) => {
      return columns.some((c) => {
        const val = item[c.field];
        return val && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  };

  const filteredData = getFilteredData();

  const displayedColumns = columns.filter((col) => visibleColumns[col.field]);

  const renderCellContent = (row, column) => {
    const value = row[column.field];
    if (formatters[column.field]) return formatters[column.field](value, row);

    switch (column.type) {
      case "chip":
        return (
          <Chip
            label={column.chipLabels ? column.chipLabels[value] : value}
            size="small"
            sx={{
              backgroundColor: column.chipColors ? column.chipColors[value] : "#1976d2",
              color: "#fff",
              fontWeight: 500,
            }}
          />
        );
      case "boolean":
        return (
          <Chip
            label={value ? "Yes" : "No"}
            size="small"
            sx={{
              backgroundColor: value ? "#4caf50" : "#f44336",
              color: "#fff",
              fontWeight: 500,
            }}
          />
        );
      case "link":
        if (!value) return "-";
        const href = value.startsWith("http") ? value : `https://${value}`;
        return (
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            {value}
          </Link>
        );
      case "truncated":
        if (!value) return "-";
        return (
          <Tooltip title={value}>
            <span
              style={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: column.maxWidth || 200,
              }}
            >
              {value}
            </span>
          </Tooltip>
        );
      case "tooltip":
        return <Tooltip title={value || ""}>{value || "-"}</Tooltip>;
      default:
        return value || "-";
    }
  };

  const handleColumnsSave = (newVisibleColumns) => {
    setVisibleColumns(newVisibleColumns);
    setColumnsDialogOpen(false);
  };

  return (
    <>
      {/* Toolbar with Tooltips */}
      <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
        <Tooltip 
          title={getFilterTooltip()} 
          arrow
          enterDelay={300}
        >
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
            {filtersExpanded ? "Hide Filters" : "Show Filters"}
            {Object.keys(filters).length > 0 && (
              <Tooltip 
                title={`${Object.keys(filters).length} active filter${Object.keys(filters).length === 1 ? '' : 's'}`} 
                arrow
              >
                <Chip 
                  label={Object.keys(filters).length} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              </Tooltip>
            )}
          </Button>
        </Tooltip>

        <Tooltip 
          title={getSearchTooltip()} 
          arrow
          enterDelay={300}
        >
          <TextField
            size="small"
            variant="outlined"
            placeholder={`Search ${entityType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ 
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} /> 
            }}
            sx={{ 
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
        </Tooltip>

        <Tooltip 
          title={getColumnsTooltip()} 
          arrow
          enterDelay={300}
        >
          <Button
            variant="outlined"
            startIcon={<ColumnsIcon />}
            onClick={() => setColumnsDialogOpen(true)}
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
              }
            }}
          >
            Columns
          </Button>
        </Tooltip>
      </Box>
      

      {filtersExpanded && (
        <FiltersDialog
          columns={columns}
          onApplyFilters={handleApplyFilters}
          deals={data}
          currentFilters={filters}
        />
      )}

      {/* Table */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {showSelection && (
                <TableCell padding="checkbox">
                  <Tooltip title="Select all visible records" arrow>
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 && selected.length < filteredData.length
                      }
                      checked={
                        filteredData.length > 0 &&
                        selected.length === filteredData.length
                      }
                      onChange={handleSelectAll}
                    />
                  </Tooltip>
                </TableCell>
              )}
              {displayedColumns.map((column) => (
                <TableCell key={column.field} sx={{ fontWeight: 600 }}>
                  {column.headerName || column.field}
                </TableCell>
              ))}
              {showActions && (
                <TableCell sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              )}
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
                  onClick={
                    showSelection ? () => handleSelectRow(row[idField]) : undefined
                  }
                  sx={{ cursor: showSelection ? "pointer" : "default" }}
                >
                  {showSelection && (
                    <TableCell padding="checkbox">
                      <Tooltip title={`${isItemSelected ? 'Deselect' : 'Select'} this record`} arrow>
                        <Checkbox color="primary" checked={isItemSelected} />
                      </Tooltip>
                    </TableCell>
                  )}
                  {displayedColumns.map((column) => (
                    <TableCell key={column.field}>
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <Tooltip title={getActionsTooltip()} arrow>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuClick(e, row)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            }
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu with Enhanced Tooltips */}
      {menuRow && (
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
          onAssignUser={(row) => {
            setCurrentRow(row);
            setAssignDialogOpen(true);
          }}
          menuItems={menuItems}
          tooltips={tooltips} // Pass tooltips to ActionMenu
        />
      )}

      {/* Columns Dialog */}
      <ColumnsDialog
        open={columnsDialogOpen}
        visibleColumns={visibleColumns}
        onClose={() => setColumnsDialogOpen(false)}
        onSave={handleColumnsSave}
        columns={columns}
      />

      {/* Assign User Dialog */}
      <AssignUserDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        menuRow={currentRow}
        onAssign={onAssignUser}
      />
    </>
  );
};

export default TableView;