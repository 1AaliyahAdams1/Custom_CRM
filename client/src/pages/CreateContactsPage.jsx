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
  FormControlLabel,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SmartDropdown from '../components/SmartDropdown';
import { createContact } from '../services/contactService';
import { getAllPersons, createPerson } from '../services/personService';
import { getAllAccounts } from '../services/accountService';
import { cityService, jobTitleService } from '../services/dropdownServices';

// Monochrome theme for MUI components
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#050505',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#666666',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#050505',
      secondary: '#666666',
    },
    divider: '#e5e5e5',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#e5e5e5' },
            '&:hover fieldset': { borderColor: '#cccccc' },
            '&.Mui-focused fieldset': { borderColor: '#050505' },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: '#e5e5e5',
          color: '#050505',
          '&:hover': {
            borderColor: '#cccccc',
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
  },
});

const CreateContactsPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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

    if (!contactData.AccountID) {
      setError('Account is required');
      return;
    }

    if (isNewPerson && !personData.first_name.trim()) {
      setError('First name is required for new person');
      return;
    }

    if (!isNewPerson && !contactData.PersonID) {
      setError('Please select a person');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let personIdToUse = contactData.PersonID;

      console.log('personIdToUse:', personIdToUse, 'typeof:', typeof personIdToUse);

      if (isNewPerson) {
        console.log('Creating person:', personData);
        const createdPerson = await createPerson(personData);
        personIdToUse = createdPerson.PersonID || createdPerson.id || createdPerson;
        console.log('personIdToUse:', personIdToUse, 'typeof:', typeof personIdToUse);
      }

      if (!personIdToUse) {
        setError('Please select or create a person.');
        return;
      }

      
      const cleanedContactData = {
        AccountID: contactData.AccountID === "" ? null : Number(contactData.AccountID),
        PersonID: Number(personIdToUse),
        JobTitleID: contactData.JobTitleID === "" ? null : Number(contactData.JobTitleID),
        Still_employed: contactData.Still_employed ?? true,
        WorkEmail: contactData.WorkEmail === "" ? null : contactData.WorkEmail,
        WorkPhone: contactData.WorkPhone === "" ? null : contactData.WorkPhone,
      };

      console.log('Creating Contact:', cleanedContactData);
      await createContact(cleanedContactData);

      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Contact created successfully!");
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/contacts');
      }, 1500);

    } catch (error) {
      console.error('Error creating contact/person:', error);
      setError('Failed to create contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/contacts');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
                Create New Contact
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ minWidth: 'auto' }}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  backgroundColor: '#050505',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Contact'}
              </Button>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {/* Form */}
          <Paper elevation={0} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                {/* Account Dropdown - Required */}
                <Box sx={{ gridColumn: '1 / -1' }}>
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
                    disabled={isSubmitting}
                  />
                </Box>

                {/* Person Selection Toggle Card */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Card variant="outlined" sx={{ border: '1px solid #e5e5e5' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600} color="#050505">
                          Person Information
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={isNewPerson} 
                              onChange={handlePersonToggle} 
                              disabled={isSubmitting}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#050505',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#050505',
                                },
                              }}
                            />
                          }
                          label={isNewPerson ? 'Create New Person' : 'Use Existing Person'}
                        />
                      </Box>
                      <Typography variant="body2" color="#666666" sx={{ mt: 1 }}>
                        {isNewPerson
                          ? 'Fill in the person details below to create a new person record'
                          : 'Select an existing person from the dropdown'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                {/* Existing Person Dropdown */}
                {!isNewPerson && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <SmartDropdown
                      label="Select Person"
                      name="PersonID"
                      value={contactData.PersonID}
                      onChange={handleContactChange}
                      service={personDropdownService}
                      displayField="PersonID"
                      valueField="PersonID"
                      placeholder="Search for person..."
                      required
                      disabled={isSubmitting}
                      customDisplayFormatter={(item) =>
                        `${item.first_name || ''} ${item.surname || ''}`.trim()
                      }
                    />
                  </Box>
                )}

                {/* New Person Fields */}
                {isNewPerson && (
                  <>
                    <Box>
                      <TextField
                        fullWidth
                        label="Title"
                        name="Title"
                        value={personData.Title}
                        onChange={handlePersonChange}
                        disabled={isSubmitting}
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={personData.first_name}
                        onChange={handlePersonChange}
                        required
                        disabled={isSubmitting}
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Middle Name"
                        name="middle_name"
                        value={personData.middle_name}
                        onChange={handlePersonChange}
                        disabled={isSubmitting}
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Surname"
                        name="surname"
                        value={personData.surname}
                        onChange={handlePersonChange}
                        required
                        disabled={isSubmitting}
                      />
                    </Box>
                    <Box>
                      <SmartDropdown
                        label="City"
                        name="CityID"
                        value={personData.CityID}
                        onChange={handlePersonChange}
                        service={cityService}
                        displayField="CityName"
                        valueField="CityID"
                        placeholder="Search for city..."
                        disabled={isSubmitting}
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Personal Email"
                        name="personal_email"
                        value={personData.personal_email}
                        onChange={handlePersonChange}
                        type="email"
                        disabled={isSubmitting}
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Personal Mobile"
                        name="personal_mobile"
                        value={personData.personal_mobile}
                        onChange={handlePersonChange}
                        disabled={isSubmitting}
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="LinkedIn Link"
                        name="linkedin_link"
                        value={personData.linkedin_link}
                        onChange={handlePersonChange}
                        disabled={isSubmitting}
                      />
                    </Box>
                  </>
                )}

                {/* Job Title Dropdown */}
                <Box>
                  <SmartDropdown
                    label="Job Title"
                    name="JobTitleID"
                    value={contactData.JobTitleID}
                    onChange={handleContactChange}
                    service={jobTitleService}
                    displayField="JobTitleName"
                    valueField="JobTitleID"
                    placeholder="Search for job title..."
                    disabled={isSubmitting}
                  />
                </Box>

                {/* Work Email */}
                <Box>
                  <TextField
                    fullWidth
                    label="Work Email"
                    name="WorkEmail"
                    value={contactData.WorkEmail}
                    onChange={handleContactChange}
                    type="email"
                    disabled={isSubmitting}
                  />
                </Box>

                {/* Work Phone */}
                <Box>
                  <TextField
                    fullWidth
                    label="Work Phone"
                    name="WorkPhone"
                    value={contactData.WorkPhone}
                    onChange={handleContactChange}
                    disabled={isSubmitting}
                  />
                </Box>
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
export default CreateContactsPage;
