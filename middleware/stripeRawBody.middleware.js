const getRawBody = require('raw-body');

class StripeRawBodyMiddleware {
  getMiddleware() {
    return async (req, res, next) => {
      // Only apply to webhook endpoint
      if (req.path === '/api/webhook' && req.method === 'POST') {
        try {
          req.rawBody = await getRawBody(req, {
            length: req.headers['content-length'],
            limit: '1mb'
          });
          next();
        } catch (error) {
          console.error('Error reading raw body for webhook:', error);
          return res.status(400).json({
            success: false,
            message: 'Invalid request body'
          });
        }
      } else {
        next();
      }
    };
  }
}

module.exports = new StripeRawBodyMiddleware();
