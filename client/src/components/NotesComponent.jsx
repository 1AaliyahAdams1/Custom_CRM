import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Close,
  Save,
  Add,
  Note,
  Delete,
  Edit,
  Refresh,
} from '@mui/icons-material';
import { noteService } from '../services/noteService';

/**
 * Reusable Notes Popup Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback when dialog closes
 * @param {Function} props.onSave - Callback when note is saved (noteData) => void
 * @param {Function} props.onDelete - Optional callback when note is deleted (noteId) => void
 * @param {Function} props.onEdit - Optional callback when note is edited (noteData) => void
 * @param {string} props.entityType - Type of entity (e.g., 'account', 'contact', 'deal')
 * @param {string|number} props.entityId - ID of the entity
 * @param {string} props.entityName - Name of the entity for display
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.mode - 'create' | 'view' | 'edit' (default: 'create')
 * @param {Object} props.initialNote - Initial note data for editing
 * @param {boolean} props.showExistingNotes - Whether to show list of existing notes (default: true)
 * @param {string} props.maxLength - Maximum length for note content (default: 1000)
 * @param {boolean} props.required - Whether note content is required (default: true)
 */
const NotesPopup = ({
  open,
  onClose,
  onSave,
  onDelete,
  onEdit,
  entityType = 'entity',
  entityId,
  entityName,
  loading = false,
  error = null,
  mode = 'create',
  initialNote = null,
  showExistingNotes = true,
  maxLength = 1000,
  required = true,
}) => {
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [existingNotes, setExistingNotes] = useState([]);
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');

  // Initialize form data when dialog opens or initialNote changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialNote) {
        setNoteContent(initialNote.Content || '');
        setEditingNoteId(initialNote.NoteID || null);
      } else {
        setNoteContent('');
        setEditingNoteId(null);
      }
      setValidationError('');
      
      // Fetch existing notes when dialog opens
      if (entityId && entityType && showExistingNotes) {
        fetchExistingNotes();
      }
    }
  }, [open, mode, initialNote, entityId, entityType, showExistingNotes]);

  // Fetch existing notes
  const fetchExistingNotes = async () => {
    try {
      setFetchingNotes(true);
      setNotesError('');
      const notes = await noteService.getNotesByEntity(entityType, entityId);
      setExistingNotes(notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotesError('Failed to load existing notes');
      setExistingNotes([]);
    } finally {
      setFetchingNotes(false);
    }
  };

  // Validation
  const validateNote = () => {
    if (required && !noteContent.trim()) {
      setValidationError('Note content is required');
      return false;
    }
    if (noteContent.length > maxLength) {
      setValidationError(`Note content must be ${maxLength} characters or less`);
      return false;
    }
    setValidationError('');
    return true;
  };

  // Handlers
  const handleSave = async () => {
    if (!validateNote()) return;

    setLocalLoading(true);
    try {
      const noteData = {
        Content: noteContent.trim(),
        EntityType: entityType,
        EntityID: entityId,
        EntityName: entityName,
        CreatedAt: new Date().toISOString(),
        ...(editingNoteId && { NoteID: editingNoteId }),
      };

      if (editingNoteId) {
        // Update existing note
        await noteService.updateNote(editingNoteId, noteData);
        if (onEdit) await onEdit(noteData);
      } else {
        // Create new note
        await noteService.createNote(noteData);
        if (onSave) await onSave(noteData);
      }

      // Refresh the notes list
      await fetchExistingNotes();
      
      // Reset form
      setNoteContent('');
      setEditingNoteId(null);
      setValidationError('');

    } catch (error) {
      console.error('Failed to save note:', error);
      setValidationError(error.message || 'Failed to save note');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setNoteContent(note.Content || '');
    setEditingNoteId(note.NoteID);
    setValidationError('');
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setLocalLoading(true);
    try {
      await noteService.deleteNote(noteId);
      if (onDelete) await onDelete(noteId);
      
      // Refresh the notes list
      await fetchExistingNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
      setNotesError(error.message || 'Failed to delete note');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    setNoteContent('');
    setEditingNoteId(null);
    setValidationError('');
    setNotesError('');
    onClose();
  };

  const handleRefreshNotes = () => {
    fetchExistingNotes();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const isEditing = editingNoteId !== null;
  const canSave = noteContent.trim() && !validationError;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '500px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Note sx={{ color: '#2563eb' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEditing ? 'Edit Note' : 'Add Note'}
          </Typography>
          {entityName && (
            <Chip 
              label={`${entityType}: ${entityName}`}
              size="small"
              sx={{ ml: 1, backgroundColor: '#f3f4f6' }}
            />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {validationError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        {notesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {notesError}
          </Alert>
        )}

        {/* Note Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            {isEditing ? 'Edit Note Content' : 'Note Content'} 
            {required && <span style={{ color: '#d32f2f' }}>*</span>}
          </Typography>
          <TextField
            multiline
            rows={4}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={`Add a note about this ${entityType}...`}
            fullWidth
            variant="outlined"
            error={!!validationError}
            helperText={`${noteContent.length}/${maxLength} characters`}
            disabled={loading || localLoading}
          />
        </Box>

        {/* Existing Notes Section */}
        {showExistingNotes && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Existing Notes ({existingNotes.length})
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleRefreshNotes}
                disabled={fetchingNotes || localLoading}
              >
                <Refresh />
              </IconButton>
            </Box>

            {fetchingNotes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : existingNotes.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {existingNotes.map((note, index) => (
                  <React.Fragment key={note.NoteID || index}>
                    <ListItem
                      sx={{
                        backgroundColor: '#f9fafb',
                        borderRadius: 1,
                        mb: 1,
                        border: '1px solid #e5e7eb',
                        alignItems: 'flex-start',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                            {note.Content}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            Created: {formatDate(note.CreatedAt)}
                            {note.CreatedBy && ` by ${note.CreatedBy}`}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditNote(note)}
                            disabled={loading || localLoading}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteNote(note.NoteID)}
                            disabled={loading || localLoading}
                            sx={{ color: '#dc2626' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  No notes found for this {entityType}.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: '#e5e5e5',
            color: '#666666',
          }}
          disabled={loading || localLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={loading || localLoading ? <CircularProgress size={16} /> : <Save />}
          disabled={!canSave || loading || localLoading}
          sx={{
            backgroundColor: '#2563eb',
            '&:hover': { backgroundColor: '#1d4ed8' },
          }}
        >
          {isEditing ? 'Update Note' : 'Save Note'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotesPopup;