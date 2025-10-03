import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SequencesPage from "../../pages/Sequences/SequencesPage";
import {
  getAllSequences,
  deactivateSequence,
  bulkDeactivateSequences,
  bulkReactivateSequences,
} from "../../services/sequenceService";
import { createNote, updateNote, deactivateNote, reactivateNote } from "../../services/noteService";
import { uploadAttachment, deleteAttachment, downloadAttachment } from "../../services/attachmentService";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { ROUTE_ACCESS } from "../../utils/auth/routesAccess";

const SequencesContainer = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [allSequences, setAllSequences] = useState([]);
  const [filteredSequences, setFilteredSequences] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sequenceToDelete, setSequenceToDelete] = useState(null);

  // ---------------- USER & ROLES ----------------
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  // ---------------- ROLE ACCESS ----------------
  const canAccess = (routeKey) => {
    const allowedRoles = ROUTE_ACCESS[routeKey] || [];
    return roles.some(role => allowedRoles.includes(role));
  };

  const canView = canAccess("sequences");

  // ---------------- FILTER LOGIC ----------------
  const applyFilter = (sequences, filterType) => {
    switch (filterType) {
      case "active":
        return sequences.filter(s => s.Active);
      case "inactive":
        return sequences.filter(s => !s.Active);
      case "all":
      default:
        return sequences;
    }
  };

  // ---------------- FETCH SEQUENCES ----------------
  const fetchSequences = async () => {
    setLoading(true);
    setError(null);
    try {
      const sequencesData = await getAllSequences(false); // Get all sequences including inactive
      setAllSequences(sequencesData || []);
      setFilteredSequences(applyFilter(sequencesData || [], currentFilter));
    } catch {
      setError("Failed to load sequences.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchSequences();
  }, [refreshFlag]);

  useEffect(() => {
    if (allSequences.length) {
      setFilteredSequences(applyFilter(allSequences, currentFilter));
    }
  }, [allSequences, currentFilter]);

  // ---------------- FILTER & SELECTION HANDLERS ----------------
  const handleFilterChange = (filterType) => {
    setCurrentFilter(filterType);
    setFilteredSequences(applyFilter(allSequences, filterType));
    setSelected([]);
  };

  const handleSelectClick = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);

  const handleSelectAllClick = (e) =>
    setSelected(e.target.checked ? filteredSequences.map(s => s.SequenceID) : []);

  const handleDeactivateClick = (sequence) => {
    setSequenceToDelete(sequence);
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!sequenceToDelete) return;
    try {
      await deactivateSequence(sequenceToDelete.SequenceID);
      setSuccessMessage("Sequence deactivated successfully.");
      setRefreshFlag(f => !f);
    } catch {
      setError("Failed to deactivate sequence.");
    } finally {
      setDeleteDialogOpen(false);
      setSequenceToDelete(null);
    }
  };

  const handleEdit = (sequence) => navigate(`/sequences/edit/${sequence.SequenceID}`, { state: { sequence } });
  const handleView = (sequence) => navigate(`/sequences/${sequence.SequenceID}`);
  const handleCreate = () => navigate("/sequences/create");

  // ---------------- NOTES & ATTACHMENTS ----------------
  const handleAddNote = (sequence) => { setSelectedSequence(sequence); setNotesPopupOpen(true); };

  const handleSaveNote = async (noteData) => {
    try {
      await createNote({ 
        EntityID: selectedSequence.SequenceID, 
        EntityType: "Sequence", 
        Content: noteData.Content || noteData,
      });
      setSuccessMessage("Note added successfully!");
      setRefreshFlag(f => !f);
    } catch (err) { 
      setError(err.message || "Failed to save note"); 
      throw err;
    }
  };

  const handleEditNote = async (noteData) => { 
    try { 
      await updateNote(noteData.NoteID, {
        EntityID: selectedSequence.SequenceID,
        EntityType: "Sequence",
        Content: noteData.Content,
      }); 
      setSuccessMessage("Note updated!"); 
      setRefreshFlag(f => !f); 
    } catch (err) { 
      setError("Failed to update note"); 
      throw err;
    } 
  };

  const handleDeactivateNote = async (noteId) => { 
    try { 
      await deactivateNote(noteId); 
      setSuccessMessage("Note deactivated!"); 
      setRefreshFlag(f => !f); 
    } catch (err) { 
      setError("Failed to deactivate note"); 
      throw err;
    } 
  };

  const handleReactivateNote = async (noteId) => { 
    try { 
      await reactivateNote(noteId); 
      setSuccessMessage("Note reactivated!"); 
      setRefreshFlag(f => !f); 
    } catch (err) { 
      setError("Failed to reactivate note"); 
      throw err;
    } 
  };
  
  const handleAddAttachment = (sequence) => { setSelectedSequence(sequence); setAttachmentsPopupOpen(true); };
  const handleUploadAttachment = async (files) => { 
    try { 
      await Promise.all(files.map(f => uploadAttachment({ file: f, entityId: selectedSequence.SequenceID, entityTypeName: "Sequence" }))); 
      setSuccessMessage(`${files.length} attachment(s) uploaded!`); 
      setAttachmentsPopupOpen(false); 
      setRefreshFlag(f => !f); 
    } catch { setError("Failed to upload attachments"); }
  };
  const handleDeleteAttachment = async (id) => { try { await deleteAttachment(id); setSuccessMessage("Attachment deleted"); setRefreshFlag(f => !f); } catch { setError("Failed to delete attachment"); } };
  const handleDownloadAttachment = async (attachment) => { try { await downloadAttachment(attachment); } catch { setError("Failed to download attachment"); } };

  const clearFilters = () => { setSearchTerm(""); setStatusFilter(""); };

  // ---------------- FINAL FILTERED SEQUENCES ----------------
  const finalFilteredSequences = useMemo(() => {
    return filteredSequences.filter(s => {
      const matchesSearch = !searchTerm || s.SequenceName?.toLowerCase().includes(searchTerm.toLowerCase()) || s.SequenceDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || (statusFilter === "active" ? s.Active : !s.Active);
      return matchesSearch && matchesStatus;
    });
  }, [filteredSequences, searchTerm, statusFilter]);

  // ---------------- BULK ACTIONS ----------------
  const handleBulkDeactivate = async (selectedSequences) => {
    try {
      const activeSequences = selectedSequences.filter(s => s.Active);
      if (activeSequences.length === 0) { setError('No active sequences selected'); return; }
      await bulkDeactivateSequences(activeSequences.map(s => s.SequenceID));
      setSuccessMessage(`Deactivated ${activeSequences.length} sequence${activeSequences.length===1?'':'s'}`);
      setSelected([]);
      setRefreshFlag(f => !f);
    } catch { setError('Failed to deactivate sequences'); }
  };

  const handleBulkReactivate = async (selectedSequences) => {
    try {
      const inactiveSequences = selectedSequences.filter(s => !s.Active);
      if (inactiveSequences.length === 0) { setError('No inactive sequences selected'); return; }
      await bulkReactivateSequences(inactiveSequences.map(s => s.SequenceID));
      setSuccessMessage(`Reactivated ${inactiveSequences.length} sequence${inactiveSequences.length===1?'':'s'}`);
      setSelected([]);
      setRefreshFlag(f => !f);
    } catch { setError('Failed to reactivate sequences'); }
  };

  // ---------------- RENDER ----------------
  if (!canView) {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <>
      <SequencesPage
        sequences={finalFilteredSequences}
        loading={loading}
        error={error}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        selected={selected}
        onClearSelection={() => setSelected([])}
        userRole={roles}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkReactivate={handleBulkReactivate}
        onSelectClick={handleSelectClick}
        onSelectAllClick={handleSelectAllClick}
        onDeactivate={handleDeactivateClick}
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
        clearFilters={clearFilters}
        totalCount={allSequences.length}
        currentFilter={currentFilter}
      />

      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onEdit={handleEditNote}
        onDeactivate={handleDeactivateNote}
        onReactivate={handleReactivateNote}
        entityType="Sequence"
        entityId={selectedSequence?.SequenceID}
        entityName={selectedSequence?.SequenceName}
        showExistingNotes
      />

      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        entityType="Sequence"
        entityId={selectedSequence?.SequenceID}
        entityName={selectedSequence?.SequenceName}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Deactivate Sequence"
        description={`Are you sure you want to deactivate this sequence${sequenceToDelete?.SequenceName ? ` (${sequenceToDelete.SequenceName})` : ""}?`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default SequencesContainer;