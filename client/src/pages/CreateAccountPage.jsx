import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
  TextField,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import { createAccount, getAllAccounts } from '../services/accountService';
import SmartDropdown from '../components/SmartDropdown';
import { cityService, industryService } from '../services/dropdownServices';

const parentAccountService = {
  getAll: async () => {
    try {
      const response = await getAllAccounts();
      return response.data || []; 
    } catch (error) {
      console.error('Error loading parent accounts:', error);
      return [];
    }
  },
};

const CreateAccountPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    AccountName: "",
    CityID: "",
    street_address1: "",
    street_address2: "",
    street_address3: "",
    postal_code: "",
    PrimaryPhone: "",
    IndustryID: "",
    Website: "",
    fax: "",
    email: "",
    number_of_employees: "",
    annual_revenue: "",
    number_of_venues: "",
    number_of_releases: "",
    number_of_events_anually: "",
    ParentAccount: null,
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

    const cleanedData = {
      ...formData,
      ParentAccount: formData.ParentAccount || null
    };

    try {
      await createAccount(cleanedData);
      navigate('/accounts');
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/accounts');
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
        Create New Account
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
          <TextField
            label="Account Name"
            name="AccountName"
            value={formData.AccountName}
            onChange={handleInputChange}
            required
            fullWidth
            size="medium"
            InputLabelProps={{ shrink: true }}
          />

          <SmartDropdown
            label="City"
            name="CityID"
            value={formData.CityID}
            onChange={handleInputChange}
            service={cityService}
            displayField="CityName"
            valueField="CityID"
            createFields={[
              { name: 'CityName', label: 'City Name', required: true },
              { name: 'StateProvinceID', label: 'State/Province ID', type: 'number' },
              { name: 'CountryID', label: 'Country ID', type: 'number' }
            ]}
            fullWidth
          />

          <SmartDropdown
            label="Industry"
            name="IndustryID"
            value={formData.IndustryID}
            onChange={handleInputChange}
            service={industryService}
            displayField="IndustryName"
            valueField="IndustryID"
            createFields={[
              { name: 'IndustryName', label: 'Industry Name', required: true }
            ]}
            fullWidth
          />

          <TextField
            label="Street Address 1"
            name="street_address1"
            value={formData.street_address1}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Street Address 2"
            name="street_address2"
            value={formData.street_address2}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Street Address 3"
            name="street_address3"
            value={formData.street_address3}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Postal Code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Primary Phone"
            name="PrimaryPhone"
            value={formData.PrimaryPhone}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Fax"
            name="fax"
            value={formData.fax}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Website"
            name="Website"
            value={formData.Website}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Number of Employees"
            name="number_of_employees"
            type="number"
            value={formData.number_of_employees}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Annual Revenue"
            name="annual_revenue"
            type="number"
            value={formData.annual_revenue}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Number of Venues"
            name="number_of_venues"
            type="number"
            value={formData.number_of_venues}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Number of Releases"
            name="number_of_releases"
            type="number"
            value={formData.number_of_releases}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <TextField
            label="Number of Events Annually"
            name="number_of_events_anually"
            type="number"
            value={formData.number_of_events_anually}
            onChange={handleInputChange}
            fullWidth
            size="medium"
          />

          <SmartDropdown
            label="Parent Account"
            name="ParentAccount"
            value={formData.ParentAccount}      
            onChange={handleInputChange}       
            service={parentAccountService}      
            displayField="AccountName"           
            valueField="AccountID"               
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
              Save Account
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CreateAccountPage;
