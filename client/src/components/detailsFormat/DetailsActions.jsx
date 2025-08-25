import React from "react";
import { Box, Button } from "@mui/material";
import {
  ArrowBack,
  Edit,
  Save,
  Close,
  Delete,
  Note,
  AttachFile,
  PersonAdd,
  Business,
} from "@mui/icons-material";

export default function DetailsActions({
  isEditing = false,
  readOnly = false,
  entityType = "entity",
  currentRow = {}, // current entity data
  onBack,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onAddNote,
  onAddAttachment,
  onAssignUser,
  onClaimAccount,
}) {
  // ----------------------------
  // Helper: Get current user roles
  // ----------------------------
  const getCurrentUserRoles = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return Array.isArray(user.roles) ? user.roles : [];
    } catch {
      return [];
    }
  };

  const hasRole = (role) => getCurrentUserRoles().includes(role);

  // ----------------------------
  // Button style
  // ----------------------------
  const buttonSx = {
    width: 140,
    height: 50,
    minWidth: "auto",
    fontSize: "0.80rem",
  };

  // ----------------------------
  // Helper: render a button if allowed
  // ----------------------------
  const renderButton = ({ onClick, label, icon, show = true, outlined = true, sx = {}, disabled = false }) => {
    if (!onClick || !show) return null;

    return (
      <Button
        key={label}
        sx={{ ...buttonSx, ...sx }}
        variant={outlined ? "outlined" : "contained"}
        onClick={onClick}
        startIcon={icon}
        disabled={disabled}
      >
        {label}
      </Button>
    );
  };

  // ----------------------------
  // View mode buttons
  // ----------------------------
  const viewButtons = [
    { onClick: onBack, label: "Back", icon: <ArrowBack /> },
    { onClick: onEdit, label: "Edit", icon: <Edit />, show: !readOnly, outlined: false },
    {
      onClick: onAssignUser,
      label: "Assign User",
      icon: <PersonAdd />,
      show: entityType === "account" && !readOnly && hasRole("C-level"),
    },
    {
      onClick: onClaimAccount,
      label: "Claim Account",
      icon: <Business />,
      show: entityType === "account" && hasRole("Sales Representative") && currentRow?.ownerStatus !== "owned",
    },
    { onClick: onAddNote, label: "Add Note", icon: <Note />, show: !readOnly },
    { onClick: onAddAttachment, label: "Add Attachment", icon: <AttachFile />, show: !readOnly },
    { onClick: onDelete, label: "Delete", icon: <Delete />, show: !readOnly, disabled: currentRow?.Active === false },
  ];

  // ----------------------------
  // Edit mode buttons
  // ----------------------------
  const editButtons = [
    { onClick: onCancel, label: "Cancel", icon: <Close /> },
    { onClick: onSave, label: "Save", icon: <Save />, outlined: false },
    { onClick: onAddNote, label: "Add Note", icon: <Note /> },
    { onClick: onAddAttachment, label: "Add Attachment", icon: <AttachFile /> },
  ];

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {(isEditing ? editButtons : viewButtons).map((btn) => renderButton(btn))}
    </Box>
  );
}
