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
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const ProductPage = ({
  products = [],
  loading = false,
  error,
  setError, // Add this prop
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
  selectedProduct,
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
    { field: 'ProductName', headerName: 'Product Name', type: 'tooltip', defaultVisible: true },
    { field: 'Description', headerName: 'Description', type: 'truncated', maxWidth: 250, defaultVisible: true },
    { field: 'Price', headerName: 'Price', type: 'currency', defaultVisible: true },
    { field: 'Cost', headerName: 'Cost', type: 'currency', defaultVisible: false },
    { field: 'SKU', headerName: 'SKU', defaultVisible: true },
    //{ field: 'CategoryID', headerName: 'Category', defaultVisible: true },
    { field: 'AccountName', headerName: 'Account', defaultVisible: false },
    { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
    {
      field: 'IsActive',
      headerName: 'Status',
      type: 'chip',
      chipLabels: { true: 'Active', false: 'Inactive' },
      chipColors: { true: '#079141ff', false: '#999999' },
      defaultVisible: true,
    },
  ];

  // Enhanced menu items for products
  const getMenuItems = (product) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(product),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(product),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(product),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(product),
        show: !!onAddAttachment,
      },
    ];

    // Add reactivate/deactivate based on current status
    if (product.IsActive) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(product.ProductID),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(product.ProductID),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(product.ProductID),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for product-specific fields
  const productFormatters = {
    ...formatters,
    Price: (value) => {
      if (!value) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    },
    Cost: (value) => {
      if (!value) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    },
    IsActive: (value) => {
      return (
        <Chip
          label={value ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: value ? '#079141ff' : '#999999',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
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
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Products
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
                onClick={onCreate}
              >
                Add Product
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
          ) : (
            <TableView
              data={products}
              columns={columns}
              idField="ProductID"
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
              formatters={productFormatters}
              entityType="product"
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
              Showing {products.length} products
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

export default ProductPage;