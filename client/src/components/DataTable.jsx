//This component is for the styling of the table/grid
import React from 'react';
import {
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
} from '@mui/material';
import {
  MoreVert,
} from '@mui/icons-material';

const DataTable = ({
  data = [],
  columns = [],
  idField = 'id',
  selected = [],
  onSelectClick,
  onSelectAllClick,
  showSelection = false,
  showActions = true,
  onMenuClick,
  formatters = {},
}) => {
  // Helpers
  const isSelected = (id) => selected.includes(id);

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

  return (
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {showSelection && (
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < data.length}
                  checked={data.length > 0 && selected.length === data.length}
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'select all rows' }}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell key={column.field} sx={{ fontWeight: 600 }}>
                {column.headerName || column.field}
              </TableCell>
            ))}
            {showActions && <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row) => {
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
                {columns.map((column) => (
                  <TableCell key={column.field}>{renderCellContent(row, column)}</TableCell>
                ))}
                {showActions && (
                  <TableCell>
                    <IconButton size="small" onClick={(e) => onMenuClick(e, row)}>
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
  );
};

export default DataTable;