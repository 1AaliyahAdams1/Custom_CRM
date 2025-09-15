import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment
} from "@mui/material";
import {
  Save,
  Delete,
  Edit,
  Cancel,
  AttachMoney,
  Inventory,
  Business,
  Category
} from "@mui/icons-material";

import { getProductById, updateProduct, deleteProduct } from "../../services/productService";
import { getAllAccounts } from "../../services/accountService";

// Mock category service - replace with your actual service
const categoryService = {
  getAll: async () => {
    return [
      { CategoryID: 1, CategoryName: 'Electronics' },
      { CategoryID: 2, CategoryName: 'Software' },
      { CategoryID: 3, CategoryName: 'Services' },
      { CategoryID: 4, CategoryName: 'Hardware' },
      { CategoryID: 5, CategoryName: 'Accessories' },
      { CategoryID: 6, CategoryName: 'Consumables' },
    ];
  }
};

export default function ProductDetailsForm({ 
  productId, 
  product: initialProduct, 
  onProductUpdate, 
  onError 
}) {
  const navigate = useNavigate();
  
  // Form states
  const [product, setProduct] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form validation
  const [errors, setErrors] = useState({});

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingOptions(true);
        
        // Load product if not provided
        let productData = initialProduct;
        if (!productData && productId) {
          setLoading(true);
          const response = await getProductById(productId);
          productData = response?.data || response;
        }
        
        if (productData) {
          setProduct(productData);
          setOriginalProduct({ ...productData });
        }

        // Load dropdown options
        const [categoriesData, accountsData] = await Promise.all([
          categoryService.getAll(),
          getAllAccounts().then(response => response?.data || response)
        ]);

        setCategories(categoriesData || []);
        setAccounts(accountsData || []);
        
      } catch (err) {
        console.error("Error loading data:", err);
        onError?.(err.response?.data?.message || "Failed to load product data");
      } finally {
        setLoading(false);
        setLoadingOptions(false);
      }
    };

    loadData();
  }, [productId, initialProduct, onError]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!product.ProductName?.trim()) {
      newErrors.ProductName = "Product name is required";
    }
    
    if (!product.SKU?.trim()) {
      newErrors.SKU = "SKU is required";
    }
    
    if (!product.Price || product.Price <= 0) {
      newErrors.Price = "Valid price is required";
    }
    
    if (!product.CategoryID) {
      newErrors.CategoryID = "Category is required";
    }
    
    if (!product.AccountID) {
      newErrors.AccountID = "Account is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      const updatedProduct = await updateProduct(productId, product);
      const productData = updatedProduct?.data || updatedProduct || product;
      
      setProduct(productData);
      setOriginalProduct({ ...productData });
      setIsEditing(false);
      
      onProductUpdate?.(productData);
      
    } catch (err) {
      console.error("Error saving product:", err);
      onError?.(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setProduct({ ...originalProduct });
    setIsEditing(false);
    setErrors({});
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    
    try {
      setSaving(true);
      await deleteProduct(productId);
      navigate("/products");
    } catch (err) {
      console.error("Error deleting product:", err);
      onError?.(err.response?.data?.message || "Failed to delete product");
      setSaving(false);
    }
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.CategoryID === categoryId);
    return category?.CategoryName || 'Unknown';
  };

  // Get account name
  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.AccountID === accountId);
    return account?.AccountName || 'Unknown';
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Alert severity="error">
        Product data not available
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with status chips and action buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={product.IsActive ? "Active" : "Inactive"}
            color={product.IsActive ? "success" : "default"}
            size="small"
          />
          {product.CategoryID && (
            <Chip
              icon={<Category />}
              label={getCategoryName(product.CategoryID)}
              variant="outlined"
              size="small"
            />
          )}
          {product.AccountID && (
            <Chip
              icon={<Business />}
              label={getAccountName(product.AccountID)}
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                disabled={loading || loadingOptions}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                disabled={loading || saving}
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={18} /> : <Save />}
                onClick={handleSave}
                disabled={saving || loadingOptions}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Form Content */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Inventory sx={{ mr: 1 }} />
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={product.ProductName || ''}
                  onChange={(e) => handleChange('ProductName', e.target.value)}
                  disabled={!isEditing}
                  error={!!errors.ProductName}
                  helperText={errors.ProductName}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  value={product.SKU || ''}
                  onChange={(e) => handleChange('SKU', e.target.value)}
                  disabled={!isEditing}
                  error={!!errors.SKU}
                  helperText={errors.SKU}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={product.Description || ''}
                  onChange={(e) => handleChange('Description', e.target.value)}
                  disabled={!isEditing}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Pricing Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney sx={{ mr: 1 }} />
              Pricing
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={product.Price || ''}
                  onChange={(e) => handleChange('Price', parseFloat(e.target.value) || 0)}
                  disabled={!isEditing}
                  error={!!errors.Price}
                  helperText={errors.Price}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cost"
                  type="number"
                  value={product.Cost || ''}
                  onChange={(e) => handleChange('Cost', parseFloat(e.target.value) || 0)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              {product.Price && product.Cost && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Margin: {formatCurrency(product.Price - product.Cost)} 
                    ({(((product.Price - product.Cost) / product.Price) * 100).toFixed(1)}%)
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Classification */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Category sx={{ mr: 1 }} />
              Classification
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.CategoryID}>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={product.CategoryID || ''}
                    onChange={(e) => handleChange('CategoryID', e.target.value)}
                    disabled={!isEditing || loadingOptions}
                    label="Category *"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.CategoryID} value={category.CategoryID}>
                        {category.CategoryName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.CategoryID && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.CategoryID}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.AccountID}>
                  <InputLabel>Account *</InputLabel>
                  <Select
                    value={product.AccountID || ''}
                    onChange={(e) => handleChange('AccountID', e.target.value)}
                    disabled={!isEditing || loadingOptions}
                    label="Account *"
                  >
                    {accounts.map((account) => (
                      <MenuItem key={account.AccountID} value={account.AccountID}>
                        {account.AccountName}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.AccountID && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.AccountID}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={product.IsActive || false}
                      onChange={(e) => handleChange('IsActive', e.target.checked)}
                      disabled={!isEditing}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Created Date"
                  value={formatDate(product.CreatedAt)}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Updated Date"
                  value={formatDate(product.UpdatedAt)}
                  disabled
                  variant="outlined"
                />
              </Grid>
              {product.CreatedBy && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Created By"
                    value={product.CreatedBy}
                    disabled
                    variant="outlined"
                  />
                </Grid>
              )}
              {product.UpdatedBy && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Updated By"
                    value={product.UpdatedBy}
                    disabled
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}