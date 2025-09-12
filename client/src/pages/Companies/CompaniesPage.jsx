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
} from "@mui/material";
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Note as NoteIcon,
  AttachFile as AttachFileIcon,
  PowerOff as PowerOffIcon,
  Power as PowerIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const CompaniesPage = ({
  companies = [],
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
  showStatus,
  // Popup props (for future use if needed)
  notesPopupOpen,
  setNotesPopupOpen,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  selectedCompany,
  popupLoading,
  popupError,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  handleUploadAttachment,
  handleDeleteAttachment,
  handleDownloadAttachment,
}) => {
  
  const columns = [
    { 
      field: 'CompanyName', 
      headerName: 'Company Name', 
      type: 'clickable',
      defaultVisible: true,
      onClick: onView,
      clickableStyle: {
        fontWeight: 600,
        fontSize: '0.95rem'
      }
    },
    { 
      field: 'CountryName', 
      headerName: 'Country', 
      type: 'tooltip', 
      defaultVisible: true 
    },
    { 
      field: 'CityName', 
      headerName: 'City', 
      type: 'tooltip', 
      defaultVisible: true 
    },
    { 
      field: 'Area', 
      headerName: 'Area', 
      type: 'truncated', 
      maxWidth: 200, 
      defaultVisible: true 
    },
    { 
      field: 'Street', 
      headerName: 'Street', 
      type: 'truncated', 
      maxWidth: 250, 
      defaultVisible: false 
    },
    { 
      field: 'CompanyID', 
      headerName: 'Company ID', 
      defaultVisible: false 
    },
    { 
      field: 'CountryID', 
      headerName: 'Country ID', 
      defaultVisible: false 
    },
    { 
      field: 'CityID', 
      headerName: 'City ID', 
      defaultVisible: false 
    }
  ];

  
  const getMenuItems = (company) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(company),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(company),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(company),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(company),
        show: !!onAddAttachment,
      },
    ];

    
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(company.CompanyID),
      show: !!onDelete,
    });

    return baseItems;
  };

  
  const companyFormatters = {
    ...formatters,
    CompanyName: (value, row) => {
      if (!value) return 'N/A';
      return (
        <Box
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            if (onView) {
              onView(row);
            }
          }}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {value}
        </Box>
      );
    },
    Area: (value) => {
      if (!value) return 'N/A';
      return (
        <span title={value}>
          {value.length > 30 ? `${value.substring(0, 30)}...` : value}
        </span>
      );
    },
    Street: (value) => {
      if (!value) return 'N/A';
      return (
        <span title={value}>
          {value.length > 40 ? `${value.substring(0, 40)}...` : value}
        </span>
      );
    }
  };

  // Tooltip messages for companies
  const tooltips = {
    search: "Search companies by name, location, or any visible field",
    filter: "Show advanced filtering options to narrow down companies",
    columns: "Customize which company information columns are visible",
    actions: "Available actions for this company",
    actionMenu: {
      view: "View detailed company information and related records",
      edit: "Edit company details and contact information",
      addNote: "Add internal notes about this company",
      addAttachment: "Attach documents or files to this company record",
      delete: "Delete this company from the system"
    }
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
              {/* <BusinessIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} /> */}
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Companies
              </Typography>
              {companies.length > 0 && (
                <Chip 
                  label={`${companies.length} companies`} 
                  size="small" 
                  sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }} 
                />
              )}
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
                onClick={onCreate}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
              >
                Add Company
              </Button>
              {selected.length > 0 && onBulkDeactivate && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={onBulkDeactivate}
                >
                  Bulk Actions ({selected.length})
                </Button>
              )}
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={8}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ ml: 2, color: '#666' }}>
                Loading companies...
              </Typography>
            </Box>
          ) : companies.length === 0 ? (
            <Box display="flex" flex-direction="column" justifyContent="center" alignItems="center" p={8}>
              <BusinessIcon sx={{ fontSize: '4rem', color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                No Companies Found
              </Typography>
              {/* <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', mb: 3 }}>
                Get started by adding your first company to the system.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
              >
                Add First Company
              </Button> */}
            </Box>
          ) : (
            <TableView
              data={companies}
              columns={columns}
              idField="CompanyID"
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
              formatters={companyFormatters}
              tooltips={tooltips}
              entityType="companies"
              menuItems={getMenuItems}
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
              {companies.length === 0 ? 'No companies' : 
               companies.length === 1 ? 'Showing 1 company' : 
               `Showing ${companies.length} companies`}
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => setStatusMessage && setStatusMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setStatusMessage && setStatusMessage('')} 
            severity={statusSeverity || 'info'} 
            sx={{ width: '100%' }}
          >
            {statusMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default CompaniesPage;