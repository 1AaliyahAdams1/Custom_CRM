import React, { useMemo } from 'react';
import { Menu, MenuItem, Tooltip } from '@mui/material';
import { 
  Info, 
  Edit, 
  Delete, 
  Note, 
  AttachFile, 
  Business, 
  PersonAdd, 
  PersonRemove, 
  RestoreFromTrash, 
  DeleteForever, 
  Block,
  PersonOff,
  Timeline
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
  onUnclaimAccount,
  onAssignUser,
  onUnassignUsers, 
  onAssignSequence,
  onReactivate,
  onPermanentDelete,
  menuItems = [],
  tooltips = {},
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
  const isCLevel = hasRole('C-level');

  const handleClick = (callback) => {
    if (callback && menuRow) callback(menuRow);
    onClose();
  };

  // Generic tooltip messages that work for any entity type
  const getTooltip = (action, defaultMessage) => {
    return tooltips?.actionMenu?.[action] || defaultMessage;
  };

  

  // Check if account has assigned users
  const hasAssignedUsers = useMemo(() => {
    if (!menuRow) return false;
    
    // Check if AssignedEmployeeIDs exists and is not empty
    const assignedIds = menuRow.AssignedEmployeeIDs;
    if (!assignedIds) return false;
    
    // Handle string (comma-separated) or array
    if (typeof assignedIds === 'string') {
      return assignedIds.trim().length > 0;
    }
    if (Array.isArray(assignedIds)) {
      return assignedIds.length > 0;
    }
    
    return false;
  }, [menuRow]);

  // Determine visible items with generic tooltips
  const visibleItems = useMemo(() => {
    const defaultItems = [
      // View Details
      {
        label: "View Details",
        icon: <Info sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onView),
        show: !!onView,
        tooltip: getTooltip("view", "View detailed information for this record"),
      },
      
      // Edit
      {
        label: "Edit",
        icon: <Edit sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onEdit),
        show: !!onEdit && menuRow?.Active !== false,
        tooltip: getTooltip("edit", "Edit this record's information"),
      },
      
      // Claim Account (for Sales Reps on unowned accounts)
      {
        label: 'Claim Account',
        icon: <Business sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onClaimAccount),
        show: entityType === 'account' && 
              !!onClaimAccount && 
              hasRole('Sales Representative') && 
              (menuRow?.ownerStatus === 'unowned' || menuRow?.ownerStatus === 'n/a'),
        tooltip: getTooltip('claimAccount', 'Claim ownership of this account'),
      },

      {
        label: 'Assign Sequence',
        icon: <Timeline sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onAssignSequence),
        show: !!onAssignSequence && 
              entityType === 'account' && 
              menuRow?.Active !== false && 
              (menuRow?.ownerStatus === "owned" || 
              menuRow?.ownerStatus === "owned-shared"),
      tooltip: getTooltip('assignSequence', 'Assign a sequence and automatically create activities'),
      },
      
      // Unclaim Account (for users to remove themselves)
      {
        label: 'Unclaim Account',
        icon: <PersonOff sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onUnclaimAccount),
        show: entityType === 'account' && 
              !!onUnclaimAccount && 
              menuRow?.ownerStatus === 'owned',
        tooltip: getTooltip('unclaimAccount', 'Remove yourself from this account'),
      },
      
      // Assign User (for C-level to assign someone)
      {
        label: "Assign User",
        icon: <PersonAdd sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onAssignUser),
        show: entityType === 'account' && 
              !!onAssignUser && 
              isCLevel,
        tooltip: getTooltip('assignUser', 'Assign a team member to this account'),
      },
      
      // Unassign Users (for C-level to selectively remove users)
      {
        label: 'Unassign Users',
        icon: <PersonRemove sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onUnassignUsers),
        show: (() => {
          // Detailed debugging
          console.log("=== UNASSIGN USERS DEBUG ===");
          console.log("entityType:", entityType);
          console.log("entityType === 'account':", entityType === 'account');
          console.log("onUnassignUsers exists:", !!onUnassignUsers);
          console.log("isCLevel:", isCLevel);
          console.log("hasAssignedUsers:", hasAssignedUsers);
          console.log("All roles:", roles);
          
          const shouldShow = entityType === 'account' && 
                            !!onUnassignUsers && 
                            isCLevel && 
                            hasAssignedUsers;
          console.log("Should show Unassign Users:", shouldShow);
          console.log("========================");
          return shouldShow;
        })(),
        tooltip: getTooltip('unassignUsers', 'Select specific users to unassign from this account'),
      },
      
      // Add Notes
      {
        label: "Add Notes",
        icon: <Note sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onAddNote),
        show: !!onAddNote,
        tooltip: getTooltip("addNote", "Add internal notes or comments"),
      },
      
      // Add Attachments
      {
        label: "Add Attachments",
        icon: <AttachFile sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onAddAttachment),
        show: !!onAddAttachment,
        tooltip: getTooltip("addAttachment", "Attach files or documents"),
      },
      
      // Reactivate (only show for inactive records)
      {
        label: 'Reactivate',
        icon: <RestoreFromTrash sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onReactivate),
        show: !!onReactivate && (menuRow?.Active === false || menuRow?.Active === 0),
        tooltip: getTooltip('reactivate', 'Reactivate this record'),
      },

      // Deactivate (only show for active records)
      {
        label: 'Deactivate',
        icon: <Block sx={{ mr: 1, color: '#000' }} />,
        onClick: () => handleClick(onDelete),
        show: !!onDelete && (menuRow?.Active === true || menuRow?.Active === 1),
        tooltip: getTooltip('delete', 'Deactivate this record'),
      },
      
      // Permanent Delete (optional - uncomment if needed)
      // {
      //   label: 'Delete Permanently',
      //   icon: <DeleteForever sx={{ mr: 1, color: '#d32f2f' }} />,
      //   onClick: () => handleClick(onPermanentDelete),
      //   show: !!onPermanentDelete && menuRow?.Active === false,
      //   tooltip: getTooltip('permanentDelete', 'Permanently delete this record (cannot be undone)'),
      // },
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
    onUnassignUsers,
    onAssignSequence,
    onReactivate,
    onPermanentDelete,
    menuItems,
    idField,
    tooltips,
    roles,
    hasAssignedUsers, 
  ]);

  console.log("Visible items count:", visibleItems.length);
  console.log("Visible items:", visibleItems.map(item => item.label));

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