// Email validation
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Check for null/undefined string values
  if (email === 'null' || email === 'undefined') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Application ID validation (basic check only)
const validateApplicationId = (applicationId) => {
  // Basic validation - just check if it's a non-empty string
  if (!applicationId || typeof applicationId !== 'string') {
    return false;
  }
  
  // Check for null/undefined string values
  if (applicationId === 'null' || applicationId === 'undefined') {
    return false;
  }
  
  return applicationId.trim().length > 0;
};

// Save field request validation
const validateSaveFieldRequest = (data) => {
  const errors = [];

  if (!data.applicationId) {
    errors.push('Application ID is required');
  } else if (!validateApplicationId(data.applicationId)) {
    errors.push('Invalid Application ID format');
  }

  if (!data.section) {
    errors.push('Section is required');
  } else if (typeof data.section !== 'string' || data.section.trim().length === 0) {
    errors.push('Section must be a non-empty string');
  }

  if (!data.fieldName) {
    errors.push('Field name is required');
  } else if (typeof data.fieldName !== 'string' || data.fieldName.trim().length === 0) {
    errors.push('Field name must be a non-empty string');
  }

  if (data.fieldValue === undefined || data.fieldValue === null) {
    errors.push('Field value is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Payment intent request validation
const validatePaymentIntentRequest = (data) => {
  const errors = [];

  if (!data.applicationId) {
    errors.push('Application ID is required');
  }

  if (!data.decisionType) {
    errors.push('Decision type is required');
  } else if (!['Regular', 'Early', 'Full'].includes(data.decisionType)) {
    errors.push('Decision type must be one of: Regular, Early, Full');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Submit application request validation
const validateSubmitApplicationRequest = (data) => {
  const errors = [];

  if (!data.applicationId) {
    errors.push('Application ID is required');
  } else if (!validateApplicationId(data.applicationId)) {
    errors.push('Invalid Application ID format');
  }

  if (!data.paymentIntentId) {
    errors.push('Payment Intent ID is required');
  } else if (typeof data.paymentIntentId !== 'string' || data.paymentIntentId.trim().length === 0) {
    errors.push('Payment Intent ID must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Applicant data validation
const validateApplicantData = (data) => {
  const errors = [];

  if (!data) {
    errors.push('Applicant data is required');
    return { isValid: false, errors };
  }

  if (!data.email) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.name) {
    errors.push('Name is required');
  } else if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name must be a non-empty string');
  }

  if (!data.applicationId) {
    errors.push('Application ID is required');
  } else if (!validateApplicationId(data.applicationId)) {
    errors.push('Application ID must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Required sections validation
const validateRequiredSections = (applicationData) => {
  const { REQUIRED_SECTIONS } = require('./constants.util');
  
  const presentSections = new Set();
  
  if (Array.isArray(applicationData)) {
    applicationData.forEach(record => {
      if (record.fields && record.fields['Section']) {
        presentSections.add(record.fields['Section']);
      }
    });
  }

  const missingSections = REQUIRED_SECTIONS.filter(section => !presentSections.has(section));

  return {
    isValid: missingSections.length === 0,
    missingSections,
    presentSections: Array.from(presentSections),
    requiredSections: REQUIRED_SECTIONS
  };
};

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove potential JavaScript URLs
    .replace(/on\w+=/gi, ''); // Remove potential event handlers
};

module.exports = {
  validateEmail,
  validateApplicationId,
  validateSaveFieldRequest,
  validatePaymentIntentRequest,
  validateSubmitApplicationRequest,
  validateApplicantData,
  validateRequiredSections,
  sanitizeInput
};
