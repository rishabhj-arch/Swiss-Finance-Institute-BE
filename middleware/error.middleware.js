const { createErrorResponse } = require('../utils/response.util');

class ErrorMiddleware {
  getMiddleware() {
    return (error, req, res, next) => {
      console.error('Unhandled error:', error);
      
      if (error.message && error.message.includes('not found')) {
        return res.status(404).json(createErrorResponse('Resource not found'));
      }
      
      if (error.message && error.message.includes('Unauthorized')) {
        return res.status(401).json(createErrorResponse('Unauthorized'));
      }
      
      if (error.message && error.message.includes('Forbidden')) {
        return res.status(403).json(createErrorResponse('Forbidden'));
      }
      
      // Default error
      return res.status(500).json(createErrorResponse('Internal server error', 500));
    };
  }
}

module.exports = new ErrorMiddleware();
