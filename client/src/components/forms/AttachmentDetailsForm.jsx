import React, { useState, useEffect } from "react";
import { Box, Button, Typography, LinearProgress, IconButton, Paper } from "@mui/material";
import { Delete, CloudDownload } from "@mui/icons-material";
import { attachmentService } from "../../services/attachmentService";

const AttachmentDetailsForm = ({ entityType, entityId, onUploaded }) => {
  const [attachments, setAttachments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch attachments
  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await attachmentService.getAttachmentsByEntity(entityId, entityType);
      setAttachments(data);
    } catch (err) {
      setError(err.message || "Failed to load attachments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [entityId, entityType]);

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setError("");
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      for (const file of selectedFiles) {
        attachmentService.validateFile(file); // validate before upload
        await attachmentService.uploadAttachment({ file, entityId, entityTypeName: entityType });
      }
      setSelectedFiles([]);
      await loadAttachments();
      if (onUploaded) onUploaded();
    } catch (err) {
      setError(err.message || "Failed to upload files");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;
    try {
      setLoading(true);
      await attachmentService.deleteAttachment(attachmentId);
      await loadAttachments();
    } catch (err) {
      setError(err.message || "Failed to delete attachment");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      await attachmentService.downloadAttachment(attachment);
    } catch (err) {
      setError(err.message || "Failed to download attachment");
    }
  };

  return (
    <Box>
      {error && <Typography color="error">{error}</Typography>}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || loading}
        >
          Upload
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {attachments.length === 0 && <Typography>No attachments found</Typography>}
        {attachments.map((att) => (
          <Paper
            key={att.AttachmentID}
            sx={{ p: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>{attachmentService.getFileIcon(att.FileName)}</Typography>
              <Typography>{att.FileName}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => handleDownload(att)} disabled={loading}>
                <CloudDownload />
              </IconButton>
              <IconButton onClick={() => handleDelete(att.AttachmentID)} disabled={loading}>
                <Delete />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default AttachmentDetailsForm;
