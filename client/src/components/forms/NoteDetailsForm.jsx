import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, IconButton } from "@mui/material";
import { Delete, Edit, Save, Cancel, RestoreFromTrash } from "@mui/icons-material";
import { 
  createNote,
  updateNote,
  deactivateNote,
  reactivateNote,
  getNotesByEntity
} from "../../services/noteService";

const NoteDetailsForm = ({ entityType, entityId, onUpdated }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // Fetch notes (including inactive ones)
  const loadNotes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getNotesByEntity(entityType, entityId, true);
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId && entityType) {
      loadNotes();
    }
  }, [entityId, entityType]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      setLoading(true);
      setError("");
      await createNote({ 
        Content: newNote.trim(), 
        EntityType: entityType, 
        EntityID: entityId 
      });
      setNewNote("");
      await loadNotes();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note) => {
    // Don't allow editing inactive notes
    if (!note.Active) return;
    setEditingNoteId(note.NoteID);
    setEditingContent(note.Content);
  };

  const handleSaveEdit = async (noteId) => {
    if (!editingContent.trim()) return;
    try {
      setLoading(true);
      setError("");
      await updateNote(noteId, { 
        EntityID: entityId,
        EntityType: entityType,
        Content: editingContent.trim()
      });
      setEditingNoteId(null);
      setEditingContent("");
      await loadNotes();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent("");
    setError("");
  };

  const handleDeactivateNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to deactivate this note?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      await deactivateNote(noteId);
      await loadNotes();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || "Failed to deactivate note");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to reactivate this note?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      await reactivateNote(noteId);
      await loadNotes();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || "Failed to reactivate note");
    } finally {
      setLoading(false);
    }
  };

  // Separate active and inactive notes
  const activeNotes = notes.filter(note => note.Active === 1 || note.Active === true);
  const inactiveNotes = notes.filter(note => note.Active === 0 || note.Active === false);

  return (
    <Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* New Note Input */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Add new note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={loading}
          multiline
          rows={2}
        />
        <Button 
          variant="contained" 
          onClick={handleAddNote} 
          disabled={loading || !newNote.trim()}
          sx={{ minWidth: 100 }}
        >
          Add
        </Button>
      </Box>

      {/* Active Notes List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {activeNotes.length === 0 && inactiveNotes.length === 0 && (
          <Typography color="text.secondary">No notes found</Typography>
        )}
        
        {activeNotes.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Active Notes ({activeNotes.length})
            </Typography>
            {activeNotes.map((note) => (
              <Paper
                key={note.NoteID}
                sx={{ 
                  p: 2, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  backgroundColor: "#f9fafb"
                }}
              >
                {editingNoteId === note.NoteID ? (
                  <Box sx={{ display: "flex", flex: 1, gap: 1, alignItems: "center" }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      disabled={loading}
                    />
                    <IconButton 
                      onClick={() => handleSaveEdit(note.NoteID)} 
                      disabled={loading || !editingContent.trim()}
                      color="primary"
                    >
                      <Save />
                    </IconButton>
                    <IconButton onClick={handleCancelEdit} disabled={loading}>
                      <Cancel />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ mb: 0.5 }}>{note.Content}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(note.CreatedAt).toLocaleDateString()}
                        {note.CreatedBy && ` by User ${note.CreatedBy}`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton 
                        onClick={() => handleEditNote(note)} 
                        disabled={loading}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeactivateNote(note.NoteID)} 
                        disabled={loading}
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </>
                )}
              </Paper>
            ))}
          </>
        )}

        {/* Inactive Notes List */}
        {inactiveNotes.length > 0 && (
          <>
            <Typography 
              variant="subtitle2" 
              sx={{ fontWeight: 600, mb: 1, mt: 2, color: "#6b7280" }}
            >
              Deactivated Notes ({inactiveNotes.length})
            </Typography>
            {inactiveNotes.map((note) => (
              <Paper
                key={note.NoteID}
                sx={{ 
                  p: 2, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  backgroundColor: "#f3f4f6",
                  opacity: 0.7
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    sx={{ 
                      mb: 0.5, 
                      textDecoration: "line-through",
                      color: "#6b7280" 
                    }}
                  >
                    {note.Content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(note.CreatedAt).toLocaleDateString()}
                    {note.CreatedBy && ` by User ${note.CreatedBy}`}
                  </Typography>
                </Box>
                <Box>
                  <IconButton 
                    onClick={() => handleReactivateNote(note.NoteID)} 
                    disabled={loading}
                    size="small"
                    color="success"
                  >
                    <RestoreFromTrash />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default NoteDetailsForm;