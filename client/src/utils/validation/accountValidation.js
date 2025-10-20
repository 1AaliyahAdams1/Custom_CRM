// Reusable validation helpers for Accounts forms

export const trimString = (value) => (typeof value === 'string' ? value.trim() : value);

export const validateRequired = (value) => {
  if (value === null || value === undefined) return 'This field is required';
  const s = typeof value === 'string' ? value.trim() : value;
  if (s === '') return 'This field is required';
  return '';
};

export const validateLength = (value, { min, max, label }) => {
  const s = (value || '').toString();
  if (min && s.trim().length < min) return `${label || 'Value'} must be at least ${min} characters`;
  if (max && s.trim().length > max) return `${label || 'Value'} must be at most ${max} characters`;
  return '';
};

export const validateEmail = (value) => {
  const s = trimString(value || '');
  if (!s) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(s)) return 'Please enter a valid email address';
  const commonTypos = ['gmial.com', 'yahooo.com', 'hotnail.com'];
  if (commonTypos.some(t => s.toLowerCase().includes(t))) return 'Please check the email domain spelling';
  return '';
};

export const validatePhone = (value) => {
  const s = trimString(value || '');
  if (!s) return '';
  const digits = s.replace(/[\s()-]/g, '');
  if (!/^\+?[0-9-\s()]+$/.test(s)) return 'Phone can contain only numbers and + - ( ) spaces';
  if (digits.length < 7) return 'Phone number is too short';
  if (digits.length > 16) return 'Phone number is too long';
  return '';
};

export const validateNumeric = (value, { min, max, integer = true }) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return 'Please enter a valid number';
  if (integer && !Number.isInteger(num)) return 'Please enter a whole number';
  if (min !== undefined && num < min) return `Value must be ≥ ${min}`;
  if (max !== undefined && num > max) return `Value must be ≤ ${max}`;
  return '';
};

export const buildAccountFieldErrors = (formData) => {
  const errors = {};

  const req = (field) => {
    const msg = validateRequired(formData[field]);
    if (msg) errors[field] = msg;
  };

  req('AccountName');

  const emailErr = validateEmail(formData.email);
  if (emailErr) errors.email = emailErr;

  const phoneErr = validatePhone(formData.PrimaryPhone);
  if (phoneErr) errors.PrimaryPhone = phoneErr;

  const website = trimString(formData.Website || '');
  if (website) {
    try {
      // Basic URL validation
      // eslint-disable-next-line no-new
      new URL(website.startsWith('http') ? website : `https://${website}`);
    } catch {
      errors.Website = 'Please enter a valid website URL';
    }
  }

  const numericFields = [
    ['number_of_employees', { min: 0 }],
    ['annual_revenue', { min: 0 }],
    ['number_of_venues', { min: 0 }],
    ['number_of_releases', { min: 0 }],
    ['number_of_events_anually', { min: 0 }],
  ];
  numericFields.forEach(([field, rule]) => {
    const msg = validateNumeric(formData[field], { ...rule, integer: true });
    if (msg) errors[field] = msg;
  });

  return errors;
};

export const isFormValid = (errors) => Object.keys(errors).length === 0;


