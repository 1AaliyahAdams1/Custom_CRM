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
import { useTheme } from '@mui/material/styles';
import SmartDropdown from '../../components/SmartDropdown';
import { createContact } from '../../services/contactService';
import { getAllPersons, createPerson } from '../../services/personService';
import { getAllAccounts } from '../../services/accountService';
import { cityService, jobTitleService } from '../../services/dropdownServices';

// Field name mapping for user-friendly labels
const getFieldLabel = (fieldName) => {
  const labels = {
    'AccountID': 'Account',
    'PersonID': 'Person',
    'JobTitleID': 'Job Title',
    'WorkEmail': 'Work Email',
    'WorkPhone': 'Work Phone',
    'first_name': 'First Name',
    'surname': 'Surname',
    'middle_name': 'Middle Name',
    'Title': 'Title',
    'personal_email': 'Personal Email',
    'personal_mobile': 'Personal Mobile',
    'linkedin_link': 'LinkedIn URL',
    'CityID': 'City',
  };
  return labels[fieldName] || fieldName;
};

// Validation function
const validateField = (name, value) => {
  const label = getFieldLabel(name);
  
  switch(name) {
    case 'AccountID':
      if (!value || value === '') {
        return 'Account is required';
      }
      break;
    
    case 'PersonID':
      if (!value || value === '') {
        return 'Person is required';
      }
      break;
    
    case 'JobTitleID':
      if (!value || value === '') {
        return 'Job Title is required';
      }
      break;
    
    case 'WorkEmail':
    case 'personal_email':
      if (!value || value.trim().length === 0) {
        if (name === 'WorkEmail') {
          return 'Work Email is required';
        }
        return null; // personal_email is optional
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address e.g. example@gmail.com';
      }
      break;
    
    case 'WorkPhone':
    case 'personal_mobile':
      if (value && !/^[\d\s\-\(\)\+]+$/.test(value)) {
        return 'Invalid format e.g. 0680713091, +27 68 071 3091, (068) 071-3091';
      }
      break;
    
    case 'linkedin_link':
      if (value && value.trim() && !/^https?:\/\/.+/.test(value)) {
        return 'Invalid LinkedIn Link. Example format: http://example or https://example';
      }
      break;
  
    case 'first_name':
    case 'surname':
      if (!value || value.trim().length === 0) {
        return `${label} is required`;
      }
      if (value.trim().length > 100) {
        return `${label} must be 100 characters or less`;
      }
      break;
    
    case 'middle_name':
    case 'Title':
      if (value && value.trim().length > 100) {
        return `${label} must be 100 characters or less`;
      }
      break;
    
    default:
      break;
  }
  
  return null;
};

const CreateContactsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [isNewPerson, setIsNewPerson] = useState(true);

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

  const [contactData, setContactData] = useState({
    AccountID: '',
    PersonID: '',
    JobTitleID: '',
    WorkEmail: '',
    WorkPhone: '',
  });

  const getFieldError = (fieldName, isPersonField = false) => {
    const touchedKey = `${isPersonField ? 'person' : 'contact'}_${fieldName}`;
    
    return touched[touchedKey] && fieldErrors[touchedKey] ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#ff4444', marginRight: '4px' }}>✗</span>
        {fieldErrors[touchedKey]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName, isPersonField = false) => {
    const touchedKey = `${isPersonField ? 'person' : 'contact'}_${fieldName}`;
    return touched[touchedKey] && fieldErrors[touchedKey];
  };

 const accountService = {
  getAll: async () => {
    try {
      const res = await getAllAccounts();
      console.log('Account service response:', res); // Debug log
      
      // Handle different response structures
      if (Array.isArray(res)) {
        return res;
      } else if (res.data && Array.isArray(res.data)) {
        return res.data;
      } else {
        console.error('Unexpected account data structure:', res);
        return [];
      }
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

  const handlePersonToggle = (event) => {
    const checked = event.target.checked;
    setIsNewPerson(checked);

    setFieldErrors({});
    setTouched({});
    setError(null);

    if (checked) {
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
      setContactData((prev) => ({ ...prev, PersonID: '' }));
    } else {
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

  const handlePersonChange = (e) => {
    const { name, value } = e.target;
    setPersonData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const touchedKey = `person_${name}`;
    setTouched(prev => ({
      ...prev,
      [touchedKey]: true
    }));

    const errorMessage = validateField(name, value);
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[touchedKey] = errorMessage;
      } else {
        delete newErrors[touchedKey];
      }
      return newErrors;
    });

    if (error) setError(null);
  };

  const handlePersonBlur = (e) => {
    const { name, value } = e.target;
    const touchedKey = `person_${name}`;
    
    setTouched(prev => ({
      ...prev,
      [touchedKey]: true
    }));

    const errorMessage = validateField(name, value);
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[touchedKey] = errorMessage;
      } else {
        delete newErrors[touchedKey];
      }
      return newErrors;
    });
  };

  const handleContactChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    const touchedKey = `contact_${name}`;
    setTouched(prev => ({
      ...prev,
      [touchedKey]: true
    }));

    const errorMessage = validateField(name, value);
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[touchedKey] = errorMessage;
      } else {
        delete newErrors[touchedKey];
      }
      return newErrors;
    });

    if (error) setError(null);
  };

  const handleContactBlur = (e) => {
    const { name, value } = e.target;
    const touchedKey = `contact_${name}`;
    
    setTouched(prev => ({
      ...prev,
      [touchedKey]: true
    }));

    const errorMessage = validateField(name, value);
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[touchedKey] = errorMessage;
      } else {
        delete newErrors[touchedKey];
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submit
    const allErrors = {};
    
    // Validate contact fields
    Object.keys(contactData).forEach(key => {
      const errorMessage = validateField(key, contactData[key]);
      if (errorMessage) {
        allErrors[`contact_${key}`] = errorMessage;
      }
    });

    // Validate person fields if creating new person
    if (isNewPerson) {
      Object.keys(personData).forEach(key => {
        const errorMessage = validateField(key, personData[key]);
        if (errorMessage) {
          allErrors[`person_${key}`] = errorMessage;
        }
      });
    }

    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      
      // Mark all fields as touched
      const allTouched = {};
      Object.keys(contactData).forEach(key => {
        allTouched[`contact_${key}`] = true;
      });
      if (isNewPerson) {
        Object.keys(personData).forEach(key => {
          allTouched[`person_${key}`] = true;
        });
      }
      setTouched(allTouched);
      
      setError('Please fix validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let personIdToUse = contactData.PersonID;

      if (isNewPerson) {
        const createdPerson = await createPerson(personData);
        personIdToUse = createdPerson.PersonID || createdPerson.id || createdPerson;
      }

      if (!personIdToUse) {
        setError('Please select or create a person.');
        setIsSubmitting(false);
        return;
      }

      const cleanedContactData = {
        AccountID: contactData.AccountID === "" ? null : Number(contactData.AccountID),
        PersonID: Number(personIdToUse),
        JobTitleID: contactData.JobTitleID === "" ? null : Number(contactData.JobTitleID),
        WorkEmail: contactData.WorkEmail === "" ? null : contactData.WorkEmail,
        WorkPhone: contactData.WorkPhone === "" ? null : contactData.WorkPhone,
      };

      await createContact(cleanedContactData);
      
      setSuccessMessage("Contact created successfully!");
      
      setTimeout(() => {
        navigate('/contacts');
      }, 1500);

    } catch (error) {
      console.error('Error creating contact/person:', error);
      setError(error.message || 'Failed to create contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/contacts');
  };

  return (
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh', 
      p: 3 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 600 
            }}>
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
                  error={isFieldInvalid('AccountID', false)}
                  helperText={getFieldError('AccountID', false)}
                />
              </Box>

              {/* Person Selection Toggle Card */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Card variant="outlined" sx={{ 
                  border: `1px solid ${theme.palette.divider}`
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={600} color={theme.palette.text.primary}>
                        Person Information
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={isNewPerson} 
                            onChange={handlePersonToggle} 
                            disabled={isSubmitting}
                          />
                        }
                        label={isNewPerson ? 'Create New Person' : 'Use Existing Person'}
                      />
                    </Box>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 1 }}>
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
                    error={isFieldInvalid('PersonID', false)}
                    helperText={getFieldError('PersonID', false)}
                  />
                </Box>
              )}

              {/* New Person Fields */}
              {isNewPerson && (
                <>
                  <Box>
                    <TextField
                      fullWidth
                      label="Title (Optional)"
                      name="Title"
                      value={personData.Title}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      disabled={isSubmitting}
                      error={isFieldInvalid('Title', true)}
                      helperText={getFieldError('Title', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={personData.first_name}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      required
                      disabled={isSubmitting}
                      error={isFieldInvalid('first_name', true)}
                      helperText={getFieldError('first_name', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Middle Name (Optional)"
                      name="middle_name"
                      value={personData.middle_name}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      disabled={isSubmitting}
                      error={isFieldInvalid('middle_name', true)}
                      helperText={getFieldError('middle_name', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Surname"
                      name="surname"
                      value={personData.surname}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      required
                      disabled={isSubmitting}
                      error={isFieldInvalid('surname', true)}
                      helperText={getFieldError('surname', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <SmartDropdown
                      label="City (Optional)"
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
                      label="Personal Email (Optional)"
                      name="personal_email"
                      value={personData.personal_email}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      type="email"
                      disabled={isSubmitting}
                      error={isFieldInvalid('personal_email', true)}
                      helperText={getFieldError('personal_email', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Personal Mobile (Optional)"
                      name="personal_mobile"
                      value={personData.personal_mobile}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      disabled={isSubmitting}
                      error={isFieldInvalid('personal_mobile', true)}
                      helperText={getFieldError('personal_mobile', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="LinkedIn Link (Optional)"
                      name="linkedin_link"
                      value={personData.linkedin_link}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      disabled={isSubmitting}
                      error={isFieldInvalid('linkedin_link', true)}
                      helperText={getFieldError('linkedin_link', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                </>
              )}

              {/* Job Title Dropdown - Required */}
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
                  required
                  disabled={isSubmitting}
                  error={isFieldInvalid('JobTitleID', false)}
                  helperText={getFieldError('JobTitleID', false)}
                />
              </Box>

              {/* Work Email - Required */}
              <Box>
                <TextField
                  fullWidth
                  label="Work Email"
                  name="WorkEmail"
                  value={contactData.WorkEmail}
                  onChange={handleContactChange}
                  onBlur={handleContactBlur}
                  type="email"
                  required
                  disabled={isSubmitting}
                  error={isFieldInvalid('WorkEmail', false)}
                  helperText={getFieldError('WorkEmail', false)}
                  FormHelperTextProps={{
                    component: 'div'
                  }}
                />
              </Box>

              {/* Work Phone - Optional */}
              <Box>
                <TextField
                  fullWidth
                  label="Work Phone (Optional)"
                  name="WorkPhone"
                  value={contactData.WorkPhone}
                  onChange={handleContactChange}
                  onBlur={handleContactBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('WorkPhone', false)}
                  helperText={getFieldError('WorkPhone', false)}
                  FormHelperTextProps={{
                    component: 'div'
                  }}
                />
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateContactsPage;