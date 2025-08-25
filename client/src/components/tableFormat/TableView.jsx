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
  entityType,
  menuItems = [],
  formatters = {},
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);

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

  // --- Filters & Selection ---
  const handleApplyFilters = (newFilters) => setFilters(newFilters);
  const handleSelectAll = (event) => onSelectAllClick && onSelectAllClick(event);
  const handleSelectRow = (id) => onSelectClick && onSelectClick(id);

  const filteredData = data.filter((item) => {
    if (searchTerm) {
      const found = columns.some((c) => {
        const val = item[c.field];
        return val && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!found) return false;
    }
    for (const [field, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== "") {
        const itemVal = item[field];
        if (typeof value === "boolean") {
          if (itemVal !== value) return false;
        } else {
          if (!itemVal?.toString().toLowerCase().includes(value.toString().toLowerCase())) return false;
        }
      }
    }
    return true;
  });

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
      {/* Toolbar */}
      <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          {filtersExpanded ? "Hide Filters" : "Show Filters"}
          {Object.keys(filters).length > 0 && (
            <Chip label={Object.keys(filters).length} size="small" sx={{ ml: 1 }} />
          )}
        </Button>

        <TextField
          size="small"
          variant="outlined"
          placeholder="Search..."
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
                    indeterminate={
                      selected.length > 0 && selected.length < filteredData.length
                    }
                    checked={
                      filteredData.length > 0 &&
                      selected.length === filteredData.length
                    }
                    onChange={handleSelectAll}
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
                  onClick={
                    showSelection ? () => handleSelectRow(row[idField]) : undefined
                  }
                  sx={{ cursor: showSelection ? "pointer" : "default" }}
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
      {menuRow && ( // Only render menu if there is a row
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
