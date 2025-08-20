import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Grid,
  Box,
  TextField,
  Typography
} from '@mui/material';
import { createActivity } from '../../services/activityService';
import { getAllAccounts } from '../../services/accountService';
import SmartDropdown from '../../components/SmartDropdown';
import { activityTypeService, priorityLevelService } from '../../services/dropdownServices';

const CreateActivitiesPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    AccountID: "",
    TypeID: "",
    PriorityLevelID: "",
    DueToStart: "",
    DueToEnd: "",
    Completed: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Required fields only
  const requiredFields = ['AccountID', 'TypeID', 'PriorityLevelID', 'DueToStart', 'DueToEnd'];

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
      if (name === "DueToStart") {
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$|^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
          error = "Please enter a valid date and time.";
        } else {
          const startDate = new Date(strValue);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (startDate < today) {
            error = "Start date cannot be in the past.";
          }
        }
      }
      if (name === "DueToEnd") {
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$|^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
          error = "Please enter a valid date and time.";
        } else {
          const endDate = new Date(strValue);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (endDate < today) {
            error = "End date cannot be in the past.";
          }
          
          // Check if end date is after start date
          if (formData.DueToStart && strValue) {
            const startDate = new Date(formData.DueToStart);
            const endDateForComparison = new Date(strValue);
            if (endDateForComparison <= startDate) {
              error = "End date must be after start date.";
            }
          }
        }
      }
      if (name === "Completed") {
        if (!['true', 'false', '1', '0', 'yes', 'no'].includes(strValue.toLowerCase())) {
          error = "Completed must be true/false, 1/0, or yes/no.";
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

    // Special case: Re-validate end date when start date changes
    if (name === 'DueToStart' && formData.DueToEnd && touched.DueToEnd) {
      const endDateError = validateField('DueToEnd', formData.DueToEnd);
      setErrors(prev => ({
        ...prev,
        DueToEnd: endDateError
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
      console.log('Creating activity:', formData);
      await createActivity(formData);
      navigate('/activities');
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Failed to create activity. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/activities');
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
        Create New Activity
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
          label="Account"
          name="AccountID"
          value={formData.AccountID}
          onChange={handleInputChange}
          onBlur={handleBlur}
          service={accountService}
          displayField="AccountName"
          valueField="AccountID"
          placeholder="Search for account..."
          fullWidth
          error={touched.AccountID && !!errors.AccountID}
          helperText={touched.AccountID && errors.AccountID}
        />

        <SmartDropdown
          label="Activity Type"
          name="TypeID"
          value={formData.TypeID}
          onChange={handleInputChange}
          onBlur={handleBlur}
          service={activityTypeService}
          displayField="TypeName"
          valueField="TypeID"
          placeholder="Search for activity type..."
          margin="normal"
          fullWidth
          error={touched.TypeID && !!errors.TypeID}
          helperText={touched.TypeID && errors.TypeID}
        />

        <SmartDropdown
          label="Priority Level"
          name="PriorityLevelID"
          value={formData.PriorityLevelID}
          onChange={handleInputChange}
          onBlur={handleBlur}
          service={priorityLevelService}
          displayField="PriorityLevelName"
          valueField="PriorityLevelID"
          placeholder="Search for priority level..."
          margin="normal"
          fullWidth
          error={touched.PriorityLevelID && !!errors.PriorityLevelID}
          helperText={touched.PriorityLevelID && errors.PriorityLevelID}
        />

        <TextField
          label="Due To Start"
          name="DueToStart"
          type="datetime-local"
          value={formData.DueToStart}
          onChange={handleInputChange}
          onBlur={handleBlur}
          margin="normal"
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          error={touched.DueToStart && !!errors.DueToStart}
          helperText={touched.DueToStart && errors.DueToStart}
        />

        <TextField
          label="Due To End"
          name="DueToEnd"
          type="datetime-local"
          value={formData.DueToEnd}
          onChange={handleInputChange}
          onBlur={handleBlur}
          margin="normal"
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          error={touched.DueToEnd && !!errors.DueToEnd}
          helperText={touched.DueToEnd && errors.DueToEnd}
        />

        <TextField
          label="Completed"
          name="Completed"
          value={formData.Completed}
          onChange={handleInputChange}
          onBlur={handleBlur}
          margin="normal"
          fullWidth
          placeholder="Enter: true/false, 1/0, or yes/no"
          error={touched.Completed && !!errors.Completed}
          helperText={touched.Completed && errors.Completed}
        />
      </Grid>
    </Box>
  );
};

export default CreateActivitiesPage;