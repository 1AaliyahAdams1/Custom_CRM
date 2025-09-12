import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
        {/* Cancel button */}
        <Button
          onClick={onCancel}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
            py: 1,
            fontSize: "0.9rem",
            fontWeight: 500,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            color: "text.secondary",
            "&:hover": {
              bgcolor: "grey.100",
              borderColor: "grey.400",
            },
          }}
        >
          Cancel
        </Button>

        {/* Confirm button */}
        <Button
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
            py: 1,
            fontSize: "0.9rem",
            fontWeight: 600,
            bgcolor: "error.main",
            color: "error.contrastText",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "error.dark",
              boxShadow: "none",
            },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
