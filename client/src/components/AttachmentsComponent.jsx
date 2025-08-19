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

/**
 * Reusable Attachments Popup Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback when dialog closes
 * @param {Function} props.onUpload - Callback when files are uploaded (attachmentData) => void
 * @param {Function} props.onDelete - Optional callback when attachment is deleted (attachmentId) => void
 * @param {Function} props.onDownload - Optional callback when attachment is downloaded (attachment) => void
 * @param {string} props.entityType - Type of entity (e.g., 'account', 'contact', 'deal')
 * @param {string|number} props.entityId - ID of the entity
 * @param {string} props.entityName - Name of the entity for display
 * @param {Array} props.existingAttachments - Array of existing attachments to display
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Array} props.acceptedFileTypes - Accepted file types (default: common types)
 * @param {number} props.maxFileSize - Maximum file size in MB (default: 10)
 * @param {number} props.maxFiles - Maximum number of files (default: 5)
 * @param {boolean} props.showExisting - Whether to show existing attachments (default: true)
 * @param {boolean} props.allowMultiple - Whether to allow multiple file selection (default: true)
 * @param {Object} props.customTheme - Optional custom theme
 */
const AttachmentsPopup = ({
  open,
  onClose,
  onUpload,
  onDelete,
  onDownload,
  entityType = 'entity',
  entityId,
  entityName,
  existingAttachments = [],
  loading = false,
  error = null,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'],
  maxFileSize = 10,
  maxFiles = 5,
  showExisting = true,
  allowMultiple = true,
  customTheme,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedFiles([]);
      setUploadProgress({});
      setValidationError('');
    }
  }, [open]);

  // File type icons mapping
  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    const iconMap = {
      // Images
      jpg: <Image />, jpeg: <Image />, png: <Image />, gif: <Image />, svg: <Image />,
      // Documents
      pdf: <PictureAsPdf />,
      doc: <Description />, docx: <Description />,
      xls: <Description />, xlsx: <Description />,
      txt: <Description />, rtf: <Description />,
      // Media
      mp4: <VideoLibrary />, mov: <VideoLibrary />, avi: <VideoLibrary />,
      mp3: <AudioFile />, wav: <AudioFile />, m4a: <AudioFile />,
    };

    return iconMap[extension] || <InsertDriveFile />;
  };

  // File validation
  const validateFiles = (files) => {
    const errors = [];
    
    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    for (const file of files) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name} exceeds ${maxFileSize}MB limit`);
      }

      // Check file type
      const extension = '.' + file.name.toLowerCase().split('.').pop();
      if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(extension)) {
        errors.push(`${file.name} type not supported`);
      }
    }

    return errors;
  };

  // File selection handler
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const errors = validateFiles(files);

    if (errors.length > 0) {
      setValidationError(errors.join(', '));
      return;
    }

    setValidationError('');
    setSelectedFiles(files);
  };
  // Close handler
  const handleClose = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    setValidationError('');
    setLocalLoading(false);
    onClose();
  };
  
  // Upload handler
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setValidationError('Please select at least one file');
      return;
    }

    setLocalLoading(true);
    setValidationError('');

    try {
      // Simulate upload progress for each file
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const attachmentData = {
          file,
          FileName: file.name,
          FileSize: file.size,
          FileType: file.type || 'application/octet-stream',
          EntityType: entityType,
          EntityID: entityId,
          EntityName: entityName,
          UploadedAt: new Date().toISOString(),
        };

        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({
            ...prev,
            [index]: progress
          }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        return attachmentData;
      });

      const attachmentDataArray = await Promise.all(uploadPromises);
      
      // Call the provided upload handler
      await onUpload(attachmentDataArray);
      
      handleClose();
    } catch (error) {
      setValidationError('Failed to upload files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setLocalLoading(false);
      setUploadProgress({});
    }
  };

  // Download handler
  const handleDownload = (attachment) => {
    if (onDownload) {
      onDownload(attachment);
    } else if (attachment.FilePath || attachment.url) {
      // Default download behavior
      const link = document.createElement('a');
      link.href = attachment.FilePath || attachment.url;
      link.download = attachment.FileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '600px',
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
          <AttachFile sx={{ color: '#059669' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Manage Attachments
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

        {/* File Upload Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            Upload New Files
          </Typography>
          
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              border: '2px dashed #d1d5db',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#059669',
                backgroundColor: '#f0fdf4',
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload sx={{ fontSize: 48, color: '#6b7280', mb: 1 }} />
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Click to select files or drag and drop
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
              Maximum {maxFiles} files, {maxFileSize}MB each
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Supported: {acceptedFileTypes.join(', ')}
            </Typography>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple={allowMultiple}
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </Paper>

          {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                Selected Files ({selectedFiles.length})
              </Typography>
              <List>
                {selectedFiles.map((file, index) => (
                  <ListItem key={index} sx={{ border: '1px solid #e5e7eb', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      {getFileIcon(file.name)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={formatFileSize(file.size)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                        disabled={localLoading}
                      >
                        <Close />
                      </IconButton>
                    </ListItemSecondaryAction>
                    
                    {/* Upload Progress */}
                    {uploadProgress[index] !== undefined && (
                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress[index]} 
                          sx={{ height: 2 }}
                        />
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {/* Existing Attachments Section */}
        {showExisting && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Existing Attachments ({existingAttachments.length})
            </Typography>
            
            {existingAttachments.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {existingAttachments.map((attachment, index) => (
                  <ListItem
                    key={attachment.AttachmentID || index}
                    sx={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <ListItemIcon>
                      {getFileIcon(attachment.FileName || '')}
                    </ListItemIcon>
                    <ListItemText
                      primary={attachment.FileName || 'Unknown File'}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Size: {formatFileSize(attachment.FileSize)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Uploaded: {new Date(attachment.UploadedAt || attachment.CreatedAt).toLocaleDateString()}
                          </Typography>
                          {attachment.UploadedBy && (
                            <Typography variant="caption" display="block">
                              By: {attachment.UploadedBy}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(attachment)}
                          disabled={loading || localLoading}
                          title="Download"
                        >
                          <GetApp fontSize="small" />
                        </IconButton>
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={() => onDelete(attachment.AttachmentID)}
                            disabled={loading || localLoading}
                            sx={{ color: '#dc2626' }}
                            title="Delete"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  No attachments found for this {entityType}.
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
          {selectedFiles.length > 0 ? 'Cancel' : 'Close'}
        </Button>
        
        {selectedFiles.length > 0 && (
          <Button
            onClick={handleUpload}
            variant="contained"
            startIcon={loading || localLoading ? <CircularProgress size={16} /> : <CloudUpload />}
            disabled={loading || localLoading || selectedFiles.length === 0}
            sx={{
              backgroundColor: '#059669',
              '&:hover': { backgroundColor: '#047857' },
            }}
          >
            Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentsPopup;