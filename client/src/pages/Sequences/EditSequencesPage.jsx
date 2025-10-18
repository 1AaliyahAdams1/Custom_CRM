import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Skeleton,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Chip,
} from '@mui/material';
import { 
  ArrowBack, 
  Save, 
  Clear, 
  Add,
  MoreVert,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { 
  fetchSequenceById, 
  updateSequence, 
  fetchSequenceWithItems,
  createSequenceItem,
  updateSequenceItem,
  deleteSequenceItem,
  getAllActivityTypes,
} from "../../services/sequenceService";
import theme from "../../components/Theme";
import ConfirmDialog from '../../components/dialogs/ConfirmDialog';
import ActionMenu from '../../components/tableFormat/ActionMenu';

const EditSequencesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [formData, setFormData] = useState({
    SequenceName: "",
    SequenceDescription: "",
    Active: true,
  });
  
  const [sequenceItems, setSequenceItems] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state for adding/editing items
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    ActivityTypeID: '',
    SequenceItemDescription: '',
    DaysFromStart: 0,
  });
  const [itemErrors, setItemErrors] = useState({});
  
  // Action menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  
  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null,
  });

  const requiredFields = ['SequenceName'];

  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#ff4444', marginRight: '4px' }}>✗</span>
        {fieldErrors[fieldName][0]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;
  };

  const validateField = (name, value) => {
    const errors = [];
    const strValue = value?.toString().trim();

    if (requiredFields.includes(name) && (!strValue || strValue === '')) {
      errors.push('This field is required.');
    }

    if (strValue) {
      if (name === 'SequenceName') {
        if (strValue.length < 1) {
          errors.push('Sequence name is required');
        }
        if (strValue.length > 255) {
          errors.push('Sequence name cannot exceed 255 characters.');
        }
      }

      if (name === 'SequenceDescription') {
        if (strValue.length > 2000) {
          errors.push('Description cannot exceed 2000 characters.');
        }
      }
    }

    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const errors = validateField(field, formData[field]);
      if (errors.length > 0) newErrors[field] = errors;
    });
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const validateItemForm = () => {
    const errors = {};
    
    if (!itemFormData.ActivityTypeID) {
      errors.ActivityTypeID = 'Activity type is required';
    }
    
    if (!itemFormData.SequenceItemDescription?.trim()) {
      errors.SequenceItemDescription = 'Description is required';
    } else if (itemFormData.SequenceItemDescription.length > 255) {
      errors.SequenceItemDescription = 'Description cannot exceed 255 characters';
    }
    
    const daysValue = itemFormData.DaysFromStart?.toString().trim();
    
    if (daysValue === '' || daysValue === undefined || daysValue === null) {
      errors.DaysFromStart = 'Days from start is required';
    } else {
      const numValue = Number(daysValue);
      if (isNaN(numValue) || !Number.isInteger(numValue)) {
        errors.DaysFromStart = 'Must be a valid whole number';
      } else if (numValue < 0) {
        errors.DaysFromStart = 'Days from start cannot be negative';
      } else if (numValue > 32767) {
        errors.DaysFromStart = 'Days from start cannot exceed 32767';
      }
    }
    
    setItemErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("No sequence ID provided");
        setLoading(false);
        return;
      }
      try {
        // Load activity types
        const types = await getAllActivityTypes();
        setActivityTypes(types || []);
        
        // Load sequence with items
        const response = await fetchSequenceWithItems(id);
        const sequenceData = response.data || response;
        
        setFormData({
          SequenceName: sequenceData.SequenceName || "",
          SequenceDescription: sequenceData.SequenceDescription || "",
          Active: sequenceData.Active !== undefined ? sequenceData.Active : true,
        });
        
        setSequenceItems(sequenceData.Items || []);
      } catch (err) {
        console.error('Error loading sequence:', err);
        setError("Failed to load sequence data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    setTouched(prev => ({ ...prev, [name]: true }));

    if (touched[name]) {
      const errors = validateField(name, val);
      setFieldErrors(prev => ({
        ...prev,
        [name]: errors.length > 0 ? errors : undefined
      }));
    }

    if (error) {
      setError(null);
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    const errors = validateField(name, val);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors.length > 0 ? errors : undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors below before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await updateSequence(id, formData);
      setSuccessMessage("Sequence updated successfully!");
      setTimeout(() => navigate("/sequences"), 1500);
    } catch (error) {
      console.error('Error updating sequence:', error);
      
      if (error.response?.status === 409) {
        setError('Sequence with this name already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to update sequence. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Item management functions
  const handleOpenItemDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemFormData({
        ActivityTypeID: item.ActivityTypeID,
        SequenceItemDescription: item.SequenceItemDescription,
        DaysFromStart: item.DaysFromStart,
      });
    } else {
      setEditingItem(null);
      setItemFormData({
        ActivityTypeID: '',
        SequenceItemDescription: '',
        DaysFromStart: sequenceItems.length > 0 
          ? Math.max(...sequenceItems.map(i => i.DaysFromStart)) + 1 
          : 0,
      });
    }
    setItemErrors({});
    setItemDialogOpen(true);
  };

  const handleCloseItemDialog = () => {
    setItemDialogOpen(false);
    setEditingItem(null);
    setItemFormData({
      ActivityTypeID: '',
      SequenceItemDescription: '',
      DaysFromStart: 0,
    });
    setItemErrors({});
  };

  const handleItemFormChange = (e) => {
    const { name, value } = e.target;

    setItemFormData(prev => ({ ...prev, [name]: value }));

    // Validate the field immediately
    const errors = {};

    if (name === 'ActivityTypeID' && !value) {
      errors.ActivityTypeID = 'Activity type is required';
    }

    if (name === 'SequenceItemDescription') {
      if (!value?.trim()) {
        errors.SequenceItemDescription = 'Description is required';
      } else if (value.length > 255) {
        errors.SequenceItemDescription = 'Description cannot exceed 255 characters';
      }
    }

    if (name === 'DaysFromStart') {
      const daysValue = value?.toString().trim();

      if (daysValue === '' || daysValue === undefined || daysValue === null) {
        errors.DaysFromStart = 'Days from start is required';
      } else {
        const numValue = Number(daysValue);
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
          errors.DaysFromStart = 'Must be a valid whole number';
        } else if (numValue < 0) {
          errors.DaysFromStart = 'Days from start cannot be negative';
        } else if (numValue > 32767) {
          errors.DaysFromStart = 'Days from start cannot exceed 32767';
        }
      }
    }

    setItemErrors(prev => ({
      ...prev,
      ...errors,
      [name]: errors[name] || undefined
    }));
  };

  const handleSaveItem = async () => {
    if (!validateItemForm()) return;

    try {
      const itemDataToSave = {
        ...itemFormData,
        DaysFromStart: parseInt(itemFormData.DaysFromStart, 10),
      };

      if (editingItem) {
        // Update existing item
        await updateSequenceItem(editingItem.SequenceItemID, itemDataToSave);

        setSequenceItems(prev => prev.map(item =>
          item.SequenceItemID === editingItem.SequenceItemID
            ? {
                ...item,
                ...itemDataToSave,
                ActivityTypeName: activityTypes.find(t => t.TypeID === itemDataToSave.ActivityTypeID)?.TypeName
              }
            : item
        ));

        setSuccessMessage('Sequence item updated successfully');
      } else {
        // Create new item
        const response = await createSequenceItem({
          ...itemDataToSave,
          SequenceID: parseInt(id),
        });

        const newItemId = response.data?.SequenceItemID || response.SequenceItemID;

        setSequenceItems(prev => [...prev, {
          SequenceItemID: newItemId,
          ...itemDataToSave,
          ActivityTypeName: activityTypes.find(t => t.TypeID === itemDataToSave.ActivityTypeID)?.TypeName,
          Active: true,
        }].sort((a, b) => a.DaysFromStart - b.DaysFromStart));

        setSuccessMessage('Sequence item added successfully');
      }

      handleCloseItemDialog();
    } catch (err) {
      console.error('Error saving sequence item:', err);
      setError(err.response?.data?.error || 'Failed to save sequence item');
    }
  };

  const handleDeactivateItem = async (item) => {
    try {
      const updateData = {
        ActivityTypeID: item.ActivityTypeID,
        SequenceItemDescription: item.SequenceItemDescription,
        DaysFromStart: item.DaysFromStart,
        Active: false
      };
      
      await updateSequenceItem(item.SequenceItemID, updateData);
      
      setSequenceItems(prev => prev.map(i =>
        i.SequenceItemID === item.SequenceItemID
          ? { ...i, Active: false }
          : i
      ));
      
      setSuccessMessage('Sequence item deactivated successfully');
    } catch (err) {
      console.error('Error deactivating item:', err);
      setError(err.response?.data?.error || 'Failed to deactivate sequence item');
    }
  };

  const handleReactivateItem = async (item) => {
    try {
      const updateData = {
        ActivityTypeID: item.ActivityTypeID,
        SequenceItemDescription: item.SequenceItemDescription,
        DaysFromStart: item.DaysFromStart,
        Active: true
      };
      
      await updateSequenceItem(item.SequenceItemID, updateData);
      
      setSequenceItems(prev => prev.map(i =>
        i.SequenceItemID === item.SequenceItemID
          ? { ...i, Active: true }
          : i
      ));
      
      setSuccessMessage('Sequence item reactivated successfully');
    } catch (err) {
      console.error('Error reactivating item:', err);
      setError(err.response?.data?.error || 'Failed to reactivate sequence item');
    }
  };

  const handleOpenActionMenu = (event, item) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(item);
  };

  const handleCloseActionMenu = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleEdit = (item) => {
    handleOpenItemDialog(item);
  };

  const handleDeactivate = (item) => {
    setConfirmDialog({
      open: true,
      title: 'Deactivate Sequence Item',
      description: `Are you sure you want to deactivate "${item.SequenceItemDescription}"? This item will no longer be used in the sequence.`,
      onConfirm: () => {
        handleDeactivateItem(item);
        handleConfirmDialogClose();
      },
    });
  };

  const handleReactivate = (item) => {
    setConfirmDialog({
      open: true,
      title: 'Reactivate Sequence Item',
      description: `Are you sure you want to reactivate "${item.SequenceItemDescription}"?`,
      onConfirm: () => {
        handleReactivateItem(item);
        handleConfirmDialogClose();
      },
    });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      description: '',
      onConfirm: null,
    });
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Edit Sequence
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Clear />} 
                onClick={() => navigate("/sequences")} 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />} 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                sx={{
                  backgroundColor: '#050505',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                {isSubmitting ? 'Updating...' : 'Update Sequence'}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Sequence Information
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
                <TextField
                  label="Sequence Name"
                  name="SequenceName"
                  value={formData.SequenceName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  disabled={isSubmitting}
                  error={isFieldInvalid('SequenceName')}
                  helperText={getFieldError('SequenceName')}
                  FormHelperTextProps={{ component: 'div' }}
                />

                <TextField
                  label="Description"
                  name="SequenceDescription"
                  value={formData.SequenceDescription}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isSubmitting}
                  error={isFieldInvalid('SequenceDescription')}
                  helperText={getFieldError('SequenceDescription') || 'Optional: Describe the purpose and workflow of this sequence'}
                  FormHelperTextProps={{ component: 'div' }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.Active}
                      onChange={handleInputChange}
                      name="Active"
                      disabled={isSubmitting}
                    />
                  }
                  label="Active (sequence is ready to use)"
                />
              </Box>
            </form>
          </Paper>

          {/* Sequence Items Section */}
          <Paper elevation={0} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sequence Items ({sequenceItems.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenItemDialog()}
                sx={{
                  backgroundColor: '#050505',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                Add Item
              </Button>
            </Box>

            {sequenceItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography>No sequence items yet. Add items to define the workflow steps.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="80px">Day</TableCell>
                      <TableCell>Activity Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell width="100px" align="center">Status</TableCell>
                      <TableCell width="120px" align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sequenceItems
                      .sort((a, b) => a.DaysFromStart - b.DaysFromStart)
                      .map((item) => (
                        <TableRow key={item.SequenceItemID} hover>
                          <TableCell>
                            <Chip 
                              label={`Day ${item.DaysFromStart}`} 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>{item.ActivityTypeName}</TableCell>
                          <TableCell>
                            <Tooltip title={item.SequenceItemDescription}>
                              <span>
                                {item.SequenceItemDescription.length > 60
                                  ? `${item.SequenceItemDescription.substring(0, 60)}...`
                                  : item.SequenceItemDescription}
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={item.Active ? 'Active' : 'Inactive'}
                              size="small"
                              color={item.Active ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenActionMenu(e, item)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Add/Edit Item Dialog */}
      <Dialog 
        open={itemDialogOpen} 
        onClose={handleCloseItemDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? 'Edit Sequence Item' : 'Add Sequence Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Days from Start"
              name="DaysFromStart"
              type="text"
              value={itemFormData.DaysFromStart}
              onChange={handleItemFormChange}
              fullWidth
              required
              error={!!itemErrors.DaysFromStart}
              helperText={itemErrors.DaysFromStart || 'Which day in the sequence should this activity occur?'}
            />

            <FormControl fullWidth required error={!!itemErrors.ActivityTypeID}>
              <InputLabel>Activity Type</InputLabel>
              <Select
                name="ActivityTypeID"
                value={itemFormData.ActivityTypeID}
                onChange={handleItemFormChange}
                label="Activity Type"
              >
                {activityTypes.map((type) => (
                  <MenuItem key={type.TypeID} value={type.TypeID}>
                    {type.TypeName}
                  </MenuItem>
                ))}
              </Select>
              {itemErrors.ActivityTypeID && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {itemErrors.ActivityTypeID}
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Description"
              name="SequenceItemDescription"
              value={itemFormData.SequenceItemDescription}
              onChange={handleItemFormChange}
              fullWidth
              required
              multiline
              rows={3}
              error={!!itemErrors.SequenceItemDescription}
              helperText={itemErrors.SequenceItemDescription || 'Describe what should be done in this step'}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseItemDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveItem} 
            variant="contained"
            sx={{
              backgroundColor: '#050505',
              '&:hover': { backgroundColor: '#333333' },
            }}
          >
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <ActionMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseActionMenu}
        menuRow={menuRow}
        idField="SequenceItemID"
        entityType="sequenceItem"
        onEdit={handleEdit}
        onDelete={handleDeactivate}
        onReactivate={handleReactivate}
        tooltips={{
          actionMenu: {
            edit: "Edit this sequence item",
            delete: "Deactivate this sequence item",
            reactivate: "Reactivate this sequence item"
          }
        }}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={handleConfirmDialogClose}
      />
    </ThemeProvider>
  );
};

export default EditSequencesPage;