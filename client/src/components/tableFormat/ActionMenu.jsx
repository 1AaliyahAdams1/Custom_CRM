import React, { useMemo } from 'react';
import { Menu, MenuItem, Tooltip } from '@mui/material';
import { Info, Edit, Delete, Note, AttachFile, Business, PersonAdd, PersonRemove, RestoreFromTrash, DeleteForever, Block } from '@mui/icons-material';

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
  onUnclaimAccount,
  onAssignUser,
  onUnassignUser,
  onReactivate,
  onPermanentDelete,
  menuItems = [],
  tooltips = {}, // Generic tooltips passed from parent
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

  // Generic tooltip messages that work for any entity type
  const getTooltip = (action, defaultMessage) => {
    return tooltips?.actionMenu?.[action] || defaultMessage;
  };

  // Determine visible items with generic tooltips
  const visibleItems = useMemo(() => {
    const defaultItems = [
      {
        label: 'Assign User',
        icon: <PersonAdd sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onAssignUser),
        show: entityType === 'account' && 
              !!onAssignUser && 
              hasRole('C-level') && 
              (!menuRow?.assignedUserId || menuRow?.assignedUserId === null),
        tooltip: getTooltip('assignUser', 'Assign a team member to this record'),
      },
      {
        label: 'Unassign User',
        icon: <PersonRemove sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onUnassignUser),
        show: entityType === 'account' && 
              !!onUnassignUser && 
              hasRole('C-level') && 
              (menuRow?.assignedUserId && menuRow?.assignedUserId !== null),
        tooltip: getTooltip('unassignUser', 'Remove assigned user from this record'),
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
        tooltip: getTooltip('claimAccount', 'Claim ownership of this record'),
      },
      {
        label: 'Unclaim Account',
        icon: <Business sx={{ mr: 1, color: '#666' }} />,
        onClick: () => handleClick(onUnclaimAccount),
        show:
          entityType === 'account' &&
          !!onUnclaimAccount &&
          hasRole('Sales Representative') &&
          menuRow?.ownerStatus === 'owned',
        tooltip: getTooltip('unclaimAccount', 'Release ownership of this record'),
      },
      {
        label: 'View Details',
        icon: <Info sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onView),
        show: !!onView,
        tooltip: getTooltip('view', 'View detailed information for this record'),
      },
      {
        label: 'Edit',
        icon: <Edit sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onEdit),
        show: !!onEdit,
        tooltip: getTooltip('edit', 'Edit this record\'s information'),
      },
      {
        label: 'Add Notes',
        icon: <Note sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onAddNote),
        show: !!onAddNote,
        tooltip: getTooltip('addNote', 'Add internal notes or comments'),
      },
      {
        label: 'Add Attachments',
        icon: <AttachFile sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onAddAttachment),
        show: !!onAddAttachment,
        tooltip: getTooltip('addAttachment', 'Attach files or documents'),
      },
      {
        label: 'Reactivate',
        icon: <RestoreFromTrash sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(() => onReactivate(menuRow[idField])),
        show: !!onReactivate && menuRow?.Active === false,
        tooltip: getTooltip('reactivate', 'Reactivate this record'),
      },
      {
        label: 'Deactivate',
        icon: <Block sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(() => onDelete(menuRow[idField])),
        show: !!onDelete && menuRow?.Active !== false,
        tooltip: getTooltip('delete', 'Deactivate this record'),
      },
      {
        label: 'Delete Permanently',
        icon: <DeleteForever sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(() => onPermanentDelete(menuRow[idField])),
        show: !!onPermanentDelete && menuRow?.Active === false,
        tooltip: getTooltip('permanentDelete', 'Permanently delete this record (cannot be undone)'),
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
    onUnclaimAccount,
    onAssignUser,
    onUnassignUser,
    onReactivate,
    onPermanentDelete,
    menuItems,
    hasRole,
    idField,
    tooltips,
  ]);

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {visibleItems.map((item, idx) => (
        <Tooltip 
          key={idx} 
          title={item.tooltip} 
          placement="left" 
          arrow
          enterDelay={500}
        >
          <span>
            <MenuItem
              onClick={item.onClick}
              disabled={typeof item.disabled === 'function' ? item.disabled(menuRow) : item.disabled}
              sx={{ ...item.sx }}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          </span>
        </Tooltip>
      ))}
    </Menu>
  );
};

export default ActionMenu;