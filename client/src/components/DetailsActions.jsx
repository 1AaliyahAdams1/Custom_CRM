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
  const getCurrentUserRoles = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return Array.isArray(user.roles) ? user.roles : [];
    } catch (error) {
      console.error("Error getting user roles:", error);
      return [];
    }
  };

  const hasRole = (roleToCheck) => getCurrentUserRoles().includes(roleToCheck);

  const buttonSx = {
    width: 120,       // fixed width
    height: 50,       // fixed height
    minWidth: "auto", // override MUI default
    fontSize: "0.80rem",
  };

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {!isEditing ? (
        <>
          {onBack && (
            <Button
              sx={{ ...buttonSx, borderColor: "#e5e5e5", color: "#666666", "&:hover": { borderColor: "#cccccc", backgroundColor: "#f5f5f5" } }}
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
          )}
          {onEdit && !readOnly && (
            <Button
              sx={{ ...buttonSx, backgroundColor: "#050505", "&:hover": { backgroundColor: "#333333" } }}
              variant="contained"
              onClick={onEdit}
              startIcon={<Edit />}
            >
              Edit
            </Button>
          )}
          {onAssignUser && !readOnly && entityType === "account" && hasRole("C-level") && (
            <Button
              sx={{ ...buttonSx, borderColor: "#7c3aed", color: "#7c3aed", "&:hover": { borderColor: "#6d28d9", backgroundColor: "#f3e8ff" } }}
              variant="outlined"
              onClick={onAssignUser}
              startIcon={<PersonAdd />}
            >
              Assign User
            </Button>
          )}
          {onClaimAccount && entityType === "account" && hasRole("Sales Representative") && (
            <Button
              sx={{ ...buttonSx, borderColor: "#f59e0b", color: "#f59e0b", "&:hover": { borderColor: "#d97706", backgroundColor: "#fef3c7" } }}
              variant="outlined"
              onClick={onClaimAccount}
              startIcon={<Business />}
            >
              Claim Account
            </Button>
          )}
          {onAddNote && !readOnly && (
            <Button
              sx={{ ...buttonSx, borderColor: "#2563eb", color: "#2563eb", "&:hover": { borderColor: "#1d4ed8", backgroundColor: "#dbeafe" } }}
              variant="outlined"
              onClick={onAddNote}
              startIcon={<Note />}
            >
              Add Note
            </Button>
          )}
          {onAddAttachment && !readOnly && (
            <Button
              sx={{ ...buttonSx, borderColor: "#059669", color: "#059669", "&:hover": { borderColor: "#047857", backgroundColor: "#d1fae5" } }}
              variant="outlined"
              onClick={onAddAttachment}
              startIcon={<AttachFile />}
            >
              Add Attachment
            </Button>
          )}
          {onDelete && !readOnly && (
            <Button
              sx={{ ...buttonSx, borderColor: "#d32f2f", color: "#d32f2f", "&:hover": { backgroundColor: "#ffebee" } }}
              variant="outlined"
              onClick={onDelete}
              startIcon={<Delete />}
            >
              Delete
            </Button>
          )}
        </>
      ) : (
        <>
          {onCancel && (
            <Button
              sx={{ ...buttonSx, borderColor: "#e5e5e5", color: "#666666" }}
              variant="outlined"
              onClick={onCancel}
              startIcon={<Close />}
            >
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              sx={{ ...buttonSx, backgroundColor: "#050505", "&:hover": { backgroundColor: "#333333" } }}
              variant="contained"
              onClick={onSave}
              startIcon={<Save />}
            >
              Save
            </Button>
          )}
          {onAddNote && (
            <Button
              sx={{ ...buttonSx, borderColor: "#2563eb", color: "#2563eb", "&:hover": { borderColor: "#1d4ed8", backgroundColor: "#dbeafe" } }}
              variant="outlined"
              onClick={onAddNote}
              startIcon={<Note />}
            >
              Add Note
            </Button>
          )}
          {onAddAttachment && (
            <Button
              sx={{ ...buttonSx, borderColor: "#059669", color: "#059669", "&:hover": { borderColor: "#047857", backgroundColor: "#d1fae5" } }}
              variant="outlined"
              onClick={onAddAttachment}
              startIcon={<AttachFile />}
            >
              Add Attachment
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
