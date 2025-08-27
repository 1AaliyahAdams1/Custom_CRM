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
  Percent as PercentIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import DealStagePage from './DealStagePage';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`deals-tabpanel-${index}`}
      aria-labelledby={`deals-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

// Table configuration for deals
const dealsTableConfig = {
  idField: 'DealID',
  columns: [
    { field: 'DealName', headerName: 'Deal Name', type: 'tooltip' },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: 'SymbolValue', headerName: 'Amount' },
    { field: 'LocalName', headerName: 'Currency symbol' },
    { field: 'CloseDate', headerName: 'Close Date', type: 'date' },
    { field: 'Progression', headerName: 'Probability (%)', type: 'percentage' },
    {
      field: 'CreatedAt',
      headerName: 'Created',
      type: 'dateTime',
    },
    {
      field: 'UpdatedAt',
      headerName: 'Updated',
      type: 'date',
    },
  ]
};

const DealsPage = ({ 
  deals = [],
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
  clearFilters,
  totalCount = 0,
  
  // Deal Stage props (pass through to DealStagePage)
  dealStageProps = {},
}) => {
  const [selected, setSelected] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Define available tabs
  const availableTabs = [
    {
      id: 'deals',
      label: 'Deals',
      component: 'deals'
    },
    {
      id: 'deal-stages',
      label: 'Deal Stages', 
      component: 'dealStages'
    },
    // Add more tabs here as needed:
    // {
    //   id: 'reports',
    //   label: 'Reports',
    //   component: 'reports'
    // }
  ];

  // Use all available tabs
  const userTabs = availableTabs;

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Process deals data to add SymbolValue field
  const processedDeals = deals.map(deal => ({
    ...deal,
    SymbolValue: deal.Prefix
      ? `${deal.Symbol}${deal.Value}`
      : `${deal.Value}${deal.Symbol}`
  }));

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        if (setSuccessMessage) {
          setSuccessMessage("");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

  // Selection handlers
  const handleSelectClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleInputChange = (field, value) => {
    setNewDealStage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProgressionChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      handleInputChange('Progression', value);
    } else if (e.target.value === '') {
      handleInputChange('Progression', 0);
    }
  };

  const handleDisplayOrderChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseInt(value) >= 0)) {
      handleInputChange('Display_order', value);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          {/* Tabs Header */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  minHeight: 56,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#050505',
                }
              }}
            >
              {userTabs.map((tab, index) => (
                <Tab 
                  key={tab.id} 
                  label={tab.label}
                  sx={{
                    color: currentTab === index ? '#050505' : '#666666',
                    '&.Mui-selected': {
                      color: '#050505',
                      fontWeight: 600,
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          {userTabs.map((tab, index) => (
            <TabPanel key={tab.id} value={currentTab} index={index}>
              
              {/* Deals Tab Content */}
              {tab.component === 'deals' && (
                <>
                  {/* Error and Success Messages */}
                  {error && (
                    <Alert severity="error" sx={{ m: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert
                      severity="success"
                      sx={{ m: 2 }}
                      onClose={() => setSuccessMessage("")}
                    >
                      {successMessage}
                    </Alert>
                  )}

                  {/* Deals Toolbar */}
                  <Toolbar
                    sx={{
                      backgroundColor: "#ffffff",
                      borderBottom: "1px solid #e5e5e5",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 2,
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ color: "#050505", fontWeight: 600 }}
                      >
                        Deals
                      </Typography>
                      {selected.length > 0 && (
                        <Chip
                          label={`${selected.length} selected`}
                          size="small"
                          sx={{ backgroundColor: "#e0e0e0", color: "#050505" }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={onCreate}
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
                        Add Deal
                      </Button>
                    </Box>
                  </Toolbar>

                  {/* Deals Table */}
                  {loading ? (
                    <Box display="flex" justifyContent="center" p={8}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableView
                      data={processedDeals}
                      columns={dealsTableConfig.columns}
                      idField={dealsTableConfig.idField}
                      selected={selected}
                      onSelectClick={handleSelectClick}
                      onSelectAllClick={handleSelectAllClick}
                      showSelection={true}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDeactivate}
                      onAddNote={onAddNote}
                      onAddAttachment={onAddAttachment}
                      formatters={formatters}
                      entityType="deal"
                    />
                  )}

                  {/* Deals Results Footer */}
                  <Box
                    sx={{
                      p: 2,
                      borderTop: "1px solid #e5e5e5",
                      backgroundColor: "#fafafa",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#666666" }}>
                      Showing {processedDeals.length} of {totalCount} deals
                    </Typography>
                    {selected.length > 0 && (
                      <Typography
                        variant="body2"
                        sx={{ color: "#050505", fontWeight: 500 }}
                      >
                        {selected.length} selected
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              {/* Deal Stages Tab Content */}
              {tab.component === 'dealStages' && (
                <Box sx={{ p: 0 }}>
                  <DealStagePage {...dealStageProps} />
                </Box>
              )}

              {/* Add more tab components here as needed */}
              {/* 
              {tab.component === 'reports' && (
                <Box sx={{ p: 0 }}>
                  <DealReportsPage {...dealReportsProps} />
                </Box>
              )}
              */}

            </TabPanel>
          ))}
        </Paper>

        {/* Add Deal Stage Dialog */}
        <Dialog 
          open={addDealStageDialogOpen} 
          onClose={handleCloseAddDealStageDialog}
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
              <TimelineIcon sx={{ color: '#1976d2' }} />
              Add New Deal Stage
            </Box>
            <IconButton onClick={handleCloseAddDealStageDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Stage Name"
                value={newDealStage.StageName}
                onChange={(e) => handleInputChange('StageName', e.target.value)}
                fullWidth
                required
                variant="outlined"
                helperText="Enter the name of the deal stage (e.g., Prospecting, Qualification, Proposal)"
                inputProps={{ maxLength: 100 }}
              />

              <FormControl fullWidth required>
                <InputLabel>Progression</InputLabel>
                <OutlinedInput
                  value={newDealStage.Progression}
                  onChange={handleProgressionChange}
                  type="number"
                  inputProps={{ 
                    min: 0, 
                    max: 100, 
                    step: 0.01 
                  }}
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  label="Progression"
                />
                <Typography variant="caption" sx={{ mt: 0.5, color: '#666' }}>
                  Enter progression percentage (0-100)
                </Typography>
              </FormControl>

              <TextField
                label="Display Order (Optional)"
                value={newDealStage.Display_order}
                onChange={handleDisplayOrderChange}
                fullWidth
                variant="outlined"
                type="number"
                helperText="Enter display order for sorting stages (leave empty for auto-assignment)"
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Description (Optional)"
                value={newDealStage.Description}
                onChange={(e) => handleInputChange('Description', e.target.value)}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                helperText="Enter a description for this deal stage"
                inputProps={{ maxLength: 500 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={newDealStage.IsActive}
                    onChange={(e) => handleInputChange('IsActive', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e5e5' }}>
            <Button onClick={handleCloseAddDealStageDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleAddDealStage}
              variant="contained"
              disabled={
                addDealStageLoading || 
                !newDealStage.StageName.trim() || 
                newDealStage.Progression < 0 || 
                newDealStage.Progression > 100
              }
            >
              {addDealStageLoading ? <CircularProgress size={20} /> : 'Add Deal Stage'}
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

export default DealStagePage;