import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Divider,
  IconButton,
  CircularProgress,
  Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const EmailDialog = ({ open, onClose, activity }) => {
  const form = useRef();
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState(null);

  const sendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    setAlert(null);

    try {
      await emailjs.sendForm(
        "service_uli870p",
        "template_btvvgg8",
        form.current,
        "rsqRPSMhpJFGvJL8x"
      );
      
      setAlert({ type: "success", message: "Email sent successfully!" });
      setTimeout(() => {
        form.current.reset();
        onClose();
        setAlert(null);
      }, 1500);
    } catch (error) {
      console.error("Email send failed:", error);
      setAlert({ type: "error", message: "Failed to send email. Please try again." });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      form.current?.reset();
      setAlert(null);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#000000",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5
        }}
      >
        <span>New Email</span>
        <IconButton
          onClick={handleClose}
          disabled={sending}
          sx={{ color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 10 }}>
        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <Box component="form" ref={form} onSubmit={sendEmail}>
          <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 2 }}>
            <TextField
              label="To"
              name="to_email"
              type="email"
              fullWidth
              required
              defaultValue={activity?.ContactEmail || ""}
            />
            <TextField
              label="To Name"
              name="to_name"
              type="text"
              fullWidth
              required
              defaultValue={activity?.ContactEmail || ""}
            />
            <TextField
              label="Cc (optional)"
              name="cc_email"
              type="email"
              fullWidth
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="From Name"
              name="from_name"
              type="text"
              fullWidth
              required
              defaultValue={activity?.AssignedUserName || ""}
            />
            <TextField
              label="Reply To"
              name="reply_to"
              type="email"
              fullWidth
              required
            />
          </Box>

          <TextField
            label="Subject"
            name="subject"
            fullWidth
            required
            sx={{ mb: 2 }}
            defaultValue={activity?.AccountName ? `Re: ${activity.AccountName}` : ""}
          />

          <Divider sx={{ mb: 2 }} />

          <TextField
            placeholder="Type your message..."
            name="message"
            fullWidth
            required
            multiline
            rows={10}
          />

          <DialogActions sx={{ px: 0, pt: 2 }}>
            <Button 
              onClick={handleClose} 
              disabled={sending}
              sx={{ color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={sending}
              startIcon={sending ? <CircularProgress size={16} /> : null}
              sx={{
                backgroundColor: "#000000",
                ":hover": { backgroundColor: "#333333" },
              }}
            >
              {sending ? "Sending..." : "Send"}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;