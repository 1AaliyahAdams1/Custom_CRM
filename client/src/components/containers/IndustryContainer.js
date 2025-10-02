import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  deactivateIndustry,
  reactivateIndustry,
  bulkDeactivateIndustries,
  bulkReactivateIndustries
} from '../../services/industryService';
import {
  createNote,
  updateNote,
  deactivateNote,
  reactivateNote,
} from "../../services/noteService";
import {
  uploadAttachment,
  deleteAttachment,
  downloadAttachment
} from "../../services/attachmentService";
import IndustryPage from '../../pages/Industry/IndustryPage';
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";

const IndustryContainer = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('success');
  const [selected, setSelected] = useState([]);

  // Notes and attachments
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  // Confirm dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [industryToDelete, setIndustryToDelete] = useState(null);

  // Load all industries
  const loadIndustries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const industriesData = await getAllIndustries(); // <- array directly
      setIndustries(industriesData || []);
    } catch (err) {
      setError(err.message || 'Failed to load industries');
      setIndustries([]);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadIndustries();
  }, [loadIndustries]);

  // Selection handlers
  const handleSelectClick = useCallback((id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const handleSelectAllClick = useCallback((event) => {
    if (event.target.checked) {
      setSelected(industries.map(i => i.IndustryID));
    } else {
      setSelected([]);
    }
  }, [industries]);

  // CRUD
  const handleCreate = useCallback(async (industryData) => {
    try {
      setLoading(true);
      const response = await createIndustry(industryData.name);
      if (response.success) {
        await loadIndustries();
        setSuccessMessage(response.message);
        setStatusMessage(response.message);
        setStatusSeverity('success');
      }
    } catch (err) {
      setError(err.message || 'Failed to create industry');
    } finally {
      setLoading(false);
    }
  }, [loadIndustries]);

  const handleEdit = useCallback(async (industry) => {
    setStatusMessage('Edit functionality to be implemented');
    setStatusSeverity('info');
    console.log('Edit industry:', industry);
  }, []);

  const handleView = useCallback((industry) => {
    setStatusMessage('View functionality to be implemented');
    setStatusSeverity('info');
    console.log('View industry:', industry);
  }, []);

  const handleDelete = useCallback(async (industryId) => {
    try {
      const response = await deleteIndustry(industryId);
      if (response.success) {
        await loadIndustries();
        setSelected(prev => prev.filter(i => i !== industryId));
        setSuccessMessage(response.message);
        setStatusMessage(response.message);
        setStatusSeverity('success');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete industry');
    }
  }, [loadIndustries]);

  const handleDeactivate = useCallback(async (industryId) => {
    try {
      const response = await deactivateIndustry(industryId);
      if (response.success) {
        await loadIndustries();
        setSuccessMessage(response.message);
        setStatusMessage(response.message);
        setStatusSeverity('success');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to deactivate industry');
    }
  }, [loadIndustries]);

  const handleReactivate = useCallback(async (industryId) => {
    try {
      const response = await reactivateIndustry(industryId);
      if (response.success) {
        await loadIndustries();
        setSuccessMessage(response.message);
        setStatusMessage(response.message);
        setStatusSeverity('success');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to reactivate industry');
    }
  }, [loadIndustries]);

  const handleBulkDeactivate = useCallback(async () => {
    try {
      const response = await bulkDeactivateIndustries(selected);
      if (response.success) {
        await loadIndustries();
        setSelected([]);
        setSuccessMessage(response.message);
        setStatusMessage(response.message);
        setStatusSeverity('success');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to bulk deactivate industries');
    }
  }, [selected, loadIndustries]);


// Notes handlers
  const handleAddNote = useCallback((industry) => {
    setSelectedIndustry(industry);
    setNotesPopupOpen(true);
  }, []);

  const handleSaveNote = async (noteData) => {
    try {
      await createNote({
        EntityID: selectedIndustry.IndustryID,
        EntityType: "Industry",
        Content: noteData.Content || noteData,
      });
      setSuccessMessage("Note added successfully!");
      setStatusMessage('Note added successfully');
      setStatusSeverity('success');
    } catch (err) {
      setError(err.message || "Failed to save note");
      throw err;
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await updateNote(noteData.NoteID, {
        EntityID: selectedIndustry.IndustryID,
        EntityType: "Industry",
        Content: noteData.Content,
      });
      setSuccessMessage("Note updated successfully!");
      setStatusMessage('Note updated successfully');
      setStatusSeverity('success');
    } catch (err) {
      setError(err.message || "Failed to update note");
      throw err;
    }
  };

  const handleDeactivateNote = async (noteId) => {
    try {
      await deactivateNote(noteId);
      setSuccessMessage("Note deactivated successfully!");
      setStatusMessage('Note deactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      setError(err.message || "Failed to deactivate note");
      throw err;
    }
  };

  const handleReactivateNote = async (noteId) => {
    try {
      await reactivateNote(noteId);
      setSuccessMessage("Note reactivated successfully!");
      setStatusMessage('Note reactivated successfully');
      setStatusSeverity('success');
    } catch (err) {
      setError(err.message || "Failed to reactivate note");
      throw err;
    }
  };

  // Attachments handlers
  const handleAddAttachment = useCallback((industry) => {
    setSelectedIndustry(industry);
    setAttachmentsPopupOpen(true);
  }, []);

  const handleUploadAttachment = async (files) => {
    try {
      const promises = files.map(file => uploadAttachment({
        file,
        entityId: selectedIndustry.IndustryID,
        entityTypeName: "Industry"
      }));
      await Promise.all(promises);
      setAttachmentsPopupOpen(false);
      setSuccessMessage(`${files.length} attachment(s) uploaded successfully!`);
      setStatusMessage(`${files.length} attachment(s) uploaded successfully!`);
      setStatusSeverity('success');
    } catch (err) {
      setError(err.message || "Failed to upload attachments");
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      setSuccessMessage("Attachment deleted successfully!");
      setStatusMessage('Attachment deleted successfully');
      setStatusSeverity('success');
    } catch (err) {
      setError(err.message || "Failed to delete attachment");
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      await downloadAttachment(attachment);
    } catch (err) {
      setError(err.message || "Failed to download attachment");
    }
  };

  // Confirm dialog
  const confirmDeactivate = async () => {
    if (!industryToDelete) return;
    await handleDeactivate(industryToDelete.IndustryID);
    setDeleteDialogOpen(false);
    setIndustryToDelete(null);
  };

  return (
    <>
      <IndustryPage
        industries={industries}
        loading={loading}
        error={error}
        setError={setError}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        statusMessage={statusMessage}
        statusSeverity={statusSeverity}
        setStatusMessage={setStatusMessage}
        selected={selected}
        onSelectClick={handleSelectClick}
        onSelectAllClick={handleSelectAllClick}
        onDeactivate={(industry) => { setIndustryToDelete(industry); setDeleteDialogOpen(true); }}
        onReactivate={handleReactivate}
        onDelete={handleDelete}
        onBulkDeactivate={handleBulkDeactivate}
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onEdit={handleEditNote}
        onDeactivate={handleDeactivateNote}
        onReactivate={handleReactivateNote}
        entityType="Industry"
        entityId={selectedIndustry?.IndustryID}
        entityName={selectedIndustry?.IndustryName}
        showExistingNotes={true}
      />

      {/* Attachments Popup */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        entityType="Industry"
        entityId={selectedIndustry?.IndustryID}
        entityName={selectedIndustry?.IndustryName}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
      />

      {/* Confirm deactivate dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Deactivate Industry"
        description={`Are you sure you want to deactivate this industry${industryToDelete?.IndustryName ? ` ("${industryToDelete.IndustryName}")` : ""}?`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default IndustryContainer;
