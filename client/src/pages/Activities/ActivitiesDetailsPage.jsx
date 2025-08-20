import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { UniversalDetailView } from "../../components/DetailsView";
import { fetchActivityById, updateActivity, deactivateActivity } from "../../services/activityService";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { noteService } from "../../services/noteService";
import { attachmentService } from "../../services/attachmentService";

// Main fields configuration for activities
const activityMainFields = [
  {
    key: "TypeName",
    label: "Activity Type",
    required: true,
    type: "select",
    options: [
      "Call", "Meeting", "Email", "Task", "Follow-up", "Demo", "Presentation", "Other"
    ],
    width: { xs: 12, md: 6 }
  },
  {
    key: "AccountName",
    label: "Account",
    type: "text",
    disabled: true, // Usually shouldn't change the account
    width: { xs: 12, md: 6 }
  },
  {
    key: "Description",
    label: "Description",
    type: "textarea",
    rows: 3,
    width: { xs: 12 }
  },
  {
    key: "ContactID",
    label: "Contact",
    type: "select", // You'd need to provide contact options
    width: { xs: 12, md: 6 }
  },
  {
    key: "Due_date",
    label: "Due Date & Time",
    type: "datetime-local",
    width: { xs: 12, md: 6 }
  },
  {
    key: "PriorityLevelName",
    label: "Priority",
    type: "select",
    options: ["Low", "Medium", "High", "Urgent"],
    width: { xs: 12, md: 6 }
  },
  {
    key: "Completed",
    label: "Completed",
    type: "boolean",
    width: { xs: 12, md: 6 }
  }
];

export default function ActivitiesDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // State for popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) {
        setError("No activity ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchActivityById(id);
        const activityData = Array.isArray(data) ? data[0] : data;
        if (!activityData) throw new Error("Activity not found");
        setActivity(activityData);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
        setError(err.message || "Failed to load activity details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const handleBack = () => {
    navigate('/activities');
  };

  const handleSave = async (formData) => {
    try {
      console.log("Saving activity:", formData);
      setActivity(formData);
      await updateActivity(id, formData);
      setSuccessMessage("Activity updated successfully!");
    } catch (error) {
      console.error("Failed to save activity:", error);
      setError("Failed to save activity. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deactivating activity with ID:", id);
      await deactivateActivity(id);
      navigate('/activities');
    } catch (error) {
      console.error("Failed to delete activity:", error);
      setError("Failed to delete activity. Please try again.");
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
      
      // Refresh activity data to show new note
      const data = await fetchActivityById(id);
      const activityData = Array.isArray(data) ? data[0] : data;
      setActivity(activityData);
      
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
      
      // Refresh activity data
      const data = await fetchActivityById(id);
      const activityData = Array.isArray(data) ? data[0] : data;
      setActivity(activityData);
      
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
      
      // Refresh activity data
      const data = await fetchActivityById(id);
      const activityData = Array.isArray(data) ? data[0] : data;
      setActivity(activityData);
      
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
      
      // Refresh activity data to show new attachments
      const data = await fetchActivityById(id);
      const activityData = Array.isArray(data) ? data[0] : data;
      setActivity(activityData);
      
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
      
      // Refresh activity data
      const data = await fetchActivityById(id);
      const activityData = Array.isArray(data) ? data[0] : data;
      setActivity(activityData);
      
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

  // Create related tabs (empty for now, but you can add related records later)
  const relatedTabs = [
    {
      id: "attachments",
      label: "Attachments",
      content: (
        <Box>
          {activity?.attachments && activity.attachments.length > 0 ? (
            <div>
              {activity.attachments.map((att) => (
                <Box key={att.AttachmentID} sx={{ mb: 2, p: 2, border: '1px solid #e5e5e5', borderRadius: 1 }}>
                  <div><strong>File:</strong> {att.FileName}</div>
                  <div><strong>Uploaded:</strong> {formatDate(att.CreatedAt)}</div>
                </Box>
              ))}
            </div>
          ) : (
            <Alert severity="info">No attachments found for this activity.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      content: (
        <Box>
          {activity?.notes && activity.notes.length > 0 ? (
            <div>
              {activity.notes.map((note) => (
                <Box key={note.NoteID} sx={{ mb: 2, p: 2, border: '1px solid #e5e5e5', borderRadius: 1 }}>
                  <div><strong>Note:</strong> {note.Content}</div>
                  <div><strong>Created:</strong> {formatDate(note.CreatedAt)}</div>
                </Box>
              ))}
            </div>
          ) : (
            <Alert severity="info">No notes found for this activity.</Alert>
          )}
        </Box>
      ),
    },
  ];

  // Generate header chips based on activity data
  const headerChips = [];
  if (activity) {
    // Status chip
    headerChips.push({
      label: activity.Completed ? 'Completed' : 'Pending',
      color: activity.Completed ? '#10b981' : '#f59e0b',
      textColor: '#ffffff'
    });

    // Priority chip
    if (activity.PriorityLevelName) {
      const priorityColors = {
        'Low': '#6b7280',
        'Medium': '#3b82f6', 
        'High': '#f59e0b',
        'Urgent': '#ef4444'
      };
      headerChips.push({
        label: activity.PriorityLevelName,
        color: priorityColors[activity.PriorityLevelName] || '#6b7280',
        textColor: '#ffffff'
      });
    }

    // Type chip
    if (activity.TypeName) {
      headerChips.push({
        label: activity.TypeName,
        color: '#8b5cf6',
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
        title={activity?.TypeName || 'Activity Details'}
        subtitle={activity?.ActivityID ? `ID: ${activity.ActivityID}` : undefined}
        item={activity}
        mainFields={activityMainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddAttachment={handleAddAttachment}
        onAddNote={handleAddNote}
        loading={loading}
        error={error}
        entityType="activity"
        headerChips={headerChips}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        onEdit={handleEditNote}
        entityType="activity"
        entityId={activity?.ActivityID}
        entityName={`${activity?.TypeName || 'Activity'} - ${activity?.Description || ''}`}
        existingNotes={activity?.notes || []}
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
        entityType="activity"
        entityId={activity?.ActivityID}
        entityName={`${activity?.TypeName || 'Activity'} - ${activity?.Description || ''}`}
        existingAttachments={activity?.attachments || []}
        loading={popupLoading}
        error={popupError}
      />
    </Box>
  );
}