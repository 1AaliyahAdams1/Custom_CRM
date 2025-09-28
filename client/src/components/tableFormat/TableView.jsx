import React, { useState, useCallback } from "react";
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
  TableSortLabel,
} from "@mui/material";
import { 
  MoreVert, 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  ViewColumn as ColumnsIcon,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

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
  onUnclaimAccount, // New prop
  onAssignUser,
  onUnassignUser, // New prop
  onReactivate, // New prop
  onPermanentDelete, // New prop
  entityType = "records",
  menuItems = [],
  formatters = {},
  tooltips = {},
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

  // Sorting state
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");

  // Column widths state for resizable columns
  const [columnWidths, setColumnWidths] = useState({});

  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.field]: col.defaultVisible !== false }), {})
  );

  const isSelected = (id) => selected.includes(id);

  // --- Sorting Functions ---
  const handleSort = (columnField) => {
    const isAsc = orderBy === columnField && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnField);
  };

  const sortData = (data) => {
    if (!orderBy) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      
      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return order === "asc" ? 1 : -1;
      if (bVal == null) return order === "asc" ? -1 : 1;
      
      // Handle different data types
      if (typeof aVal === "string" && typeof bVal === "string") {
        const result = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return order === "asc" ? result : -result;
      }
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      // Handle dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      // Fallback to string comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      const result = aStr.localeCompare(bStr);
      return order === "asc" ? result : -result;
    });
  };

  // --- Column Resizing Functions ---
  const handleMouseDown = useCallback((e, columnField) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnField] || 150; // Default width
    
    const handleMouseMove = (moveEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff); // Minimum width of 80px
      setColumnWidths(prev => ({
        ...prev,
        [columnField]: newWidth
      }));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [columnWidths]);

  // --- Menu Handling ---
  const handleMenuClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setTimeout(() => setMenuRow(null), 200);
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

  // --- Data Filtering and Sorting ---
  const getFilteredData = () => {
    let filteredData;
    
    // Use custom filtered data if available (from advanced filters)
    if (customFilteredData) {
      if (!searchTerm) {
        filteredData = customFilteredData;
      } else {
        filteredData = customFilteredData.filter((item) => {
          return columns.some((col) => {
            const val = item[col.field];
            return val && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
          });
        });
      }
    } else {
      // Standard filtering based on search term and basic filters
      filteredData = data.filter((item) => {
        // Apply search term filter
        if (searchTerm) {
          const matchesSearch = columns.some((col) => {
            const val = item[col.field];
            return val && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
          });
          if (!matchesSearch) return false;
        }

        // Apply other filters
        return Object.entries(filters).every(([field, filterValue]) => {
          if (!filterValue || filterValue === '') return true;
          const itemValue = item[field];
          
          // Handle array filters (for multi-select)
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue);
          }
          
          // Handle string filters
          if (typeof filterValue === 'string') {
            return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
          }
          
          return itemValue === filterValue;
        });
      });
    }
    
    // Apply sorting
    return sortData(filteredData);
  };

  const filteredData = getFilteredData();
  const displayedColumns = columns.filter((col) => visibleColumns[col.field]);

  // --- Handle clickable cell content ---
  const handleCellClick = (event, row, column) => {
    if (column.type === 'clickable' && column.onClick) {
      event.stopPropagation();
      column.onClick(row);
    }
  };

  const renderCellContent = (row, column) => {
    const value = row[column.field];
    if (formatters[column.field]) return formatters[column.field](value, row);

    switch (column.type) {
      case "clickable":
        return (
          <Box
            component="span"
            onClick={(e) => {
              e.stopPropagation();
              if (column.onClick) {
                column.onClick(row);
              }
            }}
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
              ...column.clickableStyle,
            }}
          >
            {value || "-"}
          </Box>
        );
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
          <Tooltip title={<span>{value}</span>}>
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
        return (
          <Tooltip title={<span>{value || ""}</span>}>
            <span>{value || "-"}</span>
          </Tooltip>
        );
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
          title={<span>{getFilterTooltip()}</span>} 
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
                title={<span>{`${Object.keys(filters).length} active filter${Object.keys(filters).length === 1 ? '' : 's'}`}</span>} 
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
          title={<span>{getSearchTooltip()}</span>} 
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
          title={<span>{getColumnsTooltip()}</span>} 
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

      {/* Table with Sortable & Resizable Headers */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {showSelection && (
                <TableCell 
                  padding="checkbox"
                  sx={{ 
                    width: 50,
                    position: 'relative'
                  }}
                >
                  <Tooltip title={<span>Select all visible records</span>} arrow>
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
              {displayedColumns.map((column, index) => (
                <TableCell 
                  key={column.field} 
                  sx={{ 
                    fontWeight: 600,
                    width: columnWidths[column.field] || 'auto',
                    minWidth: 80,
                    position: 'relative',
                    userSelect: 'none',
                    '&:hover .resize-handle': {
                      opacity: 1,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {column.sortable !== false ? (
                      <Tooltip 
                        title={
                          <span>
                            {orderBy === column.field 
                              ? `Currently sorted ${order === 'asc' ? 'ascending' : 'descending'}. Click to sort ${order === 'asc' ? 'descending' : 'ascending'}.`
                              : `Click to sort by ${column.headerName || column.field}`
                            }
                          </span>
                        }
                        arrow
                        enterDelay={500}
                      >
                        <TableSortLabel
                          active={orderBy === column.field}
                          direction={orderBy === column.field ? order : 'asc'}
                          onClick={() => handleSort(column.field)}
                          sx={{ 
                            flex: 1,
                            '&:hover': {
                              color: 'primary.main',
                            },
                            '&.Mui-active': {
                              color: 'primary.main',
                              '& .MuiTableSortLabel-icon': {
                                color: 'primary.main !important',
                              },
                            },
                          }}
                        >
                          {column.headerName || column.field}
                        </TableSortLabel>
                      </Tooltip>
                    ) : (
                      <Tooltip 
                        title={<span>This column is not sortable</span>}
                        arrow
                        enterDelay={700}
                      >
                        <Box sx={{ flex: 1 }}>
                          {column.headerName || column.field}
                        </Box>
                      </Tooltip>
                    )}
                    
                    {/* Resize Handle */}
                    {index < displayedColumns.length - 1 && (
                      <Tooltip 
                        title={<span>Drag to resize column width</span>} 
                        arrow 
                        enterDelay={700}
                        placement="top"
                      >
                        <Box
                          className="resize-handle"
                          onMouseDown={(e) => handleMouseDown(e, column.field)}
                          sx={{
                            width: 4,
                            height: 30,
                            cursor: 'col-resize',
                            backgroundColor: 'divider',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            borderRadius: 1,
                            ml: 1,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              opacity: '1 !important',
                            }
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              ))}
              {showActions && (
                <TableCell 
                  sx={{ 
                    fontWeight: 600,
                    width: 80,
                  }}
                >
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
                      <Tooltip title={<span>{`${isItemSelected ? 'Deselect' : 'Select'} this record`}</span>} arrow>
                        <Checkbox color="primary" checked={isItemSelected} />
                      </Tooltip>
                    </TableCell>
                  )}
                  {displayedColumns.map((column) => (
                    <TableCell 
                      key={column.field}
                      sx={{
                        width: columnWidths[column.field] || 'auto',
                        maxWidth: columnWidths[column.field] || 'none',
                        overflow: 'hidden',
                      }}
                    >
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <Tooltip title={<span>{getActionsTooltip()}</span>} arrow>
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
          onUnclaimAccount={onUnclaimAccount}
          onAssignUser={(row) => {
            setCurrentRow(row);
            setAssignDialogOpen(true);
          }}
          onUnassignUser={onUnassignUser}
          onReactivate={onReactivate}
          onPermanentDelete={onPermanentDelete}
          menuItems={menuItems}
          tooltips={tooltips}
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