import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, IconButton } from "@mui/material";
import { Delete, Edit, Save, Cancel } from "@mui/icons-material";
import { 
  createNote, 
  getNotesByEntity, 
  updateNote, 
  deleteNote 
} from "../../services/noteService";

const NoteDetailsForm = ({ entityType, entityId, onUpdated }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // Fetch notes
  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await getNotesByEntity(entityType, entityId);
      setNotes(data || []);
    } catch (err) {
      setError(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [entityId, entityType]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      setLoading(true);
      await createNote({ Content: newNote, EntityType: entityType, EntityID: entityId });
      setNewNote("");
      await loadNotes();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      setLoading(true);
      await deleteNote(noteId);
      await loadNotes();
    } catch (err) {
      setError(err.message || "Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.NoteID);
    setEditingContent(note.Content);
  };

  const handleSaveEdit = async (noteId) => {
    if (!editingContent.trim()) return;
    try {
      setLoading(true);
      await updateNote(noteId, { Content: editingContent });
      setEditingNoteId(null);
      setEditingContent("");
      await loadNotes();
    } catch (err) {
      setError(err.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  return (
    <Box>
      {error && <Typography color="error">{error}</Typography>}

      {/* New Note Input */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Add new note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={loading}
        />
        <Button variant="contained" onClick={handleAddNote} disabled={loading || !newNote.trim()}>
          Add
        </Button>
      </Box>

      {/* Notes List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {notes.length === 0 && <Typography>No notes found</Typography>}
        {notes.map((note) => (
          <Paper
            key={note.NoteID}
            sx={{ p: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            {editingNoteId === note.NoteID ? (
              <Box sx={{ display: "flex", flex: 1, gap: 1 }}>
                <TextField
                  fullWidth
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  disabled={loading}
                />
                <IconButton onClick={() => handleSaveEdit(note.NoteID)} disabled={loading}>
                  <Save />
                </IconButton>
                <IconButton onClick={handleCancelEdit} disabled={loading}>
                  <Cancel />
                </IconButton>
              </Box>
            ) : (
              <>
                <Typography sx={{ flex: 1 }}>{note.Content}</Typography>
                <Box>
                  <IconButton onClick={() => handleEditNote(note)} disabled={loading}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteNote(note.NoteID)} disabled={loading}>
                    <Delete />
                  </IconButton>
                </Box>
              </>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default NoteDetailsForm;
