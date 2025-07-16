//Formating Phone Numbers Utility with no symbols

function cleanPhoneNumber(input, maxLength = 10) {
  if (!input) return "";
  // Remove all non-digit characters
  const digitsOnly = input.replace(/\D/g, "");
  // Limit length
  return digitsOnly.slice(0, maxLength);
}

module.exports = { cleanPhoneNumber };
