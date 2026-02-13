const applicationService = require('../services/application.service');
const { createSuccessResponse, createErrorResponse } = require('../utils/response.util');

class ApplicationController {
  constructor() {
    this.applicationService = applicationService;
  }

  async getApplication(req, res) {
    try {
      const { email } = req.params;

      // Validate email parameter
      if (!email || email === 'null' || email === 'undefined') {
        return res.status(400).json(createErrorResponse('Valid email is required'));
      }

      const result = await this.applicationService.getOrCreateApplication(email);

      res.json(createSuccessResponse(result, 'Application retrieved successfully'));
    } catch (error) {
      console.error('Error in getApplication:', error);
      
      if (error.message.includes('Valid email is required') || error.message.includes('Invalid email')) {
        return res.status(400).json(createErrorResponse('Valid email is required'));
      }
      
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }

  async saveField(req, res) {
    try {
      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json(createErrorResponse('Request body is required'));
      }

      const { applicationId, section, fieldName, fieldValue } = req.body;

      // Validate all required fields
      if (!applicationId) {
        return res.status(400).json(createErrorResponse('Application ID is required'));
      }
      if (!section) {
        return res.status(400).json(createErrorResponse('Section is required'));
      }
      if (!fieldName) {
        return res.status(400).json(createErrorResponse('Field name is required'));
      }
      if (fieldValue === undefined || fieldValue === null) {
        return res.status(400).json(createErrorResponse('Field value is required'));
      }

      const result = await this.applicationService.saveApplicationField(
        applicationId,
        section,
        fieldName,
        fieldValue
      );

      console.log('Result:', result);

      res.json(createSuccessResponse(result, 'Field saved successfully'));
    } catch (error) {
      console.error('Error in saveField:', error);
      
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json(createErrorResponse(error.message));
      }
      
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }

  async createPaymentIntent(req, res) {
    try {
      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json(createErrorResponse('Request body is required'));
      }

      const { applicationId, decisionType } = req.body;

      // Validate all required fields
      if (!applicationId) {
        return res.status(400).json(createErrorResponse('Application ID is required'));
      }
      if (!decisionType) {
        return res.status(400).json(createErrorResponse('Decision type is required'));
      }

      const result = await this.applicationService.createPaymentIntent(
        applicationId,
        decisionType
      );

      res.json(createSuccessResponse(result, 'Payment intent created successfully'));
    } catch (error) {
      console.error('Error in createPaymentIntent:', error);
      
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json(createErrorResponse(error.message));
      }
      
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }

  async submitApplication(req, res) {
    try {
      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json(createErrorResponse('Request body is required'));
      }

      const { applicationId, paymentIntentId } = req.body;

      // Validate all required fields
      if (!applicationId) {
        return res.status(400).json(createErrorResponse('Application ID is required'));
      }
      if (!paymentIntentId) {
        return res.status(400).json(createErrorResponse('Payment Intent ID is required'));
      }

      const result = await this.applicationService.submitApplication(
        applicationId,
        paymentIntentId
      );

      res.json(createSuccessResponse(result, 'Application submitted successfully'));
    } catch (error) {
      // Clean error handling - only log minimal info
      if (error.message.includes('Missing required sections')) {
        return res.status(400).json(createErrorResponse(error.message));
      } else if (error.message.includes('Payment not succeeded') || error.message.includes('Payment intent not found')) {
        return res.status(400).json(createErrorResponse('Payment verification failed. Please ensure the payment is completed and valid.'));
      } else if (error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json(createErrorResponse(error.message));
      } else {
        console.error('Submit application error:', error.message);
        return res.status(500).json(createErrorResponse('Internal server error', 500));
      }
    }
  }

  async testConfirmPayment(req, res) {
    try {
      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json(createErrorResponse('Request body is required'));
      }

      const { paymentIntentId } = req.body;

      // Validate all required fields
      if (!paymentIntentId) {
        return res.status(400).json(createErrorResponse('Payment Intent ID is required'));
      }

      const result = await this.applicationService.testConfirmPayment(paymentIntentId);

      res.json(createSuccessResponse(result, 'Payment confirmed successfully for testing'));
    } catch (error) {
      console.error('Error in testConfirmPayment:', error);
      
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json(createErrorResponse(error.message));
      }
      
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }
}

module.exports = new ApplicationController();
