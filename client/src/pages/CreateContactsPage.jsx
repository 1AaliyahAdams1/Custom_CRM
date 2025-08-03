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
  Stack,
  FormControlLabel,
} from '@mui/material';
import SmartDropdown from '../components/SmartDropdown';
import { createContact } from '../services/contactService';
import { getAllPersons, createPerson } from '../services/personService';
import { getAllAccounts } from '../services/accountService';
import { cityService, jobTitleService } from '../services/dropdownServices';

const CreateContactsPage = () => {
  const navigate = useNavigate();

  const [isNewPerson, setIsNewPerson] = useState(true);

  // Separate state for person form data
  const [personData, setPersonData] = useState({
    Title: '',
    first_name: '',
    middle_name: '',
    surname: '',
    linkedin_link: '',
    personal_email: '',
    personal_mobile: '',
    CityID: '',
  });

  // Separate state for contact form data
  const [contactData, setContactData] = useState({
    AccountID: '',
    PersonID: '',
    JobTitleID: '',
    Still_employed: true,
    WorkEmail: '',
    WorkPhone: '',
  });

  // Services wrapped for dropdowns
  const accountService = {
    getAll: async () => {
      try {
        const res = await getAllAccounts();
        return res.data || [];
      } catch (error) {
        console.error('Error loading accounts:', error);
        return [];
      }
    },
  };

  const personDropdownService = {
    getAll: async () => {
      try {
        const data = await getAllPersons();
        return data || [];
      } catch (error) {
        console.error('Error loading persons:', error);
        return [];
      }
    },
  };

  // Handle toggle between new/existing person
  const handlePersonToggle = (event) => {
    const checked = event.target.checked;
    setIsNewPerson(checked);

    if (checked) {
      // Clear personData when switching to new person
      setPersonData({
        Title: '',
        first_name: '',
        middle_name: '',
        surname: '',
        linkedin_link: '',
        personal_email: '',
        personal_mobile: '',
        CityID: '',
      });
      // Clear selected PersonID in contactData
      setContactData((prev) => ({ ...prev, PersonID: '' }));
    } else {
      // Clear new person fields
      setPersonData({
        Title: '',
        first_name: '',
        middle_name: '',
        surname: '',
        linkedin_link: '',
        personal_email: '',
        personal_mobile: '',
        CityID: '',
      });
    }
  };

  // Input handlers for personData
  const handlePersonChange = (e) => {
    const { name, value } = e.target;
    setPersonData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Input handlers for contactData
  const handleContactChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let personIdToUse = contactData.PersonID;

      console.log('personIdToUse:', personIdToUse, 'typeof:', typeof personIdToUse);
      
      if (isNewPerson) {
        // Create person first
        console.log('Creating person:', personData);
        const createdPerson = await createPerson(personData);
        personIdToUse = createdPerson.PersonID || createdPerson.id || createdPerson;
      }

      if (!personIdToUse) {
        alert('Please select or create a person.');
        return;
      }
      


      const contactPayload = {
        AccountID: Number(contactData.AccountID),
        PersonID: Number(personIdToUse),
        JobTitleID: contactData.JobTitleID ? Number(contactData.JobTitleID) : null,
        Still_employed: contactData.Still_employed ?? true,
        WorkEmail: contactData.WorkEmail || null,
        WorkPhone: contactData.WorkPhone || null,
      };

      console.log('Creating Contact:', contactPayload);
      await createContact(contactPayload, 1);

      // Reset states after success
      setPersonData({
        Title: '',
        first_name: '',
        middle_name: '',
        surname: '',
        linkedin_link: '',
        personal_email: '',
        personal_mobile: '',
        CityID: '',
      });
      setContactData({
        AccountID: '',
        PersonID: '',
        JobTitleID: '',
        Still_employed: true,
        WorkEmail: '',
        WorkPhone: '',
      });
      setIsNewPerson(true);

      navigate('/contacts');
    } catch (error) {
      console.error('Error creating contact/person:', error);
      alert('Failed to create contact. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/contacts');
  };

  return (
    <Box p={4} maxWidth={900} mx="auto">
      <Typography variant="h4" gutterBottom>
        Create New Contact
      </Typography>

      {/* Buttons */}
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

      {/* Account Dropdown */}
      <SmartDropdown
        label="Account"
        name="AccountID"
        value={contactData.AccountID}
        onChange={handleContactChange}
        service={accountService}
        displayField="AccountName"
        valueField="AccountID"
        placeholder="Search for account..."
        required
        fullWidth
      />

      {/* Person Selection Toggle */}
      <Card variant="outlined" sx={{ my: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Person Information
            </Typography>
            <FormControlLabel
              control={
                <Switch checked={isNewPerson} onChange={handlePersonToggle} color="primary" />
              }
              label={isNewPerson ? 'Create New Person' : 'Use Existing Person'}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isNewPerson
              ? 'Fill in the person details below to create a new person record'
              : 'Select an existing person from the dropdown'}
          </Typography>
        </CardContent>
      </Card>

      {/* Existing Person Dropdown */}
      {!isNewPerson && (
        <SmartDropdown
          label="Select Person"
          name="PersonID"
          value={contactData.PersonID}
          onChange={handleContactChange}
          service={personDropdownService}
          displayField="PersonID" // or whatever field exists, you can customize display
          valueField="PersonID"
          placeholder="Search for person..."
          required
          fullWidth
          customDisplayFormatter={(item) =>
            `${item.first_name || ''} ${item.surname || ''}`.trim()
          }
        />
      )}

      {/* New Person Fields */}
      {isNewPerson && (
        <Stack spacing={2} my={2}>
          <TextField
            label="Title"
            name="Title"
            value={personData.Title}
            onChange={handlePersonChange}
            fullWidth
          />
          <TextField
            label="First Name"
            name="first_name"
            value={personData.first_name}
            onChange={handlePersonChange}
            fullWidth
            required
          />
          <TextField
            label="Middle Name"
            name="middle_name"
            value={personData.middle_name}
            onChange={handlePersonChange}
            fullWidth
          />
          <TextField
            label="Surname"
            name="surname"
            value={personData.surname}
            onChange={handlePersonChange}
            fullWidth
            required
          />
          <SmartDropdown
            label="City"
            name="CityID"
            value={personData.CityID}
            onChange={handlePersonChange}
            service={cityService}
            displayField="CityName"
            valueField="CityID"
            placeholder="Search for city..."
            fullWidth
          />
          <TextField
            label="Personal Email"
            name="personal_email"
            value={personData.personal_email}
            onChange={handlePersonChange}
            fullWidth
            type="email"
          />
          <TextField
            label="Personal Mobile"
            name="personal_mobile"
            value={personData.personal_mobile}
            onChange={handlePersonChange}
            fullWidth
          />
          <TextField
            label="LinkedIn Link"
            name="linkedin_link"
            value={personData.linkedin_link}
            onChange={handlePersonChange}
            fullWidth
          />
        </Stack>
      )}

      {/* Job Title Dropdown */}
      <SmartDropdown
        label="Job Title"
        name="JobTitleID"
        value={contactData.JobTitleID}
        onChange={handleContactChange}
        service={jobTitleService}
        displayField="JobTitleName"
        valueField="JobTitleID"
        placeholder="Search for job title..."
        fullWidth
      />

      {/* Work Email & Phone */}
      <TextField
        label="Work Email"
        name="WorkEmail"
        value={contactData.WorkEmail}
        onChange={handleContactChange}
        fullWidth
        type="email"
        sx={{ mt: 2 }}
      />
      <TextField
        label="Work Phone"
        name="WorkPhone"
        value={contactData.WorkPhone}
        onChange={handleContactChange}
        fullWidth
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default CreateContactsPage;
