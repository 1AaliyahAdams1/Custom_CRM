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
  Tooltip,
} from '@mui/material';
import {
  Close,
  Save,
  Note,
  Edit,
  Refresh,
  Cancel,
  BlockOutlined,
  RestoreFromTrash,
} from '@mui/icons-material';
import {
  createNote,
  updateNote,
  getNotesByEntity,
  deactivateNote,
  reactivateNote
} from '../services/noteService';

const NotesPopup = ({
  open,
  onClose,
  onSave,
  onEdit,
  entityType = 'entity',
  entityId,
  entityName,
  mode = 'create',
  initialNote = null,
  showExistingNotes = true,
  maxLength = 255,
  required = false,
  onNotesChange,
}) => {
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [existingNotes, setExistingNotes] = useState([]);
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showInactive, setShowInactive] = useState(true);

  // Initialize form data when dialog opens or initialNote changes
  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialNote) {
      setNoteContent(initialNote.Content || '');
      setEditingNoteId(initialNote.NoteID || null);
      setIsEditing(true);
    } else {
      setNoteContent('');
      setEditingNoteId(null);
      setIsEditing(false);
    }

    resetErrors();

    if (entityId && entityType && showExistingNotes) {
      fetchExistingNotes();
    }
  }, [open, mode, initialNote, entityId, entityType, showExistingNotes]);

  const resetErrors = () => {
    setValidationError('');
    setNotesError('');
    setSuccessMessage('');
  };

  // Fetch existing notes
  const fetchExistingNotes = async () => {
    // Add validation before attempting to fetch
    if (!entityId || !entityType) {
      console.warn('Cannot fetch notes: missing entityId or entityType', {
        entityId,
        entityType
      });
      return;
    }

    try {
      setFetchingNotes(true);
      setNotesError('');

      // Remove showInactive parameter - backend doesn't support it
      const notes = await getNotesByEntity(entityType, entityId);
      setExistingNotes(Array.isArray(notes) ? notes : []);

      if (onNotesChange) {
        onNotesChange(Array.isArray(notes) ? notes : []);
      }

    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setNotesError(err.message || 'Failed to load existing notes');
      setExistingNotes([]);
    } finally {
      setFetchingNotes(false);
    }
  };

  // Validation
  const validateNote = () => {
    const trimmedContent = noteContent.trim();

    if (required && !trimmedContent) {
      setValidationError('Note content is required');
      return false;
    }

    if (trimmedContent.length > maxLength) {
      setValidationError(`Note content must be ${maxLength} characters or less`);
      return false;
    }

    setValidationError('');
    return true;
  };

  // Save or update note
  const handleSave = async () => {
    if (!validateNote()) return;

    if (!entityId || !entityType) {
      setValidationError('Entity information is required');
      return;
    }

    setLoading(true);
    resetErrors();

    try {
      const noteData = {
        Content: noteContent.trim(),
        EntityType: entityType,
        EntityID: entityId,
      };

      let result;

      if (editingNoteId) {
        // Update existing note
        result = await updateNote(editingNoteId, noteData);
        setSuccessMessage('Note updated successfully');

        if (onEdit) {
          await onEdit(result);
        }
      } else {
        // Create new note
        result = await createNote(noteData);
        setSuccessMessage('Note created successfully');

        if (onSave) {
          await onSave(result);
        }
      }

      // Reset form
      setNoteContent('');
      setEditingNoteId(null);
      setIsEditing(false);

      // Refresh the notes list
      await fetchExistingNotes();

    } catch (err) {
      console.error('Failed to save note:', err);
      setValidationError(err.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note) => {
    if (!note.Active) return; // Can't edit inactive notes
    setNoteContent(note.Content || '');
    setEditingNoteId(note.NoteID);
    setIsEditing(true);
    resetErrors();
  };

  const handleCancelEdit = () => {
    setNoteContent('');
    setEditingNoteId(null);
    setIsEditing(false);
    resetErrors();
  };

  const handleDeactivateNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to deactivate this note? It can be reactivated later.')) {
      return;
    }

    setLoading(true);
    resetErrors();

    try {
      await deactivateNote(noteId);
      setSuccessMessage('Note deactivated successfully');
      await fetchExistingNotes();

    } catch (err) {
      console.error('Failed to deactivate note:', err);
      setNotesError(err.message || 'Failed to deactivate note');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to reactivate this note?')) {
      return;
    }

    setLoading(true);
    resetErrors();

    try {
      await reactivateNote(noteId);
      setSuccessMessage('Note reactivated successfully');
      await fetchExistingNotes();

    } catch (err) {
      console.error('Failed to reactivate note:', err);
      setNotesError(err.message || 'Failed to reactivate note');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNoteContent('');
    setEditingNoteId(null);
    setIsEditing(false);
    resetErrors();
    onClose();
  };

  const handleRefreshNotes = () => {
    fetchExistingNotes();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const canSave = noteContent.trim().length > 0 && !validationError;
  const characterCount = noteContent.length;
  const isNearLimit = characterCount > maxLength * 0.8;

  // Separate active and inactive notes
  const activeNotes = existingNotes.filter(note => note.Active === 1 || note.Active === true);
  const inactiveNotes = existingNotes.filter(note => note.Active === 0 || note.Active === false);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {/* Dialog Title */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
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
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 2 }}>
        {/* Alerts */}
        {notesError && <Alert severity="error" sx={{ mb: 2 }}>{notesError}</Alert>}
        {validationError && <Alert severity="warning" sx={{ mb: 2 }}>{validationError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

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
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: isNearLimit ? '#d32f2f' : 'inherit' }}>
                  {characterCount}/{maxLength} characters
                </span>
              </Box>
            }
            disabled={loading}
          />
          {isEditing && (
            <Button
              onClick={handleCancelEdit}
              startIcon={<Cancel />}
              sx={{ mt: 1 }}
              size="small"
            >
              Cancel Edit
            </Button>
          )}
        </Box>

        {/* Existing Notes Section */}
        {showExistingNotes && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Active Notes ({activeNotes.length})
              </Typography>
              <IconButton size="small" onClick={handleRefreshNotes} disabled={fetchingNotes || loading}>
                <Refresh />
              </IconButton>
            </Box>

            {fetchingNotes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {/* Active Notes */}
                {activeNotes.length > 0 ? (
                  <List sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
                    {activeNotes.map((note, idx) => (
                      <ListItem
                        key={note.NoteID || idx}
                        sx={{
                          backgroundColor: '#f9fafb',
                          borderRadius: 1,
                          mb: 1,
                          border: '1px solid #e5e7eb',
                          alignItems: 'flex-start',
                        }}
                      >
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ lineHeight: 1.5 }}>{note.Content}</Typography>}
                          secondary={
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              Created: {formatDate(note.CreatedAt)}
                              {note.CreatedBy && ` by User ${note.CreatedBy}`}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditNote(note)} disabled={loading}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Deactivate">
                              <IconButton
                                size="small"
                                onClick={() => handleDeactivateNote(note.NoteID)}
                                disabled={loading}
                                sx={{ color: '#dc2626' }}
                              >
                                <BlockOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      No active notes found for this {entityType}.
                    </Typography>
                  </Box>
                )}

                {/* Inactive Notes */}
                {inactiveNotes.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, color: '#6b7280' }}>
                      Deactivated Notes ({inactiveNotes.length})
                    </Typography>
                    <List sx={{ maxHeight: 150, overflow: 'auto' }}>
                      {inactiveNotes.map((note, idx) => (
                        <ListItem
                          key={note.NoteID || idx}
                          sx={{
                            backgroundColor: '#f3f4f6',
                            borderRadius: 1,
                            mb: 1,
                            border: '1px solid #d1d5db',
                            alignItems: 'flex-start',
                            opacity: 0.6,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ lineHeight: 1.5, textDecoration: 'line-through', color: '#6b7280' }}>
                                {note.Content}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                Created: {formatDate(note.CreatedAt)}
                                {note.CreatedBy && ` by User ${note.CreatedBy}`}
                              </Typography>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Reactivate">
                              <IconButton
                                size="small"
                                onClick={() => handleReactivateNote(note.NoteID)}
                                disabled={loading}
                                sx={{ color: '#16a34a' }}
                              >
                                <RestoreFromTrash fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Close
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
          disabled={!canSave || loading}
          sx={{ backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
        >
          {isEditing ? 'Update Note' : 'Save Note'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotesPopup;