import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Grid, Typography, Button } from "@mui/material";
import { UniversalDetailView } from "../../components/DetailsView";
import { fetchDealById, updateDeal, deactivateDeal } from "../../services/dealService";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { noteService } from "../../services/noteService";
import { attachmentService } from "../../services/attachmentService";

// Main fields configuration for deals
const dealMainFields = [
  {
    key: "DealName",
    label: "Deal Name",
    required: true,
    width: { xs: 12, md: 8 }
  },
  {
    key: "AccountName",
    label: "Account",
    type: "text",
    disabled: true, // Usually shouldn't change the account
    width: { xs: 12, md: 4 }
  },
  {
    key: "StageName",
    label: "Stage",
    type: "select",
    options: [
      "Prospecting",
      "Qualification",
      "Proposal",
      "Negotiation",
      "Closed Won",
      "Closed Lost"
    ],
    width: { xs: 12, md: 6 }
  },
  {
    key: "Value",
    label: "Deal Value",
    type: "currency",
    width: { xs: 12, md: 6 }
  },
  {
    key: "Probability",
    label: "Probability (%)",
    type: "number",
    min: 0,
    max: 100,
    width: { xs: 12, md: 6 }
  },
  {
    key: "CloseDate",
    label: "Expected Close Date",
    type: "date",
    width: { xs: 12, md: 6 }
  },
  {
    key: "Progression",
    label: "Progression",
    type: "number",
    min: 0,
    max: 100,
    width: { xs: 12, md: 6 }
  },
  {
    key: "Description",
    label: "Description",
    type: "textarea",
    rows: 3,
    width: { xs: 12 }
  }
];

export default function DealsDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // State for popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);



  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) {
        setError("No deal ID provided");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchDealById(id); // fetch by numeric ID
        setDeal(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        console.error("Failed to fetch deal:", err);
        setError(err.message || "Failed to load deal details");
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id]);


  const handleBack = () => {
    navigate('/deals');
  };

  const handleSave = async (formData) => {
    try {
      console.log("Saving deal:", formData);
      setDeal(formData);
      await updateDeal(id, formData);
      setSuccessMessage("Deal updated successfully!");
    } catch (error) {
      console.error("Failed to save deal:", error);
      setError("Failed to save deal. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deactivating deal with ID:", id);
      await deactivateDeal(id);
      navigate('/deals');
    } catch (error) {
      console.error("Failed to delete deal:", error);
      setError("Failed to delete deal. Please try again.");
    }
  };

  // Notes handlers
  const handleAddNote = () => {
    setNotesPopupOpen(true);
    setPopupError(null);
  };

  const handleSaveNote = async (noteData) => {
    try {
      setPopupLoading(true);
      setPopupError(null);

      await noteService.createNote(noteData);

      // Refresh deal data to show new note
      const data = await fetchDealById(id);
      const dealData = Array.isArray(data) ? data[0] : data;
      setDeal(dealData);

      setSuccessMessage('Note added successfully!');
      setNotesPopupOpen(false);
    } catch (error) {
      setPopupError(error.message || 'Failed to save note');
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setPopupLoading(true);
      setPopupError(null);

      await noteService.deleteNote(noteId);

      // Refresh deal data
      const data = await fetchDealById(id);
      const dealData = Array.isArray(data) ? data[0] : data;
      setDeal(dealData);

      setSuccessMessage('Note deleted successfully!');
    } catch (error) {
      setPopupError(error.message || 'Failed to delete note');
    } finally {
      setPopupLoading(false);
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      setPopupLoading(true);
      setPopupError(null);

      await noteService.updateNote(noteData.NoteID, noteData);

      // Refresh deal data
      const data = await fetchDealById(id);
      const dealData = Array.isArray(data) ? data[0] : data;
      setDeal(dealData);

      setSuccessMessage('Note updated successfully!');
    } catch (error) {
      setPopupError(error.message || 'Failed to update note');
    } finally {
      setPopupLoading(false);
    }
  };

  // Attachments handlers
  const handleAddAttachment = () => {
    setAttachmentsPopupOpen(true);
    setPopupError(null);
  };

  const handleUploadAttachment = async (attachmentDataArray) => {
    try {
      setPopupLoading(true);
      setPopupError(null);

      // Upload each file
      for (const attachmentData of attachmentDataArray) {
        await attachmentService.uploadAttachment(attachmentData);
      }

      // Refresh deal data to show new attachments
      const data = await fetchDealById(id);
      const dealData = Array.isArray(data) ? data[0] : data;
      setDeal(dealData);

      setSuccessMessage(`${attachmentDataArray.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
    } catch (error) {
      setPopupError(error.message || 'Failed to upload attachments');
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      setPopupLoading(true);
      setPopupError(null);

      await attachmentService.deleteAttachment(attachmentId);

      // Refresh deal data
      const data = await fetchDealById(id);
      const dealData = Array.isArray(data) ? data[0] : data;
      setDeal(dealData);

      setSuccessMessage('Attachment deleted successfully!');
    } catch (error) {
      setPopupError(error.message || 'Failed to delete attachment');
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      await attachmentService.downloadAttachment(attachment);
    } catch (error) {
      setPopupError(error.message || 'Failed to download attachment');
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const formatCurrency = (value, symbol = "$") => {
    if (!value) return "-";
    return `${symbol}${parseFloat(value).toLocaleString()}`;
  };

  // Create related tabs
  const relatedTabs = [
    {
      id: "products",
      label: "Products",
      content: (
        <Box>
          {deal?.ProductName ? (
            <Grid container spacing={2}>
              {Array.isArray(deal.ProductName) ? (
                deal.ProductName.map((product, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Box sx={{ p: 2, border: '1px solid #e5e5e5', borderRadius: 2, backgroundColor: '#ffffff' }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {product}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Price at time:</strong> {formatCurrency(deal.PriceAtTime?.[idx])}
                      </Typography>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: '1px solid #e5e5e5', borderRadius: 2, backgroundColor: '#ffffff' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {deal.ProductName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Price at time:</strong> {formatCurrency(deal.PriceAtTime)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          ) : (
            <Alert severity="info">No products found for this deal.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "attachments",
      label: "Attachments",
      content: (
        <Box>
          {deal?.attachments && deal.attachments.length > 0 ? (
            <Grid container spacing={2}>
              {deal.attachments.map((att) => (
                <Grid item xs={12} md={6} key={att.AttachmentID}>
                  <Box sx={{ p: 2, border: '1px solid #e5e5e5', borderRadius: 2, backgroundColor: '#ffffff' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      {att.FileName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Uploaded: {formatDate(att.UploadedAt)}
                    </Typography>
                    {att.FilePath && (
                      <Button
                        size="small"
                        variant="outlined"
                        href={att.FilePath}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </Button>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No attachments found for this deal.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      content: (
        <Box>
          {deal?.notes && deal.notes.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {deal.notes.map((note) => (
                <Box
                  key={note.NoteID}
                  sx={{ p: 2, border: '1px solid #e5e5e5', borderRadius: 2, backgroundColor: '#ffffff' }}
                >
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {note.Content}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Created: {formatDate(note.CreatedAt)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info">No notes found for this deal.</Alert>
          )}
        </Box>
      ),
    },
  ];

  // Generate header chips based on deal data
  const headerChips = [];
  if (deal) {
    // Stage chip
    if (deal.StageName) {
      const stageColors = {
        'Prospecting': '#6b7280',
        'Qualification': '#3b82f6',
        'Proposal': '#f59e0b',
        'Negotiation': '#8b5cf6',
        'Closed Won': '#10b981',
        'Closed Lost': '#ef4444'
      };
      headerChips.push({
        label: deal.StageName,
        color: stageColors[deal.StageName] || '#6b7280',
        textColor: '#ffffff'
      });
    }

    // Value chip
    if (deal.Value) {
      headerChips.push({
        label: formatCurrency(deal.Value, deal.Symbol || '$'),
        color: '#059669',
        textColor: '#ffffff'
      });
    }

    // Probability chip
    if (deal.Probability !== undefined && deal.Probability !== null) {
      headerChips.push({
        label: `${deal.Probability}% probability`,
        color: '#3b82f6',
        textColor: '#ffffff'
      });
    }
  }

  return (
    <Box>
      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <UniversalDetailView
        title={deal?.DealName || `Deal #${deal?.DealID || ''}`}
        subtitle={deal?.DealID ? `ID: ${deal.DealID}` : undefined}
        item={deal}
        mainFields={dealMainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddAttachment={handleAddAttachment}
        onAddNote={handleAddNote}
        loading={loading}
        error={error}
        entityType="deal"
        headerChips={headerChips}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        onEdit={handleEditNote}
        entityType="deal"
        entityId={deal?.DealID}
        entityName={deal?.DealName}
        existingNotes={deal?.notes || []}
        loading={popupLoading}
        error={popupError}
      />

      {/* Attachments Popup */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
        entityType="deal"
        entityId={deal?.DealID}
        entityName={deal?.DealName}
        existingAttachments={deal?.attachments || []}
        loading={popupLoading}
        error={popupError}
      />
    </Box>
  );
}