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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Tabs,
  Tab,
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
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';
import CategoryPage from  './CategoryPage'
import DepartmentPage from './DepartmentPage';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`priority-tabpanel-${index}`}
      aria-labelledby={`priority-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const PriorityLevelPage = ({
  // Priority Level props
  priorityLevels = [],
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
  
  // Category props
  categoryProps,
  
  // Department props
  departmentProps,
}) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  
  // Add Priority Level Dialog State
  const [addPriorityLevelDialogOpen, setAddPriorityLevelDialogOpen] = useState(false);
  const [newPriorityLevel, setNewPriorityLevel] = useState({
    PriorityName: '',
    Description: '',
    PriorityOrder: '',
    Color: '#079141ff',
    IsActive: true
  });
  const [addPriorityLevelLoading, setAddPriorityLevelLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const availableTabs = [
    { id: 'priority-levels', label: 'Priority Levels', component: 'priority-levels' },
    { id: 'categories', label: 'Categories', component: 'categories' },
    { id: 'departments', label: 'Departments', component: 'departments' },
  ];

  const columns = [
    { field: 'PriorityLevelName', headerName: 'Priority Name', type: 'tooltip', defaultVisible: true },
    { field: 'Description', headerName: 'Description', type: 'tooltip', defaultVisible: true },
    { field: 'PriorityOrder', headerName: 'Order', defaultVisible: true },
    { field: 'Color', headerName: 'Color', defaultVisible: true },
  ];



  const priorityLevelFormatters = {
    ...formatters,
    IsActive: (value) => {
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
    Color: (value) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: value || '#079141ff',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1
            }}
          />
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {value || '#079141ff'}
          </Typography>
        </Box>
      );
    },
    PriorityOrder: (value) => {
      return (
        <Chip
          label={value || 'N/A'}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 500,
            fontFamily: 'monospace',
          }}
        />
      );
    },
    Description: (value) => {
      return value || 'No description';
    }
  };

  const handleOpenAddPriorityLevelDialog = () => {
    setAddPriorityLevelDialogOpen(true);
    setNewPriorityLevel({
      PriorityName: '',
      Description: '',
      PriorityOrder: '',
      Color: '#079141ff',
      IsActive: true
    });
  };

  const handleCloseAddPriorityLevelDialog = () => {
    setAddPriorityLevelDialogOpen(false);
    setNewPriorityLevel({
      PriorityName: '',
      Description: '',
      PriorityOrder: '',
      Color: '#079141ff',
      IsActive: true
    });
  };

  const handleAddPriorityLevel = async () => {
  if (!newPriorityLevel.PriorityName.trim()) {
    setError && setError('Priority name is required');
    return;
  }

  // Validate PriorityOrder
  if (!newPriorityLevel.PriorityOrder || newPriorityLevel.PriorityOrder === '') {
    setError && setError('Priority order is required');
    return;
  }

  setAddPriorityLevelLoading(true);
  try {
    if (onCreate) {
      const priorityLevelData = {
        PriorityName: newPriorityLevel.PriorityName.trim(),
        Description: newPriorityLevel.Description,
        PriorityOrder: parseInt(newPriorityLevel.PriorityOrder, 10),
        Color: newPriorityLevel.Color,
        IsActive: newPriorityLevel.IsActive
      };
      
      console.log('Submitting priority level:', priorityLevelData);
      
      await onCreate(priorityLevelData);
      handleCloseAddPriorityLevelDialog();
      setSuccessMessage && setSuccessMessage('Priority level added successfully');
    }
  } catch (error) {
    console.error('Error in handleAddPriorityLevel:', error);
    setError && setError(error.message || 'Failed to add priority level');
  } finally {
    setAddPriorityLevelLoading(false);
  }
};
  const handleInputChange = (field, value) => {
    setNewPriorityLevel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const colorOptions = [
    { value: '#f44336', label: 'High Priority (Red)' },
    { value: '#ff9800', label: 'Medium Priority (Orange)' },
    { value: '#ffeb3b', label: 'Normal Priority (Yellow)' },
    { value: '#4caf50', label: 'Low Priority (Green)' },
    { value: '#2196f3', label: 'Info (Blue)' },
    { value: '#9c27b0', label: 'Special (Purple)' },
    { value: '#607d8b', label: 'Neutral (Gray)' },
    { value: '#079141ff', label: 'Default (Brand Green)' },
  ];

  const handleColorChange = (event) => {
  setNewPriorityLevel(prev => ({
    ...prev,
    Color: event.target.value
  }));
};

  return (
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh', 
      p: 3 
    }}>
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            sx={{ backgroundColor: theme.palette.background.paper }}
          >
            {availableTabs.map((tab, index) => (
              <Tab
                key={tab.id}
                label={tab.label}
                sx={{
                  color: currentTab === index ? theme.palette.text.primary : theme.palette.text.secondary,
                  '&.Mui-selected': { color: theme.palette.text.primary, fontWeight: 600 },
                  textTransform: 'none',
                  fontSize: '1rem',
                  minHeight: 56
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {availableTabs.map((tab, index) => (
          <TabPanel key={tab.id} value={currentTab} index={index}>
            {tab.component === 'priority-levels' && (
              <>
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
                      Priority Levels
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
                      onClick={handleOpenAddPriorityLevelDialog}
                      sx={{
                        backgroundColor: theme.palette.text.primary,
                        color: theme.palette.getContrastText(theme.palette.text.primary),
                        "&:hover": { backgroundColor: theme.palette.grey[800] }
                      }}
                    >
                      Add Priority Level
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
                      Loading priority levels...
                    </Typography>
                  </Box>
                ) : (
                  <TableView
                    data={priorityLevels}
                    columns={columns}
                    idField="PriorityLevelID"
                    selected={selected}
                    onSelectClick={onSelectClick}
                    onSelectAllClick={onSelectAllClick}
                    showSelection={true}
                    formatters={priorityLevelFormatters}
                    entityType="priority level"
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
                    Showing {priorityLevels.length} priority levels
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
              </>
            )}

            {tab.component === 'categories' && categoryProps && (
              <CategoryPage {...categoryProps} />
            )}

            {tab.component === 'departments' && departmentProps && (
              <DepartmentPage {...departmentProps} />
            )}
          </TabPanel>
        ))}
      </Paper>

      {/* Add Priority Level Dialog */}
      <Dialog 
        open={addPriorityLevelDialogOpen} 
        onClose={handleCloseAddPriorityLevelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          Add New Priority Level
          <IconButton onClick={handleCloseAddPriorityLevelDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Priority Name"
              value={newPriorityLevel.PriorityName}
              onChange={(e) => handleInputChange('PriorityName', e.target.value)}
              fullWidth
              required
              variant="outlined"
              helperText="Enter a descriptive name for the priority level"
            />

            <TextField
              label="Description"
              value={newPriorityLevel.Description}
              onChange={(e) => handleInputChange('Description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              helperText="Optional description explaining when to use this priority level"
            />

            <TextField
              label="Priority Order"
              value={newPriorityLevel.PriorityOrder}
              onChange={(e) => handleInputChange('PriorityOrder', e.target.value)}
              fullWidth
              required 
              type="number"
              variant="outlined"
              helperText="Lower numbers = higher priority (1 = highest priority)"
              inputProps={{ min: 1, max: 100 }}
            />

            <FormControl fullWidth>
  <InputLabel>Color</InputLabel>
  <Select
    value={newPriorityLevel.Color}
    onChange={handleColorChange}
    fullWidth
  >
    {colorOptions.map((color) => (
      <MenuItem key={color.value} value={color.value}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: color.value,
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
          {color.label}
        </Box>
      </MenuItem>
    ))}
  </Select>
</FormControl>

<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <TextField
    label="Custom Color"
    value={newPriorityLevel.Color}
    onChange={(e) => handleInputChange('Color', e.target.value)}
    size="small"
    variant="outlined"
    helperText="Or enter custom hex color"
    sx={{ flex: 1 }}
  />
  <Box
    sx={{
      width: 40,
      height: 40,
      backgroundColor: newPriorityLevel.Color,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
      flexShrink: 0
    }}
  />
</Box>

            <FormControlLabel
              control={
                <Switch
                  checked={newPriorityLevel.IsActive}
                  onChange={(e) => handleInputChange('IsActive', e.target.checked)}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseAddPriorityLevelDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddPriorityLevel}
            variant="contained"
            disabled={addPriorityLevelLoading || !newPriorityLevel.PriorityName.trim()}
          >
            {addPriorityLevelLoading ? <CircularProgress size={20} /> : 'Add Priority Level'}
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

export default PriorityLevelPage;