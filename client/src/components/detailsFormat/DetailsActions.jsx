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
import { ROUTE_ACCESS } from "../../utils/auth/routesAccess";
import { useAuth } from "../../hooks/auth/useAuth";

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
  const { roles = [] } = useAuth() || {};

  const hasAccess = (accessKey) => {
    if (!accessKey || !ROUTE_ACCESS[accessKey]) return true;
    return ROUTE_ACCESS[accessKey].some((role) => roles.includes(role));
  };

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {!isEditing ? (
        <>
          {/* Back */}
          {onBack && (
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBack />}
              sx={{
                borderColor: "#e5e5e5",
                color: "#666",
                "&:hover": { borderColor: "#ccc", backgroundColor: "#f5f5f5" },
              }}
            >
              Back
            </Button>
          )}

          {/* Edit */}
          {onEdit && !readOnly && hasAccess(`${entityType}Edit`) && (
            <Button
              variant="contained"
              onClick={onEdit}
              startIcon={<Edit />}
              sx={{
                backgroundColor: "#050505",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              Edit
            </Button>
          )}

          {/* Assign User */}
          {onAssignUser &&
            !readOnly &&
            entityType === "account" &&
            hasAccess("accountAssign") && (
              <Button
                variant="outlined"
                onClick={onAssignUser}
                startIcon={<PersonAdd />}
                sx={{
                  borderColor: "#7c3aed",
                  color: "#7c3aed",
                  "&:hover": {
                    borderColor: "#6d28d9",
                    backgroundColor: "#f3e8ff",
                  },
                }}
              >
                Assign User
              </Button>
            )}

          {/* Claim Account */}
          {onClaimAccount &&
            entityType === "account" &&
            hasAccess("accountClaim") && (
              <Button
                variant="outlined"
                onClick={onClaimAccount}
                startIcon={<Business />}
                sx={{
                  borderColor: "#f59e0b",
                  color: "#f59e0b",
                  "&:hover": {
                    borderColor: "#d97706",
                    backgroundColor: "#fef3c7",
                  },
                }}
              >
                Claim Account
              </Button>
            )}

          {/* Add Note */}
          {onAddNote && !readOnly && hasAccess("activitiesCreate") && (
            <Button
              variant="outlined"
              onClick={onAddNote}
              startIcon={<Note />}
              sx={{
                borderColor: "#2563eb",
                color: "#2563eb",
                "&:hover": {
                  borderColor: "#1d4ed8",
                  backgroundColor: "#dbeafe",
                },
              }}
            >
              Add Note
            </Button>
          )}

          {/* Add Attachment */}
          {onAddAttachment && !readOnly && hasAccess("activitiesCreate") && (
            <Button
              variant="outlined"
              onClick={onAddAttachment}
              startIcon={<AttachFile />}
              sx={{
                borderColor: "#059669",
                color: "#059669",
                "&:hover": {
                  borderColor: "#047857",
                  backgroundColor: "#d1fae5",
                },
              }}
            >
              Add Attachment
            </Button>
          )}

          {/* Delete */}
          {onDelete && !readOnly && hasAccess(`${entityType}Edit`) && (
            <Button
              variant="outlined"
              onClick={onDelete}
              startIcon={<Delete />}
              sx={{
                borderColor: "#d32f2f",
                color: "#d32f2f",
                "&:hover": { backgroundColor: "#ffebee" },
              }}
            >
              Delete
            </Button>
          )}
        </>
      ) : (
        <>
          {/* Cancel */}
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<Close />}
              sx={{ borderColor: "#e5e5e5", color: "#666" }}
            >
              Cancel
            </Button>
          )}

          {/* Save */}
          {onSave && hasAccess(`${entityType}Edit`) && (
            <Button
              variant="contained"
              onClick={onSave}
              startIcon={<Save />}
              sx={{
                backgroundColor: "#050505",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              Save
            </Button>
          )}

          {/* Note & Attachment */}
          {onAddNote && hasAccess("activitiesCreate") && (
            <Button
              variant="outlined"
              onClick={onAddNote}
              startIcon={<Note />}
              sx={{
                borderColor: "#2563eb",
                color: "#2563eb",
                "&:hover": {
                  borderColor: "#1d4ed8",
                  backgroundColor: "#dbeafe",
                },
              }}
            >
              Add Note
            </Button>
          )}

          {onAddAttachment && hasAccess("activitiesCreate") && (
            <Button
              variant="outlined"
              onClick={onAddAttachment}
              startIcon={<AttachFile />}
              sx={{
                borderColor: "#059669",
                color: "#059669",
                "&:hover": {
                  borderColor: "#047857",
                  backgroundColor: "#d1fae5",
                },
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
