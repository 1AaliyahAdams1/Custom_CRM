import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Switch,
  Divider,
  Paper,
  Stack,
  FormControlLabel,
  Grid
} from '@mui/material';
import { createContact } from '../services/contactService';
import { getAllPersons, createPerson } from '../services/personService';
import { getAllAccounts } from '../services/accountService';
import SmartDropdown from '../components/SmartDropdown';
import { cityService, jobTitleService } from '../services/dropdownServices';

const CreateContactsPage = () => {
  const navigate = useNavigate();
  const [isNewPerson, setIsNewPerson] = useState(true);
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
    Still_employed: true,
    JobTitleID: "",
    PrimaryEmail: "",
    PrimaryPhone: "",
    Position: "",
    isNewPerson: true,
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

  // Wrap personService for dropdown to match expected getAll() method
  const personDropdownService = {
    getAll: async () => {
      try {
        const data = await getAllPersons();
        return data || [];
      } catch (error) {
        console.error('Error loading persons:', error);
        return [];
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePersonToggle = (event) => {
    const newIsNewPerson = event.target.checked;
    setIsNewPerson(newIsNewPerson);

    setFormData(prev => ({
      ...prev,
      isNewPerson: newIsNewPerson,
      PersonID: "",
      ...(newIsNewPerson ? {} : {
        first_name: "",
        middle_name: "",
        surname: "",
        Title: "",
        linkedin_link: "",
        personal_email: "",
        personal_mobile: "",
        PersonCityID: "",
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let personIdToUse = formData.PersonID;

      if (isNewPerson) {
        const personData = {
          Title: formData.Title,
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          surname: formData.surname,
          linkedin_link: formData.linkedin_link,
          personal_email: formData.personal_email,
          personal_mobile: formData.personal_mobile,
          CityID: formData.PersonCityID || null,
          StateProvinceID: formData.PersonStateProvinceID || null,
        };

        const createdPerson = await createPerson(personData);
        personIdToUse = createdPerson.PersonID || createdPerson.id || createdPerson;
      }

      // Convert to number or null
      personIdToUse = Number(personIdToUse);
      if (isNaN(personIdToUse)) {
        throw new Error("Invalid PersonID - must be a valid number");
      }

      const contactData = {
        AccountID: Number(formData.AccountID), // also ensure AccountID is a number
        PersonID: personIdToUse,
        Still_employed: true,
        JobTitleID: formData.JobTitleID ? Number(formData.JobTitleID) : null,
        WorkEmail: formData.PrimaryEmail || null,
        WorkPhone: formData.PrimaryPhone || null,
        Position: formData.Position,
        Active: true,
      };

      await createContact(contactData);
      navigate('/contacts');
    } catch (error) {
      console.error('Error creating contact or person:', error);
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

      {/* Person Selection Toggle */}
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Person Information
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isNewPerson}
                  onChange={handlePersonToggle}
                  color="primary"
                />
              }
              label={isNewPerson ? "Create New Person" : "Use Existing Person"}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isNewPerson
              ? "Fill in the person details below to create a new person record"
              : "Select an existing person from the dropdown"
            }
          </Typography>
        </CardContent>
      </Card>

      {/* Existing Person Selection */}
      {!isNewPerson && (
        <SmartDropdown
          label="Select Person"
          name="PersonID"
          value={formData.PersonID}
          onChange={handleInputChange}
          service={personDropdownService}
          displayField="full_name"
          valueField="PersonID"
          placeholder="Search for person..."
          required
          fullWidth
        />
      )}

      {/* New Person Fields */}
      {isNewPerson && (
        <Stack>
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

          <TextField
            label="Surname"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            fullWidth
          />

          <SmartDropdown
            label="City"
            name="PersonCityID"
            value={formData.PersonCityID}
            onChange={handleInputChange}
            service={cityService}
            displayField="CityName"
            valueField="CityID"
            placeholder="Search for city..."
            // onCreateNewClick={() => setShowCityPopup(true)}
            fullWidth
          />

          <TextField
            label="Personal Email"
            name=" personal_email"
            value={formData.personal_email}
            onChange={handleInputChange}
            fullWidth
          />

          <TextField
            label="Personal Mobile"
            name="personal_mobile"
            value={formData.personal_mobile}
            onChange={handleInputChange}
            fullWidth
          />

          <TextField
            label="Linkedin Link"
            name="linkedin_link"
            value={formData.linkedin_link}
            onChange={handleInputChange}
            fullWidth
          />
        </Stack>
      )}

      <SmartDropdown
        label="Job Title"
        name="JobTitleID"
        value={formData.JobTitleID}
        onChange={handleInputChange}
        service={jobTitleService}
        displayField="JobTitleName"
        valueField="JobTitleID"
        placeholder="Search for job title..."
        // onCreateNewClick={() => setShowJobTitlePopup(true)}
        fullWidth
      />
      <TextField
        label="Position"
        name="Position"
        value={formData.Position}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="Primary Email"
        name="PrimaryEmail"
        type="email"
        value={formData.PrimaryEmail}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="Primary Phone"
        name="PrimaryPhone"
        value={formData.PrimaryPhone}
        onChange={handleInputChange}
        fullWidth
      />
    </Box>
  );
};

export default CreateContactsPage;