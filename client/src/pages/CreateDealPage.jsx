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
        Create New Deal
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

          <TextField
            label="Deal Name"
            name="DealName"
            value={formData.DealName}
            onChange={handleInputChange}
            required
            fullWidth
            size="medium"
            InputLabelProps={{ shrink: true }}
          />

          <SmartDropdown
            label="Deal Stage"
            name="DealStageID"
            value={formData.DealStageID}
            onChange={handleInputChange}
            service={dealStageService}
            displayField="StageName"
            valueField="DealStageID"
            placeholder="Search for deal stage..."
            required
            createFields={[
              { name: 'StageName', label: 'Stage Name', required: true },
              { name: 'StageOrder', label: 'Stage Order', type: 'number', required: true },
              { name: 'DefaultProbability', label: 'Default Probability (%)', type: 'number' },
              { name: 'Description', label: 'Description', multiline: true, rows: 3 }
            ]}
            fullWidth
          />

          <TextField
            label="Value"
            name="Value"
            type="number"
            value={formData.Value}
            onChange={handleInputChange}
            fullWidth
            size="medium"
            inputProps={{ step: "0.01", min: "0" }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Close Date"
            name="CloseDate"
            type="date"
            value={formData.CloseDate}
            onChange={handleInputChange}
            fullWidth
            size="medium"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Probability (%)"
            name="Probability"
            type="number"
            value={formData.Probability}
            onChange={handleInputChange}
            fullWidth
            size="medium"
            inputProps={{ min: "0", max: "100" }}
            helperText="Percentage chance of closing (0-100)"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Created At"
            name="CreatedAt"
            type="datetime-local"
            value={formData.CreatedAt}
            onChange={handleInputChange}
            fullWidth
            size="medium"
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Leave empty for current timestamp"
          />

          <TextField
            label="Updated At"
            name="UpdatedAt"
            type="datetime-local"
            value={formData.UpdatedAt}
            onChange={handleInputChange}
            fullWidth
            size="medium"
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Leave empty for current timestamp"
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
              Save Deal
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CreateDealPage;
