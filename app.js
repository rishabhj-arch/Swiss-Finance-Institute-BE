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

class App {
  constructor() {
    this.app = express();
    this.config = config;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Body parsing middleware
    this.app.use(bodyParser.json({ limit: '10mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

    // CORS middleware
    this.app.use(corsMiddleware.getMiddleware());

    // Stripe raw body middleware for webhooks
    this.app.use(stripeRawBodyMiddleware.getMiddleware());

    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Health check endpoint
    this.app.get('/test', (req, res) => {
      res.json({
        success: true,
        message: 'Server is working',
        timestamp: new Date().toISOString(),
        headers: req.headers
      });
    });

    // Application routes
    applicationRoutes.setupRoutes(this.app);

    // Applicants routes
    applicantsRoutes.setupRoutes(this.app);

    // Webhook routes
    webhookRoutes.setupRoutes(this.app);

    // 404 handler
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
      console.log(`🔑 API Key: ${process.env.NODE_API_KEY ? 'Configured' : 'Not Configured'}`);
      console.log(`🌍 CORS allowed origin: ${this.config.ALLOWED_ORIGIN}`);
      console.log('✅ All required environment variables are configured');
    });
  }
}

module.exports = new App();
