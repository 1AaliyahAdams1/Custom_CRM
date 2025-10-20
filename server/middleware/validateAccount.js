// Lightweight server-side validator for Accounts create/update

function isEmpty(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

function validateEmail(value) {
  if (isEmpty(value)) return '';
  const s = String(value).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(s) ? '' : 'Please enter a valid email address';
}

function validatePhone(value) {
  if (isEmpty(value)) return '';
  const s = String(value).trim();
  const digits = s.replace(/[\s()-]/g, '');
  if (!/^\+?[0-9-\s()]+$/.test(s)) return 'Phone can contain only numbers and + - ( ) spaces';
  if (digits.length < 7) return 'Phone number is too short';
  if (digits.length > 16) return 'Phone number is too long';
  return '';
}

function validateNumeric(value, { min, max, integer = true } = {}) {
  if (isEmpty(value)) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return 'Please enter a valid number';
  if (integer && !Number.isInteger(num)) return 'Please enter a whole number';
  if (min !== undefined && num < min) return `Value must be ≥ ${min}`;
  if (max !== undefined && num > max) return `Value must be ≤ ${max}`;
  return '';
}

function buildAccountServerErrors(body) {
  const errors = [];

  if (isEmpty(body.AccountName)) {
    errors.push({ field: 'AccountName', message: 'This field is required' });
  }

  const emailErr = validateEmail(body.email);
  if (emailErr) errors.push({ field: 'email', message: emailErr });

  const phoneErr = validatePhone(body.PrimaryPhone);
  if (phoneErr) errors.push({ field: 'PrimaryPhone', message: phoneErr });

  const numericFields = [
    'number_of_employees',
    'annual_revenue',
    'number_of_venues',
    'number_of_releases',
    'number_of_events_anually',
  ];
  numericFields.forEach((f) => {
    const msg = validateNumeric(body[f], { min: 0, integer: true });
    if (msg) errors.push({ field: f, message: msg });
  });

  return errors;
}

function validateAccount(req, res, next) {
  try {
    const errors = buildAccountServerErrors(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    return next();
  } catch (e) {
    // Fallback safety
    return res.status(400).json({ success: false, message: 'Validation error', error: e.message });
  }
}

module.exports = { validateAccount };


