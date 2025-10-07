// middleware/accountValidation.js

/**
 * Backend validation for account data
 * Ensures data integrity before hitting the database
 */

// Phone number validation
const validatePhoneNumber = (phone) => {
  if (!phone || !phone.trim()) return null;

  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  const phoneRegex = /^[\+]?[\d]{8,20}$/;

  if (!phoneRegex.test(cleaned)) {
    return 'Phone number must contain at least 8 digits';
  }

  if (phone.length > 63) {
    return 'Phone number must not exceed 63 characters';
  }

  return null;
};

// Email validation
const validateEmail = (email) => {
  if (!email || !email.trim()) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Invalid email format';
  }

  if (email.length > 255) {
    return 'Email must not exceed 255 characters';
  }

  return null;
};

// Website validation
const validateWebsite = (website) => {
  if (!website || !website.trim()) return null;

  // Simple URL validation
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
  if (!urlRegex.test(website.trim())) {
    return 'Please enter a valid website URL (e.g., www.example.com or https://example.com)';
  }

  if (website.length > 255) {
    return 'Website must not exceed 255 characters';
  }

  return null;
};

// String length validation
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

// Positive integer validation
const validatePositiveInteger = (value, fieldName, maxValue = null) => {
  if (value == null || value === '') return null;

  const num = parseInt(value, 10);
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

// Decimal validation
const validateDecimal = (value, fieldName, precision = 18, scale = 0, maxValue = null) => {
  if (value == null || value === '') return null;

  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }

  if (num < 0) {
    return `${fieldName} cannot be negative`;
  }

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
 * Validate entire account object
 * Returns errors object or null if valid
 */
const validateAccountData = (data) => {
  const errors = {};

  // Account Name
  if (!data.AccountName || !data.AccountName.trim()) {
    errors.AccountName = 'Account name is required';
  } else {
    const nameError = validateStringLength(data.AccountName, 'Account name', 255, 2);
    if (nameError) errors.AccountName = nameError;
  }

  // Addresses
  ['street_address1', 'street_address2', 'street_address3'].forEach((field) => {
    const err = validateStringLength(data[field], field.replace('_', ' '), 255);
    if (err) errors[field] = err;
  });

  // Postal Code
  const postalError = validateStringLength(data.postal_code, 'Postal code', 31);
  if (postalError) errors.postal_code = postalError;

  // Phones
  ['PrimaryPhone', 'fax'].forEach((field) => {
    if (data[field]) {
      const err = validatePhoneNumber(data[field]);
      if (err) errors[field] = err;
    }
  });

  // Email
  if (data.email) {
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
  }

  // Website
  if (data.Website) {
    const websiteError = validateWebsite(data.Website);
    if (websiteError) errors.Website = websiteError;
  }

  // Numbers
  const numberFields = [
    { field: 'number_of_employees', max: 2147483647 },
    { field: 'number_of_venues', max: 32767 },
    { field: 'number_of_releases', max: 32767 },
    { field: 'number_of_events_anually', max: 32767 },
  ];

  numberFields.forEach(({ field, max }) => {
    const err = validatePositiveInteger(data[field], field.replace(/_/g, ' '), max);
    if (err) errors[field] = err;
  });

  // Annual revenue
  const revenueError = validateDecimal(data.annual_revenue, 'Annual revenue', 18, 0, 999999999999999999);
  if (revenueError) errors.annual_revenue = revenueError;

  return Object.keys(errors).length ? errors : null;
};

module.exports = {
  validatePhoneNumber,
  validateEmail,
  validateWebsite,
  validateStringLength,
  validatePositiveInteger,
  validateDecimal,
  validateAccountData,
};
