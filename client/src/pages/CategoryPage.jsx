import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
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
  useTheme,
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
  Add,
  Category as CategoryIcon,
} from "@mui/icons-material";

import TableView from '../components/tableFormat/TableView';
import { formatters } from '../utils/formatters';

const CategoryPage = ({
  categories = [],
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
}) => {
  const theme = useTheme();

  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    CategoryName: '',
    Active: true
  });
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);

  const columns = [
    { field: 'CategoryID', headerName: 'ID', defaultVisible: true },
    { field: 'CategoryName', headerName: 'Category Name', type: 'tooltip', defaultVisible: true },
    { field: 'LastUpdated', headerName: 'Last Updated', type: 'date', defaultVisible: false },
  ];

  const getMenuItems = (category) => {
    const categoryId = category.CategoryID;
    const isActive = category.Active === true || category.Active === 1;

    const baseItems = [
      { label: 'View Details', icon: <InfoIcon sx={{ mr: 1, color: theme.palette.text.primary }} />, onClick: () => onView && onView(category), show: !!onView },
      { label: 'Edit', icon: <EditIcon sx={{ mr: 1, color: theme.palette.text.primary }} />, onClick: () => onEdit && onEdit(category), show: !!onEdit },
      { label: 'Add Notes', icon: <NoteIcon sx={{ mr: 1, color: theme.palette.text.primary }} />, onClick: () => onAddNote && onAddNote(category), show: !!onAddNote },
      { label: 'Add Attachments', icon: <AttachFileIcon sx={{ mr: 1, color: theme.palette.text.primary }} />, onClick: () => onAddAttachment && onAddAttachment(category), show: !!onAddAttachment },
    ];

    if (isActive) {
      baseItems.push({ label: 'Deactivate', icon: <PowerOffIcon sx={{ mr: 1, color: theme.palette.warning.main }} />, onClick: () => onDeactivate && onDeactivate(categoryId), show: !!onDeactivate });
    } else {
      baseItems.push({ label: 'Reactivate', icon: <PowerIcon sx={{ mr: 1, color: theme.palette.success.main }} />, onClick: () => onReactivate && onReactivate(categoryId), show: !!onReactivate });
    }

    baseItems.push({ label: 'Delete', icon: <DeleteIcon sx={{ mr: 1, color: theme.palette.error.main }} />, onClick: () => onDelete && onDelete(categoryId), show: !!onDelete });

    return baseItems;
  };

  const categoryFormatters = {
    ...formatters,
    Active: (value) => {
      const isActive = value === true || value === 1;
      return <Chip label={isActive ? 'Active' : 'Inactive'} size="small" sx={{ backgroundColor: isActive ? theme.palette.success.main : theme.palette.grey[500], color: theme.palette.getContrastText(isActive ? theme.palette.success.main : theme.palette.grey[500]), fontWeight: 500 }} />;
    },
    CategoryName: (value) => <Chip label={value} size="small" variant="outlined" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }} />,
  };

  const handleInputChange = (field, value) => setNewCategory(prev => ({ ...prev, [field]: value }));

  const handleOpenAddCategoryDialog = () => setAddCategoryDialogOpen(true);
  const handleCloseAddCategoryDialog = () => {
    setAddCategoryDialogOpen(false);
    setNewCategory({ CategoryName: '', Active: true });
  };

  const handleAddCategory = async () => {
    if (!newCategory.CategoryName.trim()) {
      setError && setError('Category name is required');
      return;
    }

    setAddCategoryLoading(true);
    try {
      if (onCreate) {
        await onCreate(newCategory.CategoryName.trim());
        handleCloseAddCategoryDialog();
        setSuccessMessage && setSuccessMessage('Category added successfully');
      }
    } catch (err) {
      setError && setError('Failed to add category');
    } finally {
      setAddCategoryLoading(false);
    }
  };

  return (
    <>
      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccessMessage && setSuccessMessage("")}>{successMessage}</Alert>}

      {/* Toolbar */}
      <Toolbar sx={{ backgroundColor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.divider}`, justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Typography variant="h6" component="div" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>Categories</Typography>
          {selected.length > 0 && <Chip label={`${selected.length} selected`} size="small" sx={{ backgroundColor: theme.palette.action.selected, color: theme.palette.text.primary }} />}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddCategoryDialog} disabled={loading} sx={{ backgroundColor: theme.palette.text.primary, color: theme.palette.getContrastText(theme.palette.text.primary), "&:hover": { backgroundColor: theme.palette.grey[800] } }}>Add Category</Button>
          {selected.length > 0 && <Button variant="outlined" color="warning" onClick={onBulkDeactivate}>Deactivate Selected</Button>}
        </Box>
      </Toolbar>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>
      ) : (
        <TableView
          data={categories}
          columns={columns}
          idField="CategoryID"
          selected={selected}
          onSelectClick={onSelectClick}
          onSelectAllClick={onSelectAllClick}
          showSelection
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddNote={onAddNote}
          onAddAttachment={onAddAttachment}
          onAssignUser={onAssignUser}
          formatters={categoryFormatters}
          entityType="category"
          getMenuItems={getMenuItems}
        />
      )}

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Showing {categories.length} categories</Typography>
        {selected.length > 0 && <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>{selected.length} selected</Typography>}
      </Box>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onClose={handleCloseAddCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon sx={{ color: theme.palette.primary.main }} /> Add New Category
          </Box>
          <IconButton onClick={handleCloseAddCategoryDialog} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
              label="Category Name" 
              value={newCategory.CategoryName} 
              onChange={(e) => handleInputChange('CategoryName', e.target.value)} 
              fullWidth 
              required 
              variant="outlined" 
              helperText="Enter the name of the category" 
              inputProps={{ maxLength: 255 }}
              InputProps={{ 
                startAdornment: <CategoryIcon sx={{ mr: 1, color: theme.palette.text.secondary }} /> 
              }}
            />
            <FormControlLabel 
              control={
                <Switch 
                  checked={newCategory.Active} 
                  onChange={(e) => handleInputChange('Active', e.target.checked)} 
                  color="primary" 
                />
              } 
              label="Active" 
            />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: -2 }}>
              If checked, this category will be available for selection in drop-down menus
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseAddCategoryDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleAddCategory} 
            variant="contained" 
            disabled={addCategoryLoading || !newCategory.CategoryName.trim()}
          >
            {addCategoryLoading ? <CircularProgress size={20} /> : 'Add Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Snackbar */}
      <Snackbar open={!!statusMessage} autoHideDuration={4000} onClose={() => setStatusMessage && setStatusMessage('')} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setStatusMessage && setStatusMessage('')} severity={statusSeverity} sx={{ width: '100%' }}>
          {statusMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CategoryPage;