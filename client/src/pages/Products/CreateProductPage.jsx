import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  IconButton,
} from '@mui/material';
import { ArrowBack, Save, Clear, Add, Close as CloseIcon, Category as CategoryIcon } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { createProduct } from '../../services/productService';
import { getAllAccounts } from '../../services/accountService';
<<<<<<< HEAD
import { getAllCategories } from '../../services/categoryService';
import SmartDropdown from '../../components/SmartDropdown';
=======
import { getAllCategories, createCategory } from '../../services/categoryService';
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
import theme from "../../components/Theme";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ CategoryName: '', Active: true });
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    ProductName: "",
    Description: "",
    Price: "",
    Cost: "",
    SKU: "",
    CategoryID: "",
    AccountID: "",
  });

  // Get current user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.UserID) {
      setError('User not authenticated. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    setCurrentUser(user);
  }, [navigate]);

  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#ff4444', marginRight: '4px' }}></span>
        {fieldErrors[fieldName][0]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => {
    return fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;
  };

  const validateField = (name, value) => {
    const errors = [];

    switch (name) {
      case 'ProductName':
        if (!value || value.trim().length === 0) {
          errors.push('Product name is required');
        } else if (value.trim().length < 2) {
          errors.push('Product name must be at least 2 characters');
        } else if (value.trim().length > 100) {
          errors.push('Product name must be 100 characters or less');
        } else if (!/^[a-zA-Z0-9\s\-_.,&()]+$/.test(value.trim())) {
          errors.push('Product name contains invalid characters');
        }
        break;

      case 'Description':
        if (value && value.trim().length > 255) {
          errors.push('Description must be 255 characters or less');
        } else if (value && !/^[a-zA-Z0-9\s\-_.,&()!?]+$/.test(value.trim())) {
          errors.push('Description contains invalid characters');
        }
        break;

      case 'SKU':
        if (value && value.trim() !== '') {
          const skuPattern = /^[a-zA-Z0-9\-_]+$/;
          if (!skuPattern.test(value.trim())) {
            errors.push('SKU can only contain letters, numbers, dashes, and underscores');
          } else if (value.trim().length > 50) {
            errors.push('SKU must be 50 characters or less');
          }
        }
        break;

      case 'Price':
        if (!value || value.trim().length === 0) {
          errors.push('Price is required');
        } else {
          const price = parseFloat(value);
          if (isNaN(price) || price < 0) {
            errors.push('Price must be a positive number');
          } else if (price > 999999.99) {
            errors.push('Price must be less than 999,999.99');
          } else if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) {
            errors.push('Price must have at most 2 decimal places (e.g., 99.99)');
          }
        }
        break;

      case 'Cost':
        if (value && value.trim() !== '') {
          const cost = parseFloat(value);
          if (isNaN(cost) || cost < 0) {
            errors.push('Cost must be a positive number');
          } else if (cost > 999999) {
            errors.push('Cost must be less than 999,999');
          } else if (!/^\d+$/.test(value.trim())) {
            errors.push('Cost must be a whole number');
          }
        }
        break;

      case 'CategoryID':
        if (!value) {
          errors.push('Category is required');
        }
        break;

      case 'AccountID':
        if (!value) {
          errors.push('Account is required');
        }
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const newFieldErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const errors = validateField(field, formData[field]);
      if (errors.length > 0) {
        newFieldErrors[field] = errors;
        isValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const isFormValid = () => {
    // Check required fields
    if (!formData.ProductName || formData.ProductName.trim().length === 0) {
      return false;
    }
    if (!formData.Price || formData.Price.trim().length === 0) {
      return false;
    }
    if (!formData.CategoryID) {
      return false;
    }
    if (!formData.AccountID) {
      return false;
    }

    // Check if there are any validation errors
    const allErrors = {};
    Object.keys(formData).forEach(key => {
      const errors = validateField(key, formData[key]);
      if (errors.length > 0) {
        allErrors[key] = errors;
      }
    });

    return Object.keys(allErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Real-time validation
    const errors = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors.length > 0 ? errors : undefined
    }));

    if (error) {
      setError(null);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const errors = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors.length > 0 ? errors : undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!currentUser || !currentUser.UserID) {
      setError('User not authenticated. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors below before submitting");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        Price: parseFloat(formData.Price),
        Cost: formData.Cost ? parseFloat(formData.Cost) : null,
        CategoryID: parseInt(formData.CategoryID),
        AccountID: parseInt(formData.AccountID),
        changedBy: currentUser.UserID,
      };

      console.log('Submitting product data:', submitData);

      await createProduct(submitData);
      
      // Navigate immediately on success
      navigate('/products');

    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error.response?.status === 409) {
        setFieldErrors(prev => ({
          ...prev,
          SKU: ['Product with this SKU already exists']
        }));
        setTouched(prev => ({
          ...prev,
          SKU: true
        }));
        setError('Product with this SKU already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Unauthorized. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to create product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

<<<<<<< HEAD
  // Show loading state while checking authentication
  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }
=======
  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getAllCategories();
        const active = Array.isArray(data) ? data.filter(c => c.Active === true || c.Active === 1) : [];
        setCategories(active);
      } catch (e) {
        console.error('Error loading categories:', e);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const data = await getAllAccounts();
        const activeAccounts = Array.isArray(data) ? data.filter(acc => acc.IsActive === true || acc.IsActive === 1) : [];
        setAccounts(activeAccounts);
      } catch (e) {
        console.error('Error loading accounts:', e);
        setError('Failed to load accounts');
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadAccounts();
  }, []);

  const handleOpenAddCategoryDialog = () => {
    setAddCategoryDialogOpen(true);
    setNewCategory({ CategoryName: '', Active: true });
  };

  const handleCloseAddCategoryDialog = () => {
    setAddCategoryDialogOpen(false);
    setNewCategory({ CategoryName: '', Active: true });
  };

  const handleCategoryInputChange = (field, value) => {
    setNewCategory(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCategory = async () => {
    if (!newCategory.CategoryName.trim()) {
      setError('Category name is required');
      return;
    }
    setAddCategoryLoading(true);
    try {
      const created = await createCategory(newCategory);
      handleCloseAddCategoryDialog();
      setSuccessMessage(`Category "${created.CategoryName}" added successfully`);
      const refreshed = await getAllCategories();
      const active = Array.isArray(refreshed) ? refreshed.filter(c => c.Active === true || c.Active === 1) : [];
      setCategories(active);
      setFormData(prev => ({ ...prev, CategoryID: created.CategoryID }));
    } catch (e) {
      console.error('Failed to add category:', e);
      setError('Failed to add category');
    } finally {
      setAddCategoryLoading(false);
    }
  };
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
                Create New Product
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ minWidth: 'auto' }}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid()}
                sx={{
                  backgroundColor: '#050505',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    name="ProductName"
                    value={formData.ProductName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('ProductName')}
                    helperText={getFieldError('ProductName') || `${formData.ProductName.length}/100 characters`}
                    FormHelperTextProps={{ component: 'div' }}
                    inputProps={{ maxLength: 100 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="Description"
                    value={formData.Description}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    multiline
                    rows={3}
                    disabled={isSubmitting}
                    error={isFieldInvalid('Description')}
                    helperText={getFieldError('Description') || `${formData.Description.length}/255 characters`}
                    FormHelperTextProps={{ component: 'div' }}
                    inputProps={{ maxLength: 255 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                        },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="SKU"
                    name="SKU"
                    value={formData.SKU}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('SKU')}
                    helperText={getFieldError('SKU') || 'Optional - Letters, numbers, dashes, underscores'}
                    FormHelperTextProps={{ component: 'div' }}
                    placeholder="PROD-001"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                        },
                      },
                    }}
                  />
                </Box>

                <Box>
