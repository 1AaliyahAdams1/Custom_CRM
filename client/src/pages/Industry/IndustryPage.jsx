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
  Add,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
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
  const theme = useTheme();
  
  // Add Industry Dialog State
  const [addIndustryDialogOpen, setAddIndustryDialogOpen] = useState(false);
  const [newIndustry, setNewIndustry] = useState({
    IndustryName: '',
    Active: true
  });
  const [addIndustryLoading, setAddIndustryLoading] = useState(false);

  const columns = [
    { field: 'IndustryName', headerName: 'Industry Name', type: 'tooltip', defaultVisible: true }
  ];

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
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh', 
      p: 3 
    }}>
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
          backgroundColor: theme.palette.background.paper, 
          borderBottom: `1px solid ${theme.palette.divider}`, 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 2, 
          py: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 600 
            }}>
              Industries
            </Typography>
            {selected.length > 0 && (
              <Chip 
                label={`${selected.length} selected`} 
                size="small" 
                sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#e0e0e0', 
                  color: theme.palette.text.primary 
                }} 
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddIndustryDialog}
              disabled={loading}
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
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
              Loading industries...
            </Typography>
          </Box>
        ) : industries.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
              No industries found
            </Typography>
            <Typography variant="body2" sx={{ 
              mt: 1, 
              color: theme.palette.text.secondary 
            }}>
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
            formatters={industryFormatters}
            entityType="industry"
            showActions={false}
          />
        )}

        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`, 
          backgroundColor: theme.palette.background.default, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Showing {industries.length} industries
          </Typography>
          {selected.length > 0 && (
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 500 
            }}>
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
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ color: theme.palette.primary.main }} />
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
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
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
  );
};

export default IndustryPage;