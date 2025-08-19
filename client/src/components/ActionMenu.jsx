import React from 'react';
import {
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Info,
  Edit,
  Delete,
  Note,
  AttachFile,
  Business,
  PersonAdd,
} from '@mui/icons-material';

const ActionMenu = ({
  anchorEl,
  open,
  onClose,
  menuRow,
  idField = 'id',
  entityType,
  onView,
  onEdit,
  onDelete,
  onAddNote,
  onAddAttachment,
  onClaimAccount,
  onAssignUser,
  menuItems = [],
}) => {
  // Get current user role - Fixed to handle localStorage errors gracefully
  const getCurrentUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.roles || [];
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  };

  // Check if user has specific role
  const hasRole = (roleToCheck) => {
    const userRoles = getCurrentUserRole();
    return Array.isArray(userRoles) ? userRoles.includes(roleToCheck) : false;
  };

  // Action handlers
  const handleView = () => {
    if (onView && menuRow) onView(menuRow);  
    onClose();
  };


  const handleAssignUser = () => {
    if (onAssignUser && menuRow) onAssignUser(menuRow);
    onClose();
  };

  const handleEdit = () => {
    if (onEdit && menuRow) onEdit(menuRow);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && menuRow) onDelete(menuRow[idField]);
    onClose();
  };

  const handleAddNote = () => {
    if (onAddNote && menuRow) onAddNote(menuRow);
    onClose();
  };

  const handleAddAttachment = () => {
    if (onAddAttachment && menuRow) onAddAttachment(menuRow);
    onClose();
  };

  const handleClaimAccount = () => {
    if (onClaimAccount && menuRow) onClaimAccount(menuRow);
    onClose();
  };

  // Default menu actions with role-based visibility
  const defaultMenuItems = [
    {
      label: 'Assign User',
      icon: <PersonAdd sx={{ mr: 2 }} />,
      onClick: handleAssignUser,
      show: entityType === 'account' && !!onAssignUser && hasRole('C-level'),
      sx: { color: '#7c3aed' },
    },
    {
      label: 'Claim Account',
      icon: <Business sx={{ mr: 2 }} />,
      onClick: handleClaimAccount,
      show: entityType === 'account' && !!onClaimAccount && hasRole('Sales Representative'),
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
    }
  ];

  const allMenuItems = menuItems.length > 0 ? menuItems : defaultMenuItems;

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
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
  );
};

export default ActionMenu;