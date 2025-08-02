import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Box,
  TextField, 
  Typography,
  Paper,
  Stack
} from '@mui/material';
import { createActivity } from '../services/activityService';
import { getAllAccounts } from '../services/accountService';
import SmartDropdown from '../components/SmartDropdown';
import { activityTypeService, priorityLevelService } from '../services/dropdownServices';

const CreateActivitiesPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    AccountID: "",
    TypeID: "",
    Due_date: "",
    Priority: "",
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
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: 4,
        backgroundColor: '#f9fafb',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgb(0 0 0 / 0.05)'
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        mb={3}
        color="primary.main"
        textAlign="center"
        letterSpacing={1}
      >
        Create New Activity
      </Typography>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: '#fff',
          boxShadow: '0 8px 20px rgb(0 0 0 / 0.1)',
        }}
        elevation={3}
      >
        <Stack spacing={3}>
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
            createFields={[
              { name: 'TypeName', label: 'Type Name', required: true },
              { name: 'Description', label: 'Description', multiline: true, rows: 3 }
            ]}
            fullWidth
          />

          <TextField
            label="Due Date"
            name="Due_date"
            type="datetime-local"
            value={formData.Due_date}
            onChange={handleInputChange}
            fullWidth
            size="medium"
            InputLabelProps={{ shrink: true }}
          />

          <SmartDropdown
            label="Priority"
            name="Priority"
            value={formData.Priority}
            onChange={handleInputChange}
            service={priorityLevelService}
            displayField="PriorityName"
            valueField="PriorityID"
            placeholder="Search for priority level..."
            createFields={[
              { name: 'PriorityName', label: 'Priority Name', required: true },
              { name: 'PriorityLevel', label: 'Priority Level (1-10)', type: 'number', required: true },
              { name: 'Description', label: 'Description', multiline: true, rows: 2 }
            ]}
            fullWidth
          />

          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(-1)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Save Activity
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CreateActivitiesPage;
