// src/components/DetailsActions.jsx
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
  // Get current user roles from localStorage
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

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {!isEditing ? (
        <>
          {onBack && (
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBack />}
              sx={{
                borderColor: "#e5e5e5",
                color: "#666666",
                "&:hover": { borderColor: "#cccccc", backgroundColor: "#f5f5f5" },
              }}
            >
              Back
            </Button>
          )}

          {onEdit && !readOnly && (
            <Button
              variant="contained"
              onClick={onEdit}
              startIcon={<Edit />}
              sx={{ backgroundColor: "#050505", "&:hover": { backgroundColor: "#333333" } }}
            >
              Edit
            </Button>
          )}

          {/* Assign User only for C-Level */}
          {onAssignUser && !readOnly && entityType === "account" && hasRole("C-level") && (
            <Button
              variant="outlined"
              onClick={onAssignUser}
              startIcon={<PersonAdd />}
              sx={{
                borderColor: "#7c3aed",
                color: "#7c3aed",
                "&:hover": { borderColor: "#6d28d9", backgroundColor: "#f3e8ff" },
              }}
            >
              Assign User
            </Button>
          )}

          {/* Claim Account only for Sales Rep */}
          {onClaimAccount && entityType === "account" && hasRole("Sales Representative") && (
            <Button
              variant="outlined"
              onClick={onClaimAccount}
              startIcon={<Business />}
              sx={{
                borderColor: "#f59e0b",
                color: "#f59e0b",
                "&:hover": { borderColor: "#d97706", backgroundColor: "#fef3c7" },
              }}
            >
              Claim Account
            </Button>
          )}

          {onAddNote && !readOnly && (
            <Button
              variant="outlined"
              onClick={onAddNote}
              startIcon={<Note />}
              sx={{
                borderColor: "#2563eb",
                color: "#2563eb",
                "&:hover": { borderColor: "#1d4ed8", backgroundColor: "#dbeafe" },
              }}
            >
              Add Note
            </Button>
          )}

          {onAddAttachment && !readOnly && (
            <Button
              variant="outlined"
              onClick={onAddAttachment}
              startIcon={<AttachFile />}
              sx={{
                borderColor: "#059669",
                color: "#059669",
                "&:hover": { borderColor: "#047857", backgroundColor: "#d1fae5" },
              }}
            >
              Add Attachment
            </Button>
          )}

          {onDelete && !readOnly && (
            <Button
              variant="outlined"
              onClick={onDelete}
              startIcon={<Delete />}
              sx={{ borderColor: "#d32f2f", color: "#d32f2f", "&:hover": { backgroundColor: "#ffebee" } }}
            >
              Delete
            </Button>
          )}
        </>
      ) : (
        <>
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<Close />}
              sx={{ borderColor: "#e5e5e5", color: "#666666" }}
            >
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              variant="contained"
              onClick={onSave}
              startIcon={<Save />}
              sx={{ backgroundColor: "#050505", "&:hover": { backgroundColor: "#333333" } }}
            >
              Save
            </Button>
          )}
          {onAddNote && (
            <Button
              variant="outlined"
              onClick={onAddNote}
              startIcon={<Note />}
              sx={{
                borderColor: "#2563eb",
                color: "#2563eb",
                "&:hover": { borderColor: "#1d4ed8", backgroundColor: "#dbeafe" },
              }}
            >
              Add Note
            </Button>
          )}
          {onAddAttachment && (
            <Button
              variant="outlined"
              onClick={onAddAttachment}
              startIcon={<AttachFile />}
              sx={{
                borderColor: "#059669",
                color: "#059669",
                "&:hover": { borderColor: "#047857", backgroundColor: "#d1fae5" },
              }}
            >
              Add Attachment
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
