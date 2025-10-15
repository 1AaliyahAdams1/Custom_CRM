import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Toolbar,
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
  PowerOff as PowerOffIcon,
  Power as PowerIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';

const DepartmentPage = ({
  departments = [],
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
  loadDepartments,
}) => {
  const theme = useTheme();

  // Add Department Dialog State
  const [addDepartmentDialogOpen, setAddDepartmentDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    DepartmentName: '',
    Active: true
  });
  const [addDepartmentLoading, setAddDepartmentLoading] = useState(false);

  // Edit Department Dialog State
  const [editDepartmentDialogOpen, setEditDepartmentDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editDepartmentLoading, setEditDepartmentLoading] = useState(false);

  // Load departments on mount
  useEffect(() => {
    if (loadDepartments) {
      loadDepartments();
    }
  }, [loadDepartments]);

  const columns = [
    { field: 'DepartmentName', headerName: 'Department Name', type: 'tooltip', defaultVisible: true },
    { field: 'Active', headerName: 'Status', defaultVisible: true },
  ];

  const departmentFormatters = {
    ...formatters,
    Active: (value) => {
      const isActive = value === true || value === 1;
      return (
        <Chip
          label={isActive ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: isActive ? theme.palette.success.main : theme.palette.grey[500],
            color: theme.palette.getContrastText(isActive ? theme.palette.success.main : theme.palette.grey[500]),
            fontWeight: 500,
          }}
        />
      );
    },
    DepartmentName: (value) => {
      return value || 'Unnamed Department';
    }
  };

  // Add Department Handlers
  const handleOpenAddDepartmentDialog = () => {
    setAddDepartmentDialogOpen(true);
    setNewDepartment({
      DepartmentName: '',
      Active: true
    });
  };

  const handleCloseAddDepartmentDialog = () => {
    setAddDepartmentDialogOpen(false);
    setNewDepartment({
      DepartmentName: '',
      Active: true
    });
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.DepartmentName.trim()) {
      setError && setError('Department name is required');
      return;
    }

    setAddDepartmentLoading(true);
    try {
      if (onCreate) {
        await onCreate(newDepartment);
        handleCloseAddDepartmentDialog();
        setSuccessMessage && setSuccessMessage('Department added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add department');
    } finally {
      setAddDepartmentLoading(false);
    }
  };

  // Edit Department Handlers
  const handleEditClick = (department) => {
    setEditingDepartment({
      DepartmentID: department.DepartmentID,
      DepartmentName: department.DepartmentName,
      Active: department.Active
    });
    setEditDepartmentDialogOpen(true);
  };

  const handleCloseEditDepartmentDialog = () => {
    setEditDepartmentDialogOpen(false);
    setEditingDepartment(null);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment.DepartmentName.trim()) {
      setError && setError('Department name is required');
      return;
    }

    setEditDepartmentLoading(true);
    try {
      if (onEdit) {
        await onEdit(editingDepartment);
        handleCloseEditDepartmentDialog();
        setSuccessMessage && setSuccessMessage('Department updated successfully');
      }
    } catch (error) {
      setError && setError('Failed to update department');
    } finally {
      setEditDepartmentLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewDepartment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditingDepartment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ m: 2 }}
          onClose={() => setError && setError('')}
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ m: 2 }}
          onClose={() => setSuccessMessage && setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

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
            Departments
          </Typography>
          {selected.length > 0 && (
            <Chip 
              label={`${selected.length} selected`} 
              size="small" 
              sx={{ 
                backgroundColor: theme.palette.action.selected,
                color: theme.palette.text.primary 
              }} 
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddDepartmentDialog}
            sx={{
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.getContrastText(theme.palette.text.primary),
              "&:hover": { backgroundColor: theme.palette.grey[800] }
            }}
          >
            Add Department
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
            Loading departments...
          </Typography>
        </Box>
      ) : (
        <TableView
          data={Array.isArray(departments) ? departments : []} 
          columns={columns}
          idField="DepartmentID"
          selected={selected}
          onSelectClick={onSelectClick}
          onSelectAllClick={onSelectAllClick}
          showSelection={true}
          onView={onView}
          onEdit={handleEditClick}
          onDelete={onDelete}
          formatters={departmentFormatters}
          entityType="department"
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
          Showing {departments.length} departments
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

      {/* Add Department Dialog */}
      <Dialog 
        open={addDepartmentDialogOpen} 
        onClose={handleCloseAddDepartmentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          Add New Department
          <IconButton onClick={handleCloseAddDepartmentDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Department Name"
              value={newDepartment.DepartmentName}
              onChange={(e) => handleInputChange('DepartmentName', e.target.value)}
              fullWidth
              required
              variant="outlined"
              helperText="Enter the department name"
              autoFocus
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newDepartment.Active}
                  onChange={(e) => handleInputChange('Active', e.target.checked)}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseAddDepartmentDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddDepartment}
            variant="contained"
            disabled={addDepartmentLoading || !newDepartment.DepartmentName.trim()}
          >
            {addDepartmentLoading ? <CircularProgress size={20} /> : 'Add Department'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog 
        open={editDepartmentDialogOpen} 
        onClose={handleCloseEditDepartmentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          Edit Department
          <IconButton onClick={handleCloseEditDepartmentDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {editingDepartment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Department Name"
                value={editingDepartment.DepartmentName}
                onChange={(e) => handleEditInputChange('DepartmentName', e.target.value)}
                fullWidth
                required
                variant="outlined"
                helperText="Enter the department name"
                autoFocus
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editingDepartment.Active}
                    onChange={(e) => handleEditInputChange('Active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseEditDepartmentDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDepartment}
            variant="contained"
            disabled={editDepartmentLoading || !editingDepartment?.DepartmentName.trim()}
          >
            {editDepartmentLoading ? <CircularProgress size={20} /> : 'Update Department'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentPage;