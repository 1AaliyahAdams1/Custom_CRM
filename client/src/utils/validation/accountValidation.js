// src/utils/validation/accountValidation.js

/**
 * Validates account data based on database schema and business rules
 */

// Phone number validation - accepts various formats
const validatePhoneNumber = (phone) => {
  if (!phone || !phone.trim()) return null;
  
  // Remove all spaces, dashes, parentheses, and dots for validation
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Must start with + or a digit
  // Must have at least 8 digits total (excluding country code symbol)
  // Max length around 20 characters
  const phoneRegex = /^[\+]?[\d]{8,20}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return 'Phone number must contain at least 8 digits. Formats accepted: 0680713091, +27 68 071 3091, (068) 071-3091, etc.';
  }
  
  return null;
};

// Email validation
const validateEmail = (email) => {
  if (!email || !email.trim()) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

// Website validation
const validateWebsite = (website) => {
  if (!website || !website.trim()) return null;
  
  // More flexible URL validation - just check for basic structure
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  
  if (!urlRegex.test(website.trim())) {
    return 'Please enter a valid website URL (e.g., www.example.com or https://example.com)';
  }
  
  return null;
};

// Validate string length
const validateStringLength = (value, fieldName, maxLength, minLength = 0) => {
  if (!value || !value.trim()) return null;
  
  const trimmed = value.trim();
  
  if (minLength > 0 && trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  
  if (trimmed.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  
  return null;
};

// Validate positive integer
const validatePositiveInteger = (value, fieldName, maxValue = null) => {
  if (!value && value !== 0) return null;
  
  const num = parseInt(value);
  
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (num < 0) {
    return `${fieldName} cannot be negative`;
  }
  
  if (maxValue && num > maxValue) {
    return `${fieldName} must not exceed ${maxValue.toLocaleString()}`;
  }
  
  return null;
};

// Validate decimal number
const validateDecimal = (value, fieldName, precision = 18, scale = 0, maxValue = null) => {
  if (!value && value !== 0) return null;
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (num < 0) {
    return `${fieldName} cannot be negative`;
  }
  
  // Check decimal places
  const decimalPart = value.toString().split('.')[1];
  if (decimalPart && decimalPart.length > scale) {
    return `${fieldName} can have at most ${scale} decimal places`;
  }
  
  if (maxValue && num > maxValue) {
    return `${fieldName} must not exceed ${maxValue.toLocaleString()}`;
  }
  
  return null;
};

/**
 * Main validation function for account data
 * Returns object with field errors or null if valid
 */
export const validateAccountData = (formData, isUpdate = false) => {
  const errors = {};
  
  // Required fields (based on stored procedure - all can be NULL except what's explicitly required)
  // Looking at your SP, only @AccountName appears to be truly required for business logic
  
  // Account Name - Required, nvarchar(255)
  if (!formData.AccountName || !formData.AccountName.trim()) {
    errors.AccountName = 'Account name is required';
  } else {
    const nameError = validateStringLength(formData.AccountName, 'Account name', 255, 2);
    if (nameError) errors.AccountName = nameError;
  }
  
  // Location fields - All optional (int)
  // No validation needed as they're dropdown selections
  
  // Street addresses - Optional, nvarchar(255)
  const address1Error = validateStringLength(formData.street_address1, 'Street address 1', 255);
  if (address1Error) errors.street_address1 = address1Error;
  
  const address2Error = validateStringLength(formData.street_address2, 'Street address 2', 255);
  if (address2Error) errors.street_address2 = address2Error;
  
  const address3Error = validateStringLength(formData.street_address3, 'Street address 3', 255);
  if (address3Error) errors.street_address3 = address3Error;
  
  // Postal code - Optional, nvarchar(31)
  const postalError = validateStringLength(formData.postal_code, 'Postal code', 31);
  if (postalError) errors.postal_code = postalError;
  
  // Primary Phone - Optional, nvarchar(63)
  if (formData.PrimaryPhone && formData.PrimaryPhone.trim()) {
    const phoneError = validatePhoneNumber(formData.PrimaryPhone);
    if (phoneError) errors.PrimaryPhone = phoneError;
    
    // Also check length
    if (formData.PrimaryPhone.length > 63) {
      errors.PrimaryPhone = 'Phone number must not exceed 63 characters';
    }
  }
  
  // Fax - Optional, nvarchar(63)
  if (formData.fax && formData.fax.trim()) {
    const faxError = validatePhoneNumber(formData.fax);
    if (faxError) errors.fax = faxError.replace('Phone number', 'Fax number');
    
    if (formData.fax.length > 63) {
      errors.fax = 'Fax number must not exceed 63 characters';
    }
  }
  
  // Email - Optional, varchar(255)
  if (formData.email && formData.email.trim()) {
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    if (formData.email.length > 255) {
      errors.email = 'Email must not exceed 255 characters';
    }
  }
  
  // Website - Optional, nvarchar(255)
  if (formData.Website && formData.Website.trim()) {
    const websiteError = validateWebsite(formData.Website);
    if (websiteError) errors.Website = websiteError;
    
    if (formData.Website.length > 255) {
      errors.Website = 'Website must not exceed 255 characters';
    }
  }
  
  // Number fields - All optional
  // number_of_employees - int
  const employeesError = validatePositiveInteger(formData.number_of_employees, 'Number of employees', 2147483647);
  if (employeesError) errors.number_of_employees = employeesError;
  
  // annual_revenue - decimal(18,0)
  const revenueError = validateDecimal(formData.annual_revenue, 'Annual revenue', 18, 0, 999999999999999999);
  if (revenueError) errors.annual_revenue = revenueError;
  
  // number_of_venues - smallint (max 32767)
  const venuesError = validatePositiveInteger(formData.number_of_venues, 'Number of venues', 32767);
  if (venuesError) errors.number_of_venues = venuesError;
  
  // number_of_releases - smallint
  const releasesError = validatePositiveInteger(formData.number_of_releases, 'Number of releases', 32767);
  if (releasesError) errors.number_of_releases = releasesError;
  
  // number_of_events_anually - smallint
  const eventsError = validatePositiveInteger(formData.number_of_events_anually, 'Number of events annually', 32767);
  if (eventsError) errors.number_of_events_anually = eventsError;
  
  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validate individual field - used for real-time validation
 */
export const validateField = (fieldName, value, allFormData = {}) => {
  const tempData = { ...allFormData, [fieldName]: value };
  const allErrors = validateAccountData(tempData);
  return allErrors?.[fieldName] || null;
};