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
    Priority: "",
    DueToStart: "",
    DueToEnd: "",
    Completed: ""
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Box>

      <Grid item xs={20} sm={10}>
        <SmartDropdown
          label="Account"
          name="AccountID"
          value={formData.AccountID}
          onChange={handleInputChange}
          service={accountService}
          displayField="AccountName"
          valueField="AccountID"
          placeholder="Search for account..."
          required
          fullWidth
        />

        <SmartDropdown
          label="Activity Type"
          name="TypeID"
          value={formData.TypeID}
          onChange={handleInputChange}
          service={activityTypeService}
          displayField="TypeName"
          valueField="TypeID"
          placeholder="Search for activity type..."
          //make a create activity type page to use in the below command
          // onCreateNewClick={() => setShowActivityTypePopup(true)}
          fullWidth
        />

        <SmartDropdown
          label="Priority"
          name="PriorityLevelID"
          value={formData.PriorityLevelID}
          onChange={handleInputChange}
          service={priorityLevelService}
          displayField="PriorityLevelName"
          valueField="PriorityLevelID"
          placeholder="Search for priority level..."
          //make a create priority level page to use in the below command
          // onCreateNewClick={() => setShowPriorityPopup(true)}
          fullWidth
        />

        <TextField
          label="DueToStart"
          name="DueToStart"
          value={formData.DueToStart}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          label="DueToEnd"
          name="DueToEnd"
          value={formData.DueToEnd}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          label="Completed"
          name="Completed"
          value={formData.Completed}
          onChange={handleInputChange}
          fullWidth
        />
      </Grid>
    </Box>
  );
};

export default CreateActivitiesPage;

