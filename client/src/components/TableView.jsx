import React, { useState } from 'react';
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
  Menu,
  MenuItem,
  Tooltip,
  Link,
} from '@mui/material';
import { 
  MoreVert,
   Info, 
   Edit, 
   Delete,
   Note, 
  AttachFile, 
  Visibility  } from '@mui/icons-material';

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleMenuClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuRowId(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const handleView = () => {
    if (onView && menuRowId) {
      onView(menuRowId[idField]);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (onEdit && menuRowId) {
      onEdit(menuRowId);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDelete && menuRowId) {
      onDelete(menuRowId[idField]);
    }
    handleMenuClose();
  };
  const handleAddNote = () => {
    if (onAddNote && menuRowId) {
      onAddNote(menuRowId);
    }
    handleMenuClose();
  };

  const handleAddAttachment = () => {
    if (onAddAttachment && menuRowId) {
      onAddAttachment(menuRowId);
    }
    handleMenuClose();
  };

  const renderCellContent = (row, column) => {
    const value = row[column.field];
    
    // Apply custom formatter if provided
    if (formatters[column.field]) {
      return formatters[column.field](value, row);
    }

    // Handle different column types
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
            onClick={e => e.stopPropagation()}
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            {value}
          </Link>
        );
      
      case 'truncated':
        if (!value) return '-';
        return (
          <Tooltip title={value}>
            <span style={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: column.maxWidth || 200,
            }}>
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
      label: 'Delete',
      icon: <Delete sx={{ mr: 2 }} />,
      onClick: handleDelete,
      show: !!onDelete,
      sx: { color: '#dc2626' },
      disabled: (row) => row?.Active === false, // Can be customized per table
    },
    {
      label: 'Add Notes',
      icon: <Note sx={{ mr: 2 }} />,
      onClick: handleAddNote,
      show: !!onAddNote,
      sx: { color: '#2563eb' }, // Blue color for notes
    },
    {
      label: 'Add Attachments',
      icon: <AttachFile sx={{ mr: 2 }} />,
      onClick: handleAddAttachment,
      show: !!onAddAttachment,
      sx: { color: '#059669' }, // Green color for attachments
    },
  ];

  const allMenuItems = menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <>
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
                    onChange={onSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.field} sx={{ fontWeight: 600 }}>
                  {column.headerName || column.field}
                </TableCell>
              ))}
              {showActions && (
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              )}
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
                  onClick={showSelection ? () => onSelectClick(row[idField]) : undefined}
                  sx={{ cursor: showSelection ? 'pointer' : 'default' }}
                >
                  {showSelection && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, row)}
                      >
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {allMenuItems
          .filter(item => item.show !== false)
          .map((item, index) => (
            <MenuItem
              key={index}
              onClick={item.onClick}
              disabled={typeof item.disabled === 'function' ? item.disabled(menuRowId) : item.disabled}
              sx={item.sx}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default TableView;