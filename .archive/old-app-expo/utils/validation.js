export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhoneNumber = (phone) => {
  // Basic phone number validation (can be customized based on requirements)
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  return value !== undefined && value !== null && value.trim() !== '';
};

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

export const validateNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field];

    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = 'This field is required';
    } else if (value) {
      if (fieldRules.email && !validateEmail(value)) {
        errors[field] = 'Invalid email address';
      }
      if (fieldRules.password && !validatePassword(value)) {
        errors[field] = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
      }
      if (fieldRules.phone && !validatePhoneNumber(value)) {
        errors[field] = 'Invalid phone number';
      }
      if (fieldRules.minLength && !validateMinLength(value, fieldRules.minLength)) {
        errors[field] = `Minimum length is ${fieldRules.minLength} characters`;
      }
      if (fieldRules.maxLength && !validateMaxLength(value, fieldRules.maxLength)) {
        errors[field] = `Maximum length is ${fieldRules.maxLength} characters`;
      }
      if (fieldRules.numeric && !validateNumeric(value)) {
        errors[field] = 'Must be a number';
      }
      if (fieldRules.url && !validateURL(value)) {
        errors[field] = 'Invalid URL';
      }
      if (fieldRules.date && !validateDate(value)) {
        errors[field] = 'Invalid date';
      }
      if (fieldRules.custom) {
        const customError = fieldRules.custom(value, values);
        if (customError) {
          errors[field] = customError;
        }
      }
    }
  });

  return errors;
}; 