const config = require('../config/env.config');

class CorsMiddleware {
  constructor() {
    this.allowedOrigin = config.ALLOWED_ORIGIN;
  }

  getMiddleware() {
    return (req, res, next) => {
      const origin = req.headers.origin;
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return next();
      }

      // Check if origin is allowed
      if (this.allowedOrigin === '*' || origin === this.allowedOrigin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        return next();
      }

      // Block disallowed origins
      res.header('Access-Control-Allow-Origin', 'false');
      return res.status(403).json({
        success: false,
        message: 'CORS policy violation'
      });
    };
  }
}

module.exports = new CorsMiddleware();
