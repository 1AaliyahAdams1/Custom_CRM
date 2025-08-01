
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
   
  Button, 
  Grid, 
  Box ,
  TextField, 
  Typography 
} from '@mui/material';
import { createContact } from '../services/contactService';

const CreateContactsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ContactID: "",
    AccountID: "",
    PersonID: "",
    Title: "",
    first_name: "",
    middle_name: "",
    surname: "",
    linkedin_link: "",
    personal_email: "",
    personal_mobile: "",
    PersonCityID: "",
    PersonStateProvinceID: "",
    Still_employed: false,
    JobTitleID: "",
    PrimaryEmail: "",
    PrimaryPhone: "",
    Position: "",
    isNewPerson: true,
    
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
      console.log('Creating contact:', formData);
      await createContact(formData);
      navigate('/contacts');
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Failed to create contact. Please try again.');
    }
  };


  const handleCancel = () => {
    navigate('/contacts');
  };

  return (
    <Box p={4} maxWidth={900} mx="auto">
        {/* Page Title */}
              <Typography variant="h4" gutterBottom>
                Create New Contact
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
              label="Contact ID"
              name="ContactID"
              value={formData.ContactID}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              label="Account ID"
              name="AccountID"
              value={formData.AccountID}
              onChange={handleInputChange}
              fullWidth
              
            />
            <TextField
              label="Person ID"
              name="PersonID"
              value={formData.PersonID}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Title"
              name="Title"
              value={formData.Title}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Middle Name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>



          <Grid item xs={12} sm={6}>
            <TextField
              label="Surname"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Linkedin Link"
              name="linkedin_link"
              value={formData.linkedin_link}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Personal Email"
              name=" personal_email"
              value={formData. personal_email}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Personal Mobile"
              name="personal_mobile"
              value={formData.personal_mobile}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="City ID"
              name="PersonCityID"
              value={formData.PersonCityID}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="State/Province ID"
              name="PersonStateProvinceID"
              
              value={formData.PersonStateProvinceID}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Job Title ID"
              name="JobTitleID"
              
              value={formData.JobTitleID}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Primary Email"
              name="PrimaryEmail"
              type="email"
              value={formData.PrimaryEmail}
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
              label="Position"
              name="Position"
              
              value={formData.Position}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>

          
        
      </form>
    </Box>
  );
};





export default CreateContactsPage;