const { createErrorResponse } = require('../utils/response.util');

class ApiKeyMiddleware {
  // Middleware to check API key in header
  verifyApiKey(req, res, next) {
    try {
      // Extract API key from header (try both formats)
      let apiKey = req.headers['x-api-key'];
      if (!apiKey) {
        // Try authorization header as fallback
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          apiKey = authHeader.substring(7); // Remove 'Bearer '
        }
      }
      
      if (!apiKey) {
        return res.status(401).json(createErrorResponse('API key required', 401));
      }

      // Get expected API key from environment
      const expectedApiKey = process.env.NODE_API_KEY;
      
      if (!expectedApiKey) {
        console.error('NODE_API_KEY not configured in environment');
        return res.status(500).json(createErrorResponse('Server configuration error', 500));
      }

      // Compare API keys
      if (apiKey !== expectedApiKey) {
        return res.status(403).json(createErrorResponse('Invalid API key', 403));
      }

      // API key is valid, proceed
      req.apiKey = apiKey;
      next();
    } catch (error) {
      console.error('Error in API key middleware:', error);
      return res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }
}

module.exports = new ApiKeyMiddleware();
