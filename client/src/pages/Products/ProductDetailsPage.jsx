import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { getProductById, deactivateProduct, reactivateProduct, updateProduct } from "../../services/productService";
import { getAllNotes } from "../../services/noteService";
import { getAllAttachments } from "../../services/attachmentService";
import { getAllAccounts } from "../../services/accountService";
import { getAllCategories } from "../../services/categoryService";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshProduct = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const data = await getProductById(parseInt(idRef.current, 10));
      setProduct(data?.data || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }
    refreshProduct();
  }, [id, refreshProduct]);

  const handleBack = useCallback(() => {
    navigateRef.current("/products");
  }, []);

  // SKU validation function
  const validateSKU = (sku) => {
    const skuPattern = /^[A-Z]{3,7}-\d{3}$/;
    if (!skuPattern.test(sku)) {
      throw new Error('Invalid SKU format. Example: LNTMS-001');
    }
  };

  // Define main fields with proper configuration
  const mainFields = useMemo(() => [
    { 
      key: 'ProductName', 
      label: 'Product Name', 
      type: 'text', 
      required: true,
      editable: true,
      validation: (value) => {
        if (!value || value.trim().length === 0) {
          throw new Error('Product name is required');
        }
        if (value.trim().length > 100) {
          throw new Error('Product name must be 100 characters or less');
        }
      }
    },
    { 
      key: 'SKU', 
      label: 'SKU', 
      type: 'text', 
      required: true,
      editable: true,
      validation: validateSKU,
      helperText: 'Format: ABC-123'
    },
    { 
      key: 'Description', 
      label: 'Description', 
      type: 'textarea',
      editable: true,
      validation: (value) => {
        if (value && value.trim().length > 1000) {
          throw new Error('Description must be 1000 characters or less');
        }
      }
    },
    { 
      key: 'Price', 
      label: 'Price', 
      type: 'text',
      required: true,
      editable: true,
      validation: (value) => {
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) {
          throw new Error('Price must be a non-negative number');
        }
        if (price > 999999.99) {
          throw new Error('Price must be less than $999,999.99');
        }
      }
    },
    { 
      key: 'Cost', 
      label: 'Cost', 
      type: 'text',
      editable: true,
      validation: (value) => {
        if (value && value.trim()) {
          const cost = parseFloat(value);
          if (isNaN(cost) || cost < 0) {
            throw new Error('Cost must be a non-negative number');
          }
          if (cost > 999999.99) {
            throw new Error('Cost must be less than $999,999.99');
          }
        }
      }
    },
    { 
      key: 'CategoryID', 
      label: 'Category', 
      type: 'dropdown',
      required: true,
      editable: true,
      displayField: 'CategoryName',
      valueField: 'CategoryID',
      service: {
        getAll: async () => {
          const response = await getAllCategories();
          return response.data || response;
        }
      }
    },
    { 
      key: 'AccountID', 
      label: 'Account', 
      type: 'dropdown',
      required: true,
      editable: true,
      displayField: 'AccountName',
      valueField: 'AccountID',
      service: {
        getAll: async () => {
          const response = await getAllAccounts();
          return response.data || response;
        }
      }
    },
    { key: 'CreatedAt', label: 'Created At', type: 'datetime', editable: false },
    { key: 'UpdatedAt', label: 'Updated At', type: 'datetime', editable: false },
    { key: 'Active', label: 'Active', type: 'boolean', editable: false },
  ], []);

  const createFilteredDataService = useCallback((serviceFunction, filterField) => {
    return async () => {
      try {
        const response = await serviceFunction();
        const allData = response?.data || response;
        const productId = parseInt(idRef.current, 10);
        
        const filteredData = allData.filter(item => 
          item[filterField] === productId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering data:', error);
        throw error;
      }
    };
  }, []);

  const createAttachmentDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllAttachments();
        const allData = response?.data || response;
        const productId = parseInt(idRef.current, 10);
        
        const PRODUCT_ENTITY_TYPE_ID = 2;
        
        const filteredData = allData.filter(item => 
          item.EntityID === productId && item.EntityTypeID === PRODUCT_ENTITY_TYPE_ID
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering attachments:', error);
        throw error;
      }
    };
  }, []);

  const relatedTabs = useMemo(() => {
    const tabs = [
      {
        key: 'notes',
        label: 'Notes',
        entityType: 'note',
        tableConfig: {
          idField: 'NoteID',
          columns: [
            { field: 'Content', headerName: 'Content', type: 'truncated', maxWidth: 400, defaultVisible: true },
            { field: 'EntityID', headerName: 'Entity ID', type: 'text', defaultVisible: true },
            { field: 'EntityTypeID', headerName: 'Entity Type', type: 'text', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true }
          ]
        },
        dataService: createFilteredDataService(getAllNotes, 'EntityID')
      },
      {
        key: 'attachments',
        label: 'Attachments',
        entityType: 'attachment',
        tableConfig: {
          idField: 'AttachmentID',
          columns: [
            { field: 'FileName', headerName: 'File Name', type: 'text', defaultVisible: true },
            { field: 'FileType', headerName: 'Type', type: 'text', defaultVisible: true },
            { field: 'FileSize', headerName: 'Size', type: 'text', defaultVisible: true },
            { field: 'UploadedByFirstName', headerName: 'Uploaded By', type: 'text', defaultVisible: true },
            { field: 'UploadedAt', headerName: 'Uploaded', type: 'dateTime', defaultVisible: true },
          ]
        },
        dataService: createAttachmentDataService(),
      },
    ];
    return tabs;
  }, [createFilteredDataService, createAttachmentDataService]);

  const relatedDataActions = useMemo(() => {
    const actions = {
      note: {
        view: (note) => {
          console.log('View note:', note);
        },
        edit: (note) => {
          console.log('Edit note:', note);
        },
        deactivate: async (note) => {
          console.log('Deactivate note:', note);
        }
      },
      attachment: {
        view: (attachment) => {
          console.log('View attachment:', attachment);
        },
        deactivate: async (attachment) => {
          console.log('Deactivate attachment:', attachment);
        }
      }
    };
    return actions;
  }, []);

  const headerChips = useMemo(() => {
    if (!product) return [];
    
    const chips = [];
    chips.push({
      label: product.Active ? 'Active' : 'Inactive',
      color: product.Active ? '#079141ff' : '#999999',
      textColor: '#ffffff'
    });
    if (product.CategoryName) {
      chips.push({
        label: product.CategoryName,
        color: '#2196f3',
        textColor: '#ffffff'
      });
    }
    return chips;
  }, [product]);

  const handleSave = useCallback(async (formData) => {
    try {
      const submitData = {
        ProductName: formData.ProductName,
        Description: formData.Description || null,
        SKU: formData.SKU,
        Price: parseFloat(formData.Price),
        Cost: formData.Cost ? parseFloat(formData.Cost) : null,
        CategoryID: parseInt(formData.CategoryID),
        AccountID: parseInt(formData.AccountID),
      };

      await updateProduct(parseInt(idRef.current, 10), submitData);
      setSuccessMessage('Product updated successfully');
      await refreshProduct();
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
      throw err;
    }
  }, [refreshProduct]);

  const handleDeactivate = useCallback(async () => {
    try {
      await deactivateProduct(parseInt(idRef.current, 10));
      setSuccessMessage('Product deactivated successfully');
      await refreshProduct();
    } catch (err) {
      console.error('Error deactivating product:', err);
      setError('Failed to deactivate product');
      throw err;
    }
  }, [refreshProduct]);

  const handleReactivate = useCallback(async () => {
    try {
      await reactivateProduct(parseInt(idRef.current, 10));
      setSuccessMessage('Product reactivated successfully');
      await refreshProduct();
    } catch (err) {
      console.error('Error reactivating product:', err);
      setError('Failed to reactivate product');
      throw err;
    }
  }, [refreshProduct]);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to product:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to product:', item);
  }, []);

  // Custom actions for the action menu
  const customActions = useMemo(() => {
    if (!product) return [];
    
    return product.Active ? [
      {
        label: 'Deactivate',
        onClick: handleDeactivate,
        color: 'error'
      }
    ] : [
      {
        label: 'Reactivate',
        onClick: handleReactivate,
        color: 'success'
      }
    ];
  }, [product, handleDeactivate, handleReactivate]);

  if (loading) {
    return (
      <Box sx={{ 
        width: "100%", 
        p: 2, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
          Loading product details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        width: "100%", 
        p: 2, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh" 
      }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ 
        width: "100%", 
        p: 2, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh" 
      }}>
        <Alert severity="warning">Product not found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: "100%", 
      p: 2, 
      backgroundColor: theme.palette.background.default, 
      minHeight: "100vh" 
    }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={product.ProductName || 'Product Details'}
        subtitle={`Product ID: ${product.ProductID} | SKU: ${product.SKU}`}
        item={product}
        mainFields={mainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        loading={loading}
        error={error}
        headerChips={headerChips}
        entityType="product"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
        customActions={customActions}
        saveButtonColor="#050505"
      />
    </Box>
  );
}

export default ProductDetailsPage;