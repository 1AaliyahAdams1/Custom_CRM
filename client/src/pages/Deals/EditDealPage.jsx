import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '@mui/material/styles';
import SmartDropdown from '../../components/SmartDropdown';
import { fetchDealById, updateDeal } from "../../services/dealService";
import { dealStageService } from '../../services/dropdownServices';
import { getAllAccounts } from '../../services/accountService';

const EditDealPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    DealID: "",
    AccountID: "",
    DealStageID: "",
    DealName: "",
    Value: "",
    CloseDate: "",
    Probability: "",
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const requiredFields = ['DealStageID', 'DealName', 'Value', 'CloseDate'];

  const validateField = (name, value) => {
    const errors = [];
    const strValue = value?.toString().trim();

    // Required field validation
    if (requiredFields.includes(name) && (!strValue || strValue === '')) {
      errors.push('This field is required.');
    }

    // Only validate if field has value or is required
    if (strValue || requiredFields.includes(name)) {
      switch (name) {
        case 'DealName':
          if (!strValue || strValue === '') {
            errors.push('Deal name is required.');
          } else {
            if (strValue.length < 2) {
              errors.push('Deal name must be at least 2 characters long.');
            }
            if (strValue.length > 255) {
              errors.push('Deal name cannot exceed 255 characters.');
            }
          }
          break;

        case 'Value':
          if (!strValue || strValue === '') {
            errors.push('Deal value is required.');
          } else {
            const value = parseFloat(strValue);
            if (isNaN(value) || value < 0) {
              errors.push('Deal value must be a non-negative number.');
            } else if (value > 999999999999) {
              errors.push('Deal value must be less than 1 trillion.');
            }
          }
          break;

        case 'CloseDate':
          if (!strValue || strValue === '') {
            errors.push('Close date is required.');
          } else {
            const closeDate = new Date(strValue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (isNaN(closeDate.getTime())) {
              errors.push('Please enter a valid date.');
            }
          }
          break;

        case 'Probability':
          if (strValue && strValue !== '') {
            const probability = parseInt(strValue, 10);
            if (isNaN(probability) || probability < 0 || probability > 100) {
              errors.push('Probability must be between 0 and 100.');
            }
          }
          break;

        case 'DealStageID':
          if (!strValue || strValue === '') {
            errors.push('Deal stage selection is required.');
          }
          break;
      }
    }

    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const errors = validateField(field, formData[field]);
      if (errors.length > 0) newErrors[field] = errors;
    });
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center', color: '#ff4444' }}>
         {fieldErrors[fieldName][0]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => touched[fieldName] && fieldErrors[fieldName]?.length > 0;

  // Memoized function to get account name from AccountID
  const accountName = useMemo(() => {
    const list = accounts || []; // fallback to empty array
    if (!list.length || !formData.AccountID) return 'No account selected';
    const account = list.find(acc => acc.AccountID === formData.AccountID);
    return account ? account.AccountName : 'Unknown Account';
  }, [accounts, formData.AccountID]);

  useEffect(() => {
    const loadDealAndAccounts = async () => {
      if (!id) return setError("No deal ID provided");

      try {
        // Fetch both deal data and accounts data
        const [dealResponse, accountsResponse] = await Promise.all([
          fetchDealById(id),
          getAllAccounts()
        ]);

        const dealData = dealResponse.data;
        setFormData({
          DealID: dealData.DealID || "",
          AccountID: dealData.AccountID || "",
          DealStageID: dealData.DealStageID || "",
          DealName: dealData.DealName || "",
          Value: dealData.Value || "",
          CloseDate: dealData.CloseDate || "",
          Probability: dealData.Probability || "",
        });

        setAccounts(accountsResponse.data);
      } catch {
        setError("Failed to load deal data");
      } finally {
        setLoading(false);
      }
    };
    loadDealAndAccounts();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Always validate the changed field in real-time
    const errors = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: errors.length > 0 ? errors : undefined }));

    if (error) setError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    const errors = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: errors.length > 0 ? errors : undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
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

    try {
      setSaving(true);
      await updateDeal(id, formData);
      navigate("/deals");
    } catch {
      setError("Failed to update deal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      p: 3,
      backgroundColor: theme.palette.background.default
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h4" sx={{
                fontWeight: 600,
                color: theme.palette.text.primary
              }}>
                Edit Deal
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
                <Button variant="outlined" startIcon={<Clear />} onClick={() => navigate("/deals")} disabled={saving}>Cancel</Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSubmit}
                  disabled={saving || !isFormValid()}
                >
                  {saving ? 'Updating...' : 'Update Deal'}
                </Button>
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper elevation={0} sx={{
              p: 3,
              backgroundColor: theme.palette.background.paper
            }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Read-only fields  */}
                  <Box sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box>
                      <Typography variant="caption" sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 'medium'
                      }}>
                        Account
                      </Typography>
                      <Typography variant="body1" sx={{
                        fontWeight: 'medium',
                        color: theme.palette.text.primary
                      }}>
                        {accountName}
                      </Typography>
                    </Box>
                  </Box>

                  <SmartDropdown
                    label="Deal Stage"
                    name="DealStageID"
                    value={formData.DealStageID}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    service={dealStageService}
                    displayField="StageName"
                    valueField="DealStageID"
                    disabled={saving}
                    error={isFieldInvalid('DealStageID')}
                    helperText={getFieldError('DealStageID')}
                  />

                  <TextField
                    fullWidth
                    label="Deal Name"
                    name="DealName"
                    value={formData.DealName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={saving}
                    error={isFieldInvalid('DealName')}
                    helperText={getFieldError('DealName')}
                  />

                  <TextField
                    fullWidth
                    label="Value"
                    name="Value"
                    type="number"
                    value={formData.Value}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={saving}
                    error={isFieldInvalid('Value')}
                    helperText={getFieldError('Value')}
                  />

                  <TextField
                    fullWidth
                    label="Close Date"
                    name="CloseDate"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.CloseDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={saving}
                    error={isFieldInvalid('CloseDate')}
                    helperText={getFieldError('CloseDate')}
                  />

                  <TextField
                    fullWidth
                    label="Probability (%)"
                    name="Probability"
                    type="number"
                    value={formData.Probability}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={saving}
                    error={isFieldInvalid('Probability')}
                    helperText={getFieldError('Probability')}
                  />
                </Box>
              </form>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default EditDealPage;