import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Close,
  CloudUpload,
  AttachFile,
  Delete,
  GetApp,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
  VideoLibrary,
  AudioFile,
} from '@mui/icons-material';
import {
  uploadAttachment,
  uploadMultipleAttachments,
  getAttachmentsByEntity,
  downloadAttachment,
  deleteAttachment,
} from '../services/attachmentService';

const AttachmentsPopup = ({
  open,
  onClose,
  entityType = 'account',
  entityId,
  entityName,
  maxFileSize = 10,
  maxFiles = 5,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.mp3', '.txt', '.zip'],
  onAttachmentsChange,
}) => {
  const [attachments, setAttachments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Load attachments when dialog opens
  useEffect(() => {
    if (open && entityId && entityType) {
      loadAttachments();
      resetForm();
    }
  }, [open, entityId, entityType]);

  const resetForm = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    setError('');
  };

  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAttachmentsByEntity(entityId, entityType);
      setAttachments(Array.isArray(data) ? data : []);
      if (onAttachmentsChange) {
        onAttachmentsChange(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load attachments:', err);
      setError(err.message || 'Failed to load attachments');
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const validateFiles = (files) => {
    const errors = [];
    
    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }
    
    for (const file of files) {
      const ext = '.' + file.name.toLowerCase().split('.').pop();
      
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name} exceeds ${maxFileSize}MB limit`);
      }
      
      if (!acceptedFileTypes.includes(ext)) {
        errors.push(`${file.name} type not supported`);
      }
    }
    
    return errors;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validationErrors = validateFiles(files);
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setSelectedFiles(files);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setError('Please select at least one file');
      return;
    }

    if (!entityId || !entityType) {
      setError('Entity information is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Upload files sequentially with progress tracking
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(prev => ({ ...prev, [i]: 0 }));
        
        await uploadAttachment({
          file,
          entityId,
          entityTypeName: entityType
        });
        
        setUploadProgress(prev => ({ ...prev, [i]: 100 }));
      }
      
      // Reset form and reload attachments
      setSelectedFiles([]);
      setUploadProgress({});
      await loadAttachments();
      
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      setError('');
      await downloadAttachment(attachment);
    } catch (err) {
      console.error('Download failed:', err);
      setError(err.message || 'Failed to download file');
    }
  };

  const handleDelete = async (attachment) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const attachmentId = attachment.AttachmentID || attachment.attachmentId;
      
      if (!attachmentId) {
        throw new Error('Attachment ID not found');
      }
      
      await deleteAttachment(attachmentId);
      await loadAttachments();
      
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <InsertDriveFile />;
    
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const iconMap = {
      // Documents
      pdf: <PictureAsPdf />,
      doc: <Description />,
      docx: <Description />,
      xls: <Description />,
      xlsx: <Description />,
      txt: <Description />,
      
      // Images
      jpg: <Image />,
      jpeg: <Image />,
      png: <Image />,
      gif: <Image />,
      
      // Videos
      mp4: <VideoLibrary />,
      mov: <VideoLibrary />,
      avi: <VideoLibrary />,
      
      // Audio
      mp3: <AudioFile />,
      wav: <AudioFile />,
    };
    
    return iconMap[ext] || <InsertDriveFile />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);
    
    return `${size} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const validationErrors = validateFiles(files);
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setSelectedFiles(files);
    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachFile sx={{ color: '#059669' }} />
          <Typography variant="h6">Manage Attachments</Typography>
          {entityName && (
            <Chip 
              label={`${entityType}: ${entityName}`} 
              size="small" 
              sx={{ ml: 1 }} 
            />
          )}
        </Box>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* File Upload Section */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            border: '2px dashed #d1d5db',
            cursor: 'pointer',
            mb: 2,
            '&:hover': {
              borderColor: '#059669',
              backgroundColor: '#f0fdf4'
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CloudUpload sx={{ fontSize: 48, color: '#6b7280', mb: 1 }} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            Click to select files or drag and drop
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Max {maxFiles} files, {maxFileSize}MB each
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Supported: {acceptedFileTypes.join(', ')}
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </Paper>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Selected Files ({selectedFiles.length})
            </Typography>
            <List>
              {selectedFiles.map((file, idx) => (
                <ListItem 
                  key={`${file.name}-${idx}`}
                  sx={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 1, 
                    mb: 1,
                    position: 'relative'
                  }}
                >
                  <ListItemIcon>
                    {getFileIcon(file.name)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name} 
                    secondary={formatFileSize(file.size)} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                      disabled={loading}
                    >
                      <Close />
                    </IconButton>
                  </ListItemSecondaryAction>
                  {uploadProgress[idx] !== undefined && (
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress[idx]} 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        height: 3 
                      }} 
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Existing Attachments */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Existing Attachments ({attachments.length})
          </Typography>
          
          {loading && attachments.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : attachments.length > 0 ? (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {attachments.map((att, idx) => (
                <ListItem 
                  key={att.AttachmentID || att.attachmentId || idx}
                  sx={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 1, 
                    mb: 1 
                  }}
                >
                  <ListItemIcon>
                    {getFileIcon(att.FileName || att.fileName)}
                  </ListItemIcon>
                  <ListItemText
                    primary={att.FileName || att.fileName || 'Unknown'}
                    secondary={`Uploaded: ${formatDate(att.UploadedAt || att.uploadedAt)}`}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleDownload(att)}
                        disabled={loading}
                        title="Download"
                      >
                        <GetApp />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(att)}
                        disabled={loading}
                        sx={{ color: '#dc2626' }}
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No attachments found.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined" 
          disabled={loading}
        >
          Close
        </Button>
        
        {selectedFiles.length > 0 && (
          <Button
            onClick={handleUpload}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <CloudUpload />}
            disabled={loading}
            sx={{ 
              backgroundColor: '#059669', 
              '&:hover': { backgroundColor: '#047857' } 
            }}
          >
            Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentsPopup;