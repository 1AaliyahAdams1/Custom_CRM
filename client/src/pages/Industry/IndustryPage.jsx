import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
} from "@mui/material";
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Note as NoteIcon,
  AttachFile as AttachFileIcon,
  PowerOff as PowerOffIcon,
  Power as PowerIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const IndustryPage = ({
  industries = [],
  loading = false,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  statusMessage,
  statusSeverity,
  setStatusMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onReactivate,
  onDelete,
  onBulkDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onAssignUser,
  selectedIndustry,
}) => {
  // Add Industry Dialog State
  const [addIndustryDialogOpen, setAddIndustryDialogOpen] = useState(false);
  const [newIndustry, setNewIndustry] = useState({
    IndustryName: '',
    Active: true
  });
  const [addIndustryLoading, setAddIndustryLoading] = useState(false);

  const columns = [
    { field: 'IndustryName', headerName: 'Industry Name', type: 'tooltip', defaultVisible: true },
    {
      field: 'Active',
      headerName: 'Status',
      type: 'chip',
      chipLabels: { true: 'Active', false: 'Inactive', 1: 'Active', 0: 'Inactive' },
      chipColors: { true: '#079141ff', false: '#999999', 1: '#079141ff', 0: '#999999' },
      defaultVisible: true,
    },
  ];

  // Enhanced menu items for industries
  const getMenuItems = (industry) => {
    const isActive = industry.Active === true || industry.Active === 1;
    
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(industry),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(industry),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(industry),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(industry),
        show: !!onAddAttachment,
      },
    ];

    // Add reactivate/deactivate based on current status
    if (isActive) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(industry.IndustryID),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(industry.IndustryID),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(industry.IndustryID),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for industry-specific fields
  const industryFormatters = {
    ...formatters,
    Active: (value) => {
      const isActive = value === true || value === 1;
      return (
        <Chip
          label={isActive ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: isActive ? '#079141ff' : '#999999',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
    IndustryName: (value) => {
      return value || 'N/A';
    }
  };

  // Handle Add Industry Dialog
  const handleOpenAddIndustryDialog = () => {
    setAddIndustryDialogOpen(true);
    setNewIndustry({
      IndustryName: '',
      Active: true
    });
  };

  const handleCloseAddIndustryDialog = () => {
    setAddIndustryDialogOpen(false);
    setNewIndustry({
      IndustryName: '',
      Active: true
    });
  };

  const handleAddIndustry = async () => {
    if (!newIndustry.IndustryName.trim()) {
      setError && setError('Industry name is required');
      return;
    }

    setAddIndustryLoading(true);
    try {
      if (onCreate) {
        await onCreate(newIndustry);
        handleCloseAddIndustryDialog();
        setSuccessMessage && setSuccessMessage('Industry added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add industry');
    } finally {
      setAddIndustryLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewIndustry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError && setError('')}
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage && setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Toolbar sx={{ 
            backgroundColor: '#fff', 
            borderBottom: '1px solid #e5e5e5', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 2, 
            py: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Industries
              </Typography>
              {selected.length > 0 && (
                <Chip 
                  label={`${selected.length} selected`} 
                  size="small" 
                  sx={{ backgroundColor: '#e0e0e0', color: '#050505' }} 
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAddIndustryDialog}
                disabled={loading}
                sx={{
                  backgroundColor: "#050505",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#333333" },
                  "&:disabled": {
                    backgroundColor: "#cccccc",
                    color: "#666666",
                  },
                }}
              >
                Add Industry
              </Button>
              {selected.length > 0 && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={onBulkDeactivate}
                >
                  Deactivate Selected
                </Button>
              )}
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : industries.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No industries found
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Click "Add Industry" to create your first industry
              </Typography>
            </Box>
          ) : (
            <TableView
              data={industries}
              columns={columns}
              idField="IndustryID"
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              onAssignUser={onAssignUser}
              formatters={industryFormatters}
              entityType="industry"
              getMenuItems={getMenuItems}
            />
          )}

          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid #e5e5e5', 
            backgroundColor: '#fafafa', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Showing {industries.length} industries
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Add Industry Dialog */}
        <Dialog 
          open={addIndustryDialogOpen} 
          onClose={handleCloseAddIndustryDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon sx={{ color: '#1976d2' }} />
              Add New Industry
            </Box>
            <IconButton onClick={handleCloseAddIndustryDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Industry Name"
                value={newIndustry.IndustryName}
                onChange={(e) => handleInputChange('IndustryName', e.target.value)}
                fullWidth
                required
                variant="outlined"
                helperText="Enter the name of the industry (e.g., Technology, Healthcare, Finance)"
                inputProps={{ maxLength: 255 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={newIndustry.Active}
                    onChange={(e) => handleInputChange('Active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e5e5' }}>
            <Button onClick={handleCloseAddIndustryDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleAddIndustry}
              variant="contained"
              disabled={addIndustryLoading || !newIndustry.IndustryName.trim()}
            >
              {addIndustryLoading ? <CircularProgress size={20} /> : 'Add Industry'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => setStatusMessage && setStatusMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setStatusMessage && setStatusMessage('')} 
            severity={statusSeverity} 
            sx={{ width: '100%' }}
          >
            {statusMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default IndustryPage;