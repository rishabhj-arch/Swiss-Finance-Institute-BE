require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// Import configurations
const config = require('./config/env.config');

// Import middleware
const corsMiddleware = require('./middleware/cors.middleware');
const stripeRawBodyMiddleware = require('./middleware/stripeRawBody.middleware');
const errorMiddleware = require('./middleware/error.middleware');

// Import response utilities
const { createSuccessResponse, createErrorResponse } = require('./utils/response.util');

// Import routes
const applicationRoutes = require('./routes/application.routes');
const webhookRoutes = require('./routes/webhook.routes');
const applicantsRoutes = require('./routes/applicants.routes');
const fileUploadRoutes = require('./routes/fileUpload.routes');

class App {
  constructor() {
    this.app = express();
    this.config = config;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(bodyParser.json({ limit: '10mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

    this.app.use(corsMiddleware.getMiddleware());
    this.app.use(stripeRawBodyMiddleware.getMiddleware());

    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    this.app.get('/test', (req, res) => {
      res.json({
        success: true,
        message: 'Server is working',
        timestamp: new Date().toISOString(),
        headers: req.headers
      });
    });

    applicationRoutes.setupRoutes(this.app);
    applicantsRoutes.setupRoutes(this.app);
    this.app.use('/api/files', fileUploadRoutes.getRoutes());
    webhookRoutes.setupRoutes(this.app);

    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found'
      });
    });
  }

  setupErrorHandling() {
    this.app.use(errorMiddleware.getMiddleware());
  }

  getApp() {
    return this.app;
  }

  start() {
    const port = this.config.PORT || 3000;
    this.app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔗 API endpoints:`);
      console.log(`   GET  /api/get-application/:email (API Key Required)`);
      console.log(`   POST /api/save-field (API Key Required)`);
      console.log(`   POST /api/create-payment-intent (API Key Required)`);
      console.log(`   POST /api/submit-application (API Key Required)`);
      console.log(`   POST /api/applicants (No Auth Required)`);
      console.log(`   GET  /api/applicants/:email (No Auth Required)`);
      console.log(`   PUT  /api/applicants/:email (No Auth Required)`);
      console.log(`   POST /api/webhook`);
      console.log(`   POST /api/files/upload (API Key Required) - Upload/Replace file (auto-detect)`);
      console.log(`🔑 API Key: ${process.env.NODE_API_KEY ? 'Configured' : 'Not Configured'}`);
      console.log(`🌍 CORS allowed origin: ${this.config.ALLOWED_ORIGIN}`);
      console.log('✅ All required environment variables are configured');
    });
  }
}

module.exports = new App();
