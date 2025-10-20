import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Skeleton
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { getProductById, updateProduct } from '../../services/productService';
import { getAllAccounts } from '../../services/accountService';
import { getAllCategories } from '../../services/categoryService';
import SmartDropdown from '../../components/SmartDropdown';
import theme from "../../components/Theme";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    ProductName: "",
    Description: "",
    Price: "",
    Cost: "",
    SKU: "",
    CategoryID: "",
    AccountID: "",
  });

  const requiredFields = ['ProductName', 'SKU', 'Price', 'CategoryID', 'AccountID'];

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
    return touched[fieldName] && fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;
  };

  const validateField = (name, value) => {
    const errors = [];

    switch (name) {
      case 'ProductName':
        if (!value || value.trim().length === 0) {
          errors.push('Product name is required');
        } else if (value.trim().length > 100) {
          errors.push('Product name must be 100 characters or less');
        }
        break;

      case 'Description':
        if (value && value.trim().length > 255) {
          errors.push('Description must be 255 characters or less');
        }
        break;

      case 'SKU':
        if (!value || value.trim().length === 0) {
          errors.push('SKU is required');
        } else {
          const skuPattern = /^[A-Z]{3,7}-\d{3}$/;
          if (!skuPattern.test(value.trim())) {
            errors.push('Invalid SKU format. Example: LNTMS-001 (3-7 uppercase letters, hyphen, 3 digits)');
          }
        }
        break;

      case 'Price':
        if (!value || value.trim().length === 0) {
          errors.push('Price is required');
        } else {
          const price = parseFloat(value);
          if (isNaN(price) || price < 0) {
            errors.push('Price must be a non-negative number');
          } else if (price > 999999.99) {
            errors.push('Price must be less than 999,999.99');
          } else if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) {
            errors.push('Price must have at most 2 decimal places');
          }
        }
        break;

      case 'Cost':
        if (value && value.trim()) {
          const cost = parseFloat(value);
          if (isNaN(cost) || cost < 0) {
            errors.push('Cost must be a non-negative number');
          } else if (cost > 999999.99) {
            errors.push('Cost must be less than 999,999.99');
          } else if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) {
            errors.push('Cost must have at most 2 decimal places');
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
    // Check if all required fields are valid
    const requiredFieldValid = requiredFields.every(field => {
      const errors = validateField(field, formData[field]);
      return errors.length === 0;
    });

    // Check if all non-empty fields are valid
    const allFieldsValid = Object.keys(formData).every(field => {
      const value = formData[field];
      const strValue = value?.toString().trim();
      
      // If field is empty and not required, it's valid
      if ((!strValue || strValue === '') && !requiredFields.includes(field)) {
        return true;
      }
      
      // If field has value, validate it
      const errors = validateField(field, value);
      return errors.length === 0;
    });

    return requiredFieldValid && allFieldsValid;
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }
      try {
        const response = await getProductById(id);
        const productData = response.data || response;
        
        setFormData({
          ProductName: productData.ProductName || "",
          Description: productData.Description || "",
          Price: productData.Price !== null && productData.Price !== undefined ? productData.Price.toString() : "",
          Cost: productData.Cost !== null && productData.Cost !== undefined ? productData.Cost.toString() : "",
          SKU: productData.SKU || "",
          CategoryID: productData.CategoryID || "",
          AccountID: productData.AccountID || "",
        });
      } catch (err) {
        console.error('Error loading product:', err);
        setError("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

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

    // Always validate the changed field in real-time
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

    // Mark all fields as touched to show validation errors
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate the entire form
    if (!validateForm()) {
      setError("Please fix the errors below before submitting");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        ProductName: formData.ProductName.trim(),
        Description: formData.Description.trim(),
        SKU: formData.SKU.trim(),
        Price: parseFloat(formData.Price),
        Cost: formData.Cost && formData.Cost.trim() ? parseFloat(formData.Cost) : null,
        CategoryID: parseInt(formData.CategoryID),
        AccountID: parseInt(formData.AccountID),
        changedBy: currentUser.UserID,
      };

      console.log('Submitting update data:', submitData);

      await updateProduct(id, submitData);
      navigate("/products");
    } catch (error) {
      console.error('Error updating product:', error);
      
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
        setError('Failed to update product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication or loading product
  if (loading || !currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        width: '100%', 
        backgroundColor: '#fafafa', 
        minHeight: '100vh', 
        p: 3 
      }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
              Edit Product
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBack />} 
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Clear />} 
                onClick={() => navigate("/products")} 
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
                {isSubmitting ? 'Updating...' : 'Update Product'}
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
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('SKU')}
                    helperText={getFieldError('SKU') || 'Format: ABC-123 (3-7 letters, hyphen, 3 digits)'}
                    FormHelperTextProps={{ component: 'div' }}
                    placeholder="LNTMS-001"
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
                  <SmartDropdown
                    label="Category"
                    name="CategoryID"
                    value={formData.CategoryID}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
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
                </Box>

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <SmartDropdown
                    label="Account"
                    name="AccountID"
                    value={formData.AccountID}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    service={{
                      getAll: async () => {
                        const response = await getAllAccounts();
                        return response.data || response;
                      }
                    }}
                    displayField="AccountName"
                    valueField="AccountID"
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('AccountID')}
                    helperText={getFieldError('AccountID')}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Price"
                    name="Price"
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
                    value={formData.Cost}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('Cost')}
                    helperText={getFieldError('Cost') || 'Optional - Enter amount (e.g., 49.99)'}
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

              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditProduct;