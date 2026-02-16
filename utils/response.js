// Standard success response
const createSuccessResponse = (data = null, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

// Standard error response
const createErrorResponse = (errors, statusCode = 400) => {
  const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
  
  return {
    success: false,
    message: errorMessage,
    statusCode
  };
};

module.exports = {
  createSuccessResponse,
  createErrorResponse
};
