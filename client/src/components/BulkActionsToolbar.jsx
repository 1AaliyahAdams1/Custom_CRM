import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Assignment, PersonAdd, Cancel } from "@mui/icons-material";
import { ROUTE_ACCESS } from "../utils/auth/routesAccess";

const BulkActionsToolbar = ({
  selectedCount = 0,
  selectedItems = [],
  entityType = "records",
  onBulkAssign,
  onBulkClaim,
  onClearSelection,
  userRoles = [],
  loading = false,
  disabled = false,
}) => {
  const [bulkLoading, setBulkLoading] = useState("");

  // Normalize roles to array
  const roles = Array.isArray(userRoles) 
    ? userRoles 
    : typeof userRoles === "string" 
    ? [userRoles] 
    : [];

  // Helper function to check access using ROUTE_ACCESS
  const hasAccess = (routeKey) => {
    if (!ROUTE_ACCESS[routeKey]) return false;
    return roles.some((role) => ROUTE_ACCESS[routeKey].includes(role));
  };

  const handleBulkAction = async (action, handler) => {
    if (!handler || loading || disabled) return;
    setBulkLoading(action);
    try {
      await handler(selectedItems);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    } finally {
      setBulkLoading("");
    }
  };

  if (selectedCount === 0) return null;

  // Check permissions using ROUTE_ACCESS
  const canAssign = hasAccess("accountAssign");
  const canClaim = hasAccess("accountClaim");

  // Calculate claimable items based on role and item status
  let claimableCount = 0;
  if (canClaim) {
    claimableCount = selectedItems.filter(item => {
      // Different logic for different roles
      if (roles.includes("Sales Representative")) {
        return item.ownerStatus === "unowned";
      } else if (roles.includes("C-level")) {
        return item.ownerStatus === "n/a" || item.ownerStatus === "unowned";
      }
      return false;
    }).length;
  }

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderRadius: "8px 8px 0 0",
        mb: 1,
      }}
    >
      {/* Left side: selection info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {selectedCount} {entityType}
          {selectedCount !== 1 ? "s" : ""} selected
        </Typography>

        {claimableCount > 0 && claimableCount !== selectedCount && (
          <Chip
            label={`${claimableCount} claimable`}
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "inherit",
            }}
          />
        )}
      </Box>

      {/* Right side: actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Bulk Claim - only show if user has claim access */}
        {canClaim && (
          <Tooltip
            title={
              claimableCount > 0 
                ? `Claim ${claimableCount} ${entityType}${claimableCount !== 1 ? "s" : ""}`
                : `No ${entityType}s available to claim`
            }
          >
            <span>
              <Button
                variant="contained"
                size="small"
                startIcon={
                  bulkLoading === "claim" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PersonAdd />
                  )
                }
                onClick={() => handleBulkAction("claim", onBulkClaim)}
                disabled={claimableCount === 0 || loading || bulkLoading || disabled}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "inherit",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
                  "&:disabled": {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.5)",
                  },
                }}
              >
                {bulkLoading === "claim"
                  ? "Claiming..."
                  : `Claim ${claimableCount}`}
              </Button>
            </span>
          </Tooltip>
        )}

        {/* Bulk Assign - only show if user has assign access */}
        {canAssign && (
          <Tooltip
            title={`Assign team members to ${selectedCount} ${entityType}${
              selectedCount !== 1 ? "s" : ""
            }`}
          >
            <span>
              <Button
                variant="contained"
                size="small"
                startIcon={
                  bulkLoading === "assign" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Assignment />
                  )
                }
                onClick={() => handleBulkAction("assign", onBulkAssign)}
                disabled={loading || bulkLoading || disabled}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "inherit",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
                  "&:disabled": {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.5)",
                  },
                }}
              >
                {bulkLoading === "assign" ? "Assigning..." : "Assign User"}
              </Button>
            </span>
          </Tooltip>
        )}

        {/* Clear Selection */}
        <Tooltip title="Clear selection">
          <Button
            variant="text"
            size="small"
            startIcon={<Cancel />}
            onClick={onClearSelection}
            disabled={loading || bulkLoading}
            sx={{
              color: "inherit",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
            }}
          >
            Clear
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default BulkActionsToolbar;