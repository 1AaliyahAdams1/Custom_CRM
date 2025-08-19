import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Grid,
  Box,
  TextField,
  Typography
} from '@mui/material';
import { createDeal } from '../services/dealService';
import { getAllAccounts } from '../services/accountService';
import SmartDropdown from '../components/SmartDropdown';
import { dealStageService } from '../services/dropdownServices';

const CreateDealPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    DealID: "",
    AccountID: "",
    DealStageID: "",
    DealName: "",
    Value: "",
    CloseDate: "",
    Probability: "",
    CurrencyID: "",
    CreatedAt: "",
    UpdatedAt: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Required fields only
  const requiredFields = ['AccountID', 'DealStageID', 'DealName', 'Value', 'CloseDate', 'Probability', 'CurrencyID'];

  // --- VALIDATION LOGIC ---
  const validateField = (name, value) => {
    let error = "";
    const strValue = (value ?? "").toString().trim();

    // Check if field is required
    if (requiredFields.includes(name)) {
      if (!strValue) {
        error = "This field is required.";
        return error;
      }
    }

    // Field-specific validation (only if field has value)
    if (strValue) {
      if (name === "DealName") {
        if (strValue.length < 3) {
          error = "Deal name must be at least 3 characters long.";
        } else if (!/^[A-Za-z\s]+$/.test(strValue)) {
          error = "Deal name should only contain letters and spaces.";
        }
      }
      if (name === "Value") {
        if (isNaN(strValue) || Number(strValue) < 0) {
          error = "Please enter a valid positive numeric value.";
        }
      }
      if (name === "Probability") {
        const num = Number(strValue);
        if (isNaN(num)) {
          error = "Please enter a valid number.";
        } else if (num < 0 || num > 100) {
          error = "Probability must be between 0 and 100.";
        }
      }
      if (name === "CloseDate") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
          error = "Please enter a valid date in YYYY-MM-DD format.";
        }
      }
    }

    return error;
  };

  const validateForm = () => {
    let newErrors = {};
    // Only validate required fields for form submission
    requiredFields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Live validation: only validate if field has been touched
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Mark all required fields as touched to show errors
      const newTouched = {};
      requiredFields.forEach(field => {
        newTouched[field] = true;
      });
      setTouched(prev => ({ ...prev, ...newTouched }));
      return;
    }
    try {
      console.log('Creating deal:', formData);
      await createDeal(formData);
      navigate('/deals');
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/deals');
  };

  // Check if all required fields are filled and have no errors
  const isFormValid = () => {
    const formErrors = validateForm();
    return Object.keys(formErrors).length === 0;
  };

  // Account service wrapper for dropdown
  const accountService = {
    getAll: async () => {
      try {
        const response = await getAllAccounts();
        return response.data || [];
      } catch (error) {
        console.error('Error loading accounts:', error);
        return [];
      }
    },
  };

  return (
    <Box p={4} maxWidth={900} mx="auto">
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Create New Deal
      </Typography>

      {/* Buttons at the top */}
      <Box mb={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          Save
        </Button>
      </Box>

      <Grid item xs={20} sm={10}>
        <SmartDropdown
          label="Account ID"
          name="AccountID"
          value={formData.AccountID}
          onChange={handleInputChange}
          onBlur={handleBlur}
          service={accountService}
          displayField="AccountName"
          valueField="AccountID"
          fullWidth
          error={touched.AccountID && !!errors.AccountID}
          helperText={touched.AccountID && errors.AccountID}
        />

        <SmartDropdown
          label="Deal Stage ID"
          name="DealStageID"
          value={formData.DealStageID}
          onChange={handleInputChange}
          onBlur={handleBlur}
          service={dealStageService}
          displayField="StageName"
          valueField="DealStageID"
          margin="normal"
          fullWidth
          error={touched.DealStageID && !!errors.DealStageID}
          helperText={touched.DealStageID && errors.DealStageID}
        />

        <TextField
          label="Deal Name"
          name="DealName"
          value={formData.DealName}
          onChange={handleInputChange}
          onBlur={handleBlur}
          margin="normal"
          fullWidth
          error={touched.DealName && !!errors.DealName}
          helperText={touched.DealName && errors.DealName}
        />

        <TextField
          label="Value"
          name="Value"
          type="number"
          value={formData.Value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          margin="normal"
          fullWidth
          error={touched.Value && !!errors.Value}
          helperText={touched.Value && errors.Value}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Close Date"
          name="CloseDate"
          value={formData.CloseDate}
          onChange={handleInputChange}
          onBlur={handleBlur}
          margin="normal"
          fullWidth
          error={touched.CloseDate && !!errors.CloseDate}
          helperText={touched.CloseDate && errors.CloseDate}
        />

        <TextField
          label="Probability (%)"
          name="Probability"
          type="number"
          value={formData.Probability}
          onChange={handleInputChange}
          onBlur={handleBlur}
          margin="normal"
          fullWidth
          error={touched.Probability && !!errors.Probability}
          helperText={touched.Probability && errors.Probability}
        />

        <TextField
          label="Currency ID"
          name="CurrencyID"
          value={formData.CurrencyID}
          onChange={handleInputChange}
          onBlur={handleBlur}
          margin="normal"
          fullWidth
          error={touched.CurrencyID && !!errors.CurrencyID}
          helperText={touched.CurrencyID && errors.CurrencyID}
        />
      </Grid>
    </Box>
  );
};

export default CreateDealPage;