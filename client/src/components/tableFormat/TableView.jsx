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
} from "@mui/icons-material";

import ColumnsDialog from "../dialogs/ColumnsDialog";
import FiltersDialog from "../dialogs/FiltersDialog";
import ActionMenu from "./ActionMenu";
import AssignUserDialog from "../../components/dialogs/AssignUserDialog"; 

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
  onUnclaimAccount,
  onAssignUser,
  onUnassignUser,
  onReactivate,
  onPermanentDelete,
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

  // Sorting
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");

  // Column widths
  const [columnWidths, setColumnWidths] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.field]: col.defaultVisible !== false }), {})
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const isSelected = (id) => selected.includes(id);

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
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return order === "asc" ? 1 : -1;
      if (bVal == null) return order === "asc" ? -1 : 1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc"
          ? aVal.toLowerCase().localeCompare(bVal.toLowerCase())
          : bVal.toLowerCase().localeCompare(aVal.toLowerCase());
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      return order === "asc"
        ? String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase())
        : String(bVal).toLowerCase().localeCompare(String(aVal).toLowerCase());
    });
  };

  // Column resizing
  const handleMouseDown = useCallback((e, columnField) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnField] || 150;
    const handleMouseMove = (moveEvent) => {
      const diff = moveEvent.clientX - startX;
      setColumnWidths(prev => ({
        ...prev,
        [columnField]: Math.max(80, startWidth + diff)
      }));
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [columnWidths]);

  // Menu
  const handleMenuClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setTimeout(() => setMenuRow(null), 200);
  };

  // Filters
  const handleApplyFilters = (newFilters, preFilteredData = null) => {
    setFilters(newFilters);
    setCustomFilteredData(preFilteredData);
  };

  const handleSelectAll = (event) => onSelectAllClick && onSelectAllClick(event);
  const handleSelectRow = (id) => onSelectClick && onSelectClick(id);

  const getFilteredData = () => {
    let filteredData;
    if (customFilteredData) {
      filteredData = searchTerm
        ? customFilteredData.filter(item =>
            columns.some(col => item[col.field]?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : customFilteredData;
    } else {
      filteredData = data.filter(item => {
        if (searchTerm && !columns.some(col => item[col.field]?.toString().toLowerCase().includes(searchTerm.toLowerCase()))) {
          return false;
        }
        return Object.entries(filters).every(([field, filterValue]) => {
          if (!filterValue) return true;
          const itemValue = item[field];
          if (Array.isArray(filterValue)) return filterValue.includes(itemValue);
          if (typeof filterValue === "string") return itemValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
          return itemValue === filterValue;
        });
      });
    }
    return sortData(filteredData);
  };

  const filteredData = getFilteredData();
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const displayedColumns = columns.filter(col => visibleColumns[col.field]);

  const handleCellClick = (event, row, column) => {
    if (column.type === "clickable" && column.onClick) {
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
            onClick={(e) => handleCellClick(e, row, column)}
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {value || "-"}
          </Box>
        );
      case "chip":
        return (
          <Chip
            label={column.chipLabels?.[value] || value}
            size="small"
            sx={{
              backgroundColor: column.chipColors?.[value] || "#1976d2",
              color: "#fff",
              fontWeight: 500,
            }}
          />
        );
      case "link":
        if (!value) return "-";
        const href = value.startsWith("http") ? value : `https://${value}`;
        return (
          <Link href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            {value}
          </Link>
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
      {/* Toolbar */}
      <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
        <Tooltip title={`Filters`} arrow>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            {filtersExpanded ? "Hide Filters" : "Show Filters"}
          </Button>
        </Tooltip>
        <TextField
          size="small"
          variant="outlined"
          placeholder={`Search ${entityType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
          sx={{ minWidth: 250 }}
        />
        <Button
          variant="outlined"
          startIcon={<ColumnsIcon />}
          onClick={() => setColumnsDialogOpen(true)}
        >
          Columns
        </Button>
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
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < filteredData.length}
                    checked={filteredData.length > 0 && selected.length === filteredData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {displayedColumns.map((column, index) => (
                <TableCell key={column.field}>
                  <TableSortLabel
                    active={orderBy === column.field}
                    direction={orderBy === column.field ? order : 'asc'}
                    onClick={() => handleSort(column.field)}
                  >
                    {column.headerName || column.field}
                  </TableSortLabel>
                </TableCell>
              ))}
              {showActions && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row) => {
              const isItemSelected = showSelection ? isSelected(row[idField]) : false;
              return (
                <TableRow
                  key={row[idField]}
                  hover
                  selected={isItemSelected}
                  onClick={showSelection ? () => handleSelectRow(row[idField]) : undefined}
                >
                  {showSelection && (
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} />
                    </TableCell>
                  )}
                  {displayedColumns.map((column) => (
                    <TableCell key={column.field}>
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuClick(e, row)}>
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

      {/* Pagination */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={1} gap={2}>
        <Button
          size="small"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </Button>
        <Box>Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage)}</Box>
        <Button
          size="small"
          disabled={currentPage >= Math.ceil(filteredData.length / rowsPerPage)}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </Button>
      </Box>

      {/* Action Menu */}
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
          onAssignUser={(row) => { setCurrentRow(row); setAssignDialogOpen(true); }}
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
