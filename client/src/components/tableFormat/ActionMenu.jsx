import React, { useMemo } from 'react';
import { Menu, MenuItem, Tooltip } from '@mui/material';
import { Info, Edit, Delete, Note, AttachFile, Business, PersonAdd } from '@mui/icons-material';
import { ROUTE_ACCESS } from "../../utils/auth/routesAccess";


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

  const hasAccess = (routeKey) => {
    if (!ROUTE_ACCESS[routeKey]) return false;
    return roles.some((role) => ROUTE_ACCESS[routeKey].includes(role));
  };


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
        label: "Assign User",
        icon: <PersonAdd sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onAssignUser),
        show: entityType === "account" && !!onAssignUser && hasAccess("accountAssign"),
        tooltip: getTooltip("assignUser", "Assign a team member to this record"),
      },
      {
        label: "Claim Account",
        icon: <Business sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onClaimAccount),
        show:
          entityType === "account" &&
          !!onClaimAccount &&
          hasAccess("accountClaim") &&
          menuRow?.ownerStatus !== "owned",
        tooltip: getTooltip("claimAccount", "Claim ownership of this record"),
      },
      {
        label: "Unclaim Account",
        icon: <Business sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onUnclaimAccount),
        show:
          entityType === "account" &&
          !!onUnclaimAccount &&
          hasAccess("accountUnclaim") &&
          menuRow?.ownerStatus === "owned",
        tooltip: getTooltip("unclaimAccount", "Unclaim this record"),
      },
      {
        label: "View Details",
        icon: <Info sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onView),
        show: !!onView,
        tooltip: getTooltip("view", "View detailed information for this record"),
      },
      {
        label: "Edit",
        icon: <Edit sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onEdit),
        show: !!onEdit,
        tooltip: getTooltip("edit", "Edit this record's information"),
      },
      {
        label: "Add Notes",
        icon: <Note sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onAddNote),
        show: !!onAddNote,
        tooltip: getTooltip("addNote", "Add internal notes or comments"),
      },
      {
        label: "Add Attachments",
        icon: <AttachFile sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(onAddAttachment),
        show: !!onAddAttachment,
        tooltip: getTooltip("addAttachment", "Attach files or documents"),
      },
      {
        label: "Delete",
        icon: <Delete sx={{ mr: 1, color: "#000" }} />,
        onClick: () => handleClick(() => onDelete(menuRow[idField])),
        show: !!onDelete,
        disabled: (menuRow) => menuRow?.Active === false,
        tooltip:
          menuRow?.Active === false
            ? "Record is already deactivated"
            : getTooltip("delete", "Delete or deactivate this record"),
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
    menuItems,
    idField,
    tooltips,
    hasAccess,
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