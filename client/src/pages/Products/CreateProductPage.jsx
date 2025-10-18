import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { createProduct } from '../../services/productService';
import { getAllAccounts } from '../../services/accountService';
import { getAllCategories } from '../../services/categoryService';
import SmartDropdown from '../../components/SmartDropdown';
import theme from "../../components/Theme";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    ProductName: "",
    Description: "",
    Price: "",
    Cost: "",
    SKU: "",
    CategoryID: "",
    AccountID: "",
  });

  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#ff4444', marginRight: '4px' }}>✗</span>
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
        if (value && value.trim().length > 1000) {
          errors.push('Description must be 1000 characters or less');
        }
        break;

      case 'SKU':
        if (!value || value.trim().length === 0) {
          errors.push('SKU is required');
        } else {
          const skuPattern = /^[A-Z]{3,7}-\d{3}$/;
          if (!skuPattern.test(value.trim())) {
            errors.push('Invalid SKU format. Example: LNTMS-001');
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
            errors.push('Price must be less than $999,999.99');
          }
        }
        break;

      case 'Cost':
        if (value && value.trim()) {
          const cost = parseFloat(value);
          if (isNaN(cost) || cost < 0) {
            errors.push('Cost must be a non-negative number');
          } else if (cost > 999999.99) {
            errors.push('Cost must be less than $999,999.99');
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

    if (touched[name]) {
      const errors = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: errors.length > 0 ? errors : undefined
      }));
    }

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
      };

      await createProduct(submitData);
      
      setSuccessMessage("Product created successfully!");
      setTimeout(() => navigate('/products'), 1500);

    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error.response?.status === 409) {
        setError('Product with this SKU already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
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
                disabled={isSubmitting}
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

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
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
                    helperText={getFieldError('ProductName')}
                    FormHelperTextProps={{ component: 'div' }}
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
                    helperText={getFieldError('Description')}
                    FormHelperTextProps={{ component: 'div' }}
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
                    helperText={getFieldError('SKU')}
                    FormHelperTextProps={{ component: 'div' }}
                  />
                </Box>

                <Box>
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
                </Box>

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <SmartDropdown
                    label="Account"
                    name="AccountID"
                    value={formData.AccountID}
                    onChange={handleInputChange}
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
                    helperText={getFieldError('Price')}
                    FormHelperTextProps={{ component: 'div' }}
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
                    helperText={getFieldError('Cost')}
                    FormHelperTextProps={{ component: 'div' }}
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

export default CreateProduct;