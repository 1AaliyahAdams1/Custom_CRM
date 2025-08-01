
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
   
  Button, 
  Grid, 
  Box ,
  TextField, 
  Typography 
} from '@mui/material';
import { createAccount } from '../services/accountService';

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
    ParentAccount: "",
    
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
      console.log('Creating account:', formData);
      await createAccount(formData);
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
    <Box p={4} maxWidth={900} mx="auto">
        {/* Page Title */}
              <Typography variant="h4" gutterBottom>
                Create New Account
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
          Save Account
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        
          <Grid item xs={20} sm={10}>
            <TextField
              label="Account Name"
              name="AccountName"
              value={formData.AccountName}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              label="City ID"
              name="CityID"
              value={formData.CityID}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Street Address 1"
              name="street_address1"
              value={formData.street_address1}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Street Address 2"
              name="street_address2"
              value={formData.street_address2}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Street Address 3"
              name="street_address3"
              value={formData.street_address3}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>



          <Grid item xs={12} sm={6}>
            <TextField
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Primary Phone"
              name="PrimaryPhone"
              value={formData.PrimaryPhone}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Industry ID"
              name="IndustryID"
              value={formData.IndustryID}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Website"
              name="Website"
              value={formData.Website}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Fax"
              name="fax"
              value={formData.fax}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Number of Employees"
              name="number_of_employees"
              type="number"
              value={formData.number_of_employees}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Annual Revenue"
              name="annual_revenue"
              type="number"
              value={formData.annual_revenue}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Number of Venues"
              name="number_of_venues"
              type="number"
              value={formData.number_of_venues}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Number of Releases"
              name="number_of_releases"
              type="number"
              value={formData.number_of_releases}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Number of Events Annually"
              name="number_of_events_anually"
              type="number"
              value={formData.number_of_events_anually}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Parent Account"
              name="ParentAccount"
              value={formData.ParentAccount}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
        
      </form>
    </Box>
  );
};





export default CreateAccountPage;