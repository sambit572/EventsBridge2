/**
 * Validates an Indian mobile number.
 * 
 * Rules:
 * - Must contain exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 * - Must not contain letters, special characters, or spaces
 * - Handles optional +91 prefix (strips it before validation)
 * 
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const isValidIndianPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove any whitespace and optional +91 prefix
  let cleaned = phone.trim();
  cleaned = cleaned.replace(/^\+91\s*/, '');
  // Trim again in case there was space after +91
  cleaned = cleaned.trim();
  
  // Must match exactly: starts with 6-9, followed by 9 more digits (total 10)
  return /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Cleans a phone number by removing non-digit characters and returns
 * the cleaned number along with validation result.
 * 
 * Handles:
 * - Plain 10-digit numbers (e.g., "9876543210")
 * - Numbers with +91 prefix (e.g., "+919876543210")
 * 
 * @param {string} phone - The phone number to clean and validate
 * @returns {{ cleaned: string|null, isValid: boolean, message: string }}
 */
export const validateAndCleanPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return {
      cleaned: null,
      isValid: false,
      message: "Please enter a valid Indian mobile number."
    };
  }

  // Remove any whitespace and optional +91 prefix
  let cleaned = phone.trim();
  cleaned = cleaned.replace(/^\+91/, '');

  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return {
      cleaned,
      isValid: false,
      message: "Please enter a valid Indian mobile number."
    };
  }

  return {
    cleaned,
    isValid: true,
    message: "Valid Indian mobile number."
  };
};
