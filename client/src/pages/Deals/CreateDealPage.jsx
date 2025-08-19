import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Grid,
  Box,
  TextField,
  Typography
} from '@mui/material';
import { createDeal } from '../../services/dealService';
import { getAllAccounts } from '../../services/accountService';
import SmartDropdown from '../../components/SmartDropdown';
import { dealStageService } from '../../services/dropdownServices';

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

  // Account service wrapper for dropdown - matching your pattern
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
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Box>

      <Grid item xs={20} sm={10}>
        <SmartDropdown
          label="Account ID"
          name="AccountID"
          value={formData.AccountID}
          onChange={handleInputChange}
          service={accountService}
          displayField="AccountName"
          valueField="AccountID"
          // onCreateNewClick={() => setShowAccountPopup(true)}
          fullWidth
        />

        <SmartDropdown
          label="Deal Stage ID"
          name="DealStageID"
          value={formData.DealStageID}
          onChange={handleInputChange}
          service={dealStageService}
          displayField="StageName"
          valueField="DealStageID"
          // onCreateNewClick={() => setShowDealStagePopup(true)}
          fullWidth
        />


        <TextField
          label="Deal Name"
          name="DealName"
          value={formData.DealName}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          label="Value"
          name="Value"
          value={formData.Value}
          onChange={handleInputChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="CloseDate"
          name="CloseDate"
          value={formData.CloseDate}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          label="Probability"
          name="Probability"
          value={formData.Probability}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          label="CurrencyID"
          name="CurrencyID"
          value={formData.CurrencyID}
          onChange={handleInputChange}
          fullWidth
        />
        
      </Grid>
    </Box>
  );
};

export default CreateDealPage;