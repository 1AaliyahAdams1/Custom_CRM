import React, { useMemo } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Info, Edit, Delete, Note, AttachFile, Business, PersonAdd } from '@mui/icons-material';

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
  // Get current user roles once
  const roles = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return Array.isArray(user.roles) ? user.roles : [];
    } catch {
      return [];
    }
  }, []);

  const hasRole = (role) => roles.includes(role);

  const handleClick = (callback) => {
    if (callback && menuRow) callback(menuRow);
    onClose();
  };

  // Determine visible items
  const visibleItems = useMemo(() => {
    const defaultItems = [
      {
        label: 'Assign User',
        icon: <PersonAdd sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onAssignUser),
        show: entityType === 'account' && !!onAssignUser && hasRole('C-level'),
      },
      {
        label: 'Claim Account',
        icon: <Business sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onClaimAccount),
        show:
          entityType === 'account' &&
          !!onClaimAccount &&
          hasRole('Sales Representative') &&
          menuRow?.ownerStatus !== 'owned',
      },
      {
        label: 'View Details',
        icon: <Info sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onView),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <Edit sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onEdit),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <Note sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onAddNote),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFile sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onAddAttachment),
        show: !!onAddAttachment,
      },
      {
        label: 'Delete',
        icon: <Delete sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(() => onDelete(menuRow[idField])),
        show: !!onDelete,
        disabled: (menuRow) => menuRow?.Active === false,
      },
    ];

    const itemsToUse = menuItems.length > 0 ? menuItems : defaultItems;

    return itemsToUse.filter((item) => item.show !== false);
  }, [
    entityType,
    menuRow,
    onView,
    onEdit,
    onDelete,
    onAddNote,
    onAddAttachment,
    onClaimAccount,
    onAssignUser,
    menuItems,
    hasRole,
    idField,
  ]);

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {visibleItems.map((item, idx) => (
        <MenuItem
          key={idx}
          onClick={item.onClick}
          disabled={typeof item.disabled === 'function' ? item.disabled(menuRow) : item.disabled}
          sx={{ ...item.sx }}
        >
          {item.icon}
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ActionMenu;
