
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
   
  Button, 
  Grid, 
  Box ,
  TextField, 
  Typography 
} from '@mui/material';
import { createActivity } from '../services/activityService';

const CreateActivitiesPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    AccountID: "",
    TypeID: "",
    Due_date: "",
    Priority: "",
    
  });

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

      <form onSubmit={handleSubmit}>
        
          <Grid item xs={20} sm={10}>
            <TextField
              label="Account ID"
              name="AccountID"
              value={formData.AccountID}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              label="Type ID"
              name="TypeID"
              value={formData.TypeID}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Due Date"
              name="Due_date"
              value={formData.Due_date}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Priority"
              name="Priority"
              value={formData.Priority}
              onChange={handleInputChange}
              fullWidth
            />
            </Grid>
      </form>
    </Box>
  );
};





export default CreateActivitiesPage;