<<<<<<< HEAD
                  <SmartDropdown
                    label="Category"
                    name="CategoryID"
                    value={formData.CategoryID}
                    onChange={handleInputChange}
                    service={{
                      getAll: async () => {
                        const response = await getAllCategories();
                        return response.data || response;
                      }
                    }}
                    displayField="CategoryName"
                    valueField="CategoryID"
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('CategoryID')}
                    helperText={getFieldError('CategoryID')}
                  />
=======
                  <FormControl fullWidth error={isFieldInvalid('CategoryID')}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category-select"
                      name="CategoryID"
                      value={formData.CategoryID || ''}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      label="Category"
                      disabled={loadingCategories || isSubmitting}
                    >
                      {/* Add Category Option */}
                      <MenuItem 
                        value=""
                        sx={{ 
                          color: '#1976d2', 
                          fontWeight: 600,
                          borderBottom: '1px solid #e0e0e0',
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddCategoryDialogOpen(true);
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Add fontSize="small" />
                          Add Category
                        </Box>
                      </MenuItem>

                      {loadingCategories && (
                        <MenuItem disabled value=""><em>Loading categories...</em></MenuItem>
                      )}
                      {!loadingCategories && categories.length === 0 && (
                        <MenuItem disabled value=""><em>No categories available</em></MenuItem>
                      )}
                      {!loadingCategories && categories.length > 0 && categories.map(cat => (
                        <MenuItem key={cat.CategoryID} value={cat.CategoryID}>
                          {cat.CategoryName}
                        </MenuItem>
                      ))}
                    </Select>
                    {getFieldError('CategoryID')}
                  </FormControl>
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
                </Box>

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <FormControl fullWidth error={isFieldInvalid('AccountID')}>
                    <InputLabel id="account-label">Account</InputLabel>
                    <Select
                      labelId="account-label"
                      id="account-select"
                      name="AccountID"
                      value={formData.AccountID || ''}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      label="Account"
                      required
                      disabled={loadingAccounts || isSubmitting}
                    >
                      <MenuItem value=""><em>Select an account</em></MenuItem>
                      {loadingAccounts && (
                        <MenuItem disabled value=""><em>Loading accounts...</em></MenuItem>
                      )}
                      {!loadingAccounts && accounts.length === 0 && (
                        <MenuItem disabled value=""><em>No accounts available</em></MenuItem>
                      )}
                      {!loadingAccounts && accounts.length > 0 && accounts.map(account => (
                        <MenuItem key={account.AccountID} value={account.AccountID}>
                          {account.AccountName}
                        </MenuItem>
                      ))}
                    </Select>
                    {getFieldError('AccountID')}
                  </FormControl>
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Price"
                    name="Price"
                    type="number"
                    inputProps={{ step: "0.01", min: 0 }}
                    value={formData.Price}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('Price')}
                    helperText={getFieldError('Price') || 'Enter amount (e.g., 99.99)'}
                    FormHelperTextProps={{ component: 'div' }}
                    placeholder="0.00"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                        },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Cost"
                    name="Cost"
                    type="number"
                    inputProps={{ min: 0 }}
                    value={formData.Cost}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('Cost')}
                    helperText={getFieldError('Cost') || 'Optional - Enter whole number (e.g., 50)'}
                    FormHelperTextProps={{ component: 'div' }}
                    placeholder="0"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                        },
                      },
                    }}
                  />
                </Box>

              </Box>
            </form>
          </Paper>

          {/* Add Category Dialog */}
          <Dialog
            open={addCategoryDialogOpen}
            onClose={handleCloseAddCategoryDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e5e5e5',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon sx={{ color: '#1976d2' }} />
                Add New Category
              </Box>
              <IconButton onClick={handleCloseAddCategoryDialog} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Category Name"
                  value={newCategory.CategoryName}
                  onChange={(e) => handleCategoryInputChange('CategoryName', e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  helperText="Enter the name of the category (e.g., Electronics, Software)"
                  inputProps={{ maxLength: 255 }}
                  sx={{ mt: 2 }}
                  autoFocus
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={newCategory.Active}
                      onChange={(e) => handleCategoryInputChange('Active', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e5e5' }}>
              <Button onClick={handleCloseAddCategoryDialog} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={handleAddCategory}
                variant="contained"
                disabled={addCategoryLoading || !newCategory.CategoryName.trim()}
              >
                {addCategoryLoading ? <CircularProgress size={20} /> : 'Add Category'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CreateProduct;