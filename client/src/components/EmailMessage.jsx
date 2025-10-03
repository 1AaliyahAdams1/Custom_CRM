import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider
} from "@mui/material";

const OutlookEmailForm = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_uli870p",
        "template_btvvgg8",
        form.current,
        "rsqRPSMhpJFGvJL8x"
      )
      .then(
        () => {
          console.log("SUCCESS!");
          alert("Email sent successfully!");
          form.current.reset();
        },
        (error) => {
          console.log("FAILED...", error.text);
          alert("Failed to send email. Check console for details.");
        }
      );
  };

  return (
    <Paper
      elevation={5}
      sx={{
        maxWidth: 800,
        margin: "auto",
        mt: 4,
        borderRadius: 2,
        overflow: "hidden"
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#000000",
          color: "white",
          p: 2,
          fontWeight: "bold",
          fontSize: 18
        }}
      >
        New Message
      </Box>

      {/* Form Body */}
      <Box component="form" ref={form} onSubmit={sendEmail} sx={{ p: 3 }}>
        {/* Email Header Fields */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <TextField
            label="To"
            name="to_email"
            type="email"
            fullWidth
            required
          />
          <TextField
            label="Cc (optional)"
            name="cc_email"
            type="email"
            fullWidth
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <TextField
            label="From Name"
            name="from_name"
            type="text"
            fullWidth
            required
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
        />

        <Divider sx={{ mb: 2 }} />


        <TextField
          placeholder="Type your message..."
          name="message"
          fullWidth
          required
          multiline
          rows={10}
          margin="dense"
        />

        {/* Send Button */}
        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#000000",
              ":hover": { backgroundColor: "#333333" },
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default OutlookEmailForm;
