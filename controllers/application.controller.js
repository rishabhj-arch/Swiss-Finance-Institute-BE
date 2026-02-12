const applicationService = require('../services/application.service');
const { createSuccessResponse, createErrorResponse } = require('../utils/response.util');

class ApplicationController {
  constructor() {
    this.applicationService = applicationService;
  }

  async getApplication(req, res) {
    try {
      const { email } = req.params;

      const result = await this.applicationService.getOrCreateApplication(email);

      res.json(createSuccessResponse(result, 'Application retrieved successfully'));
    } catch (error) {
      console.error('Error in getApplication:', error);
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }

  async saveField(req, res) {
    try {
      const { applicationId, section, fieldName, fieldValue } = req.body;

      const result = await this.applicationService.saveApplicationField(
        applicationId,
        section,
        fieldName,
        fieldValue
      );

      res.json(createSuccessResponse(result, 'Field saved successfully'));
    } catch (error) {
      console.error('Error in saveField:', error);
      
      if (error.message.includes('required')) {
        res.status(400).json(createErrorResponse(error.message));
      } else {
        res.status(500).json(createErrorResponse('Internal server error', 500));
      }
    }
  }

  async createPaymentIntent(req, res) {
    try {
      const { applicationId, decisionType } = req.body;

      const result = await this.applicationService.createPaymentIntent(
        applicationId,
        decisionType
      );

      res.json(createSuccessResponse(result, 'Payment intent created successfully'));
    } catch (error) {
      console.error('Error in createPaymentIntent:', error);
      
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        res.status(400).json(createErrorResponse(error.message));
      } else {
        res.status(500).json(createErrorResponse('Internal server error', 500));
      }
    }
  }

  async submitApplication(req, res) {
    try {
      const { applicationId, paymentIntentId } = req.body;

      const result = await this.applicationService.submitApplication(
        applicationId,
        paymentIntentId
      );

      res.json(createSuccessResponse(result, 'Application submitted successfully'));
    } catch (error) {
      console.error('Error in submitApplication:', error);
      
      if (error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('Missing')) {
        res.status(400).json(createErrorResponse(error.message));
      } else if (error.message.includes('Missing required sections')) {
        res.status(400).json(createErrorResponse(error.message));
      } else if (error.message.includes('Payment not succeeded') || error.message.includes('Payment intent not found')) {
        res.status(400).json(createErrorResponse('Payment verification failed. Please ensure the payment is completed and valid.'));
      } else {
        res.status(500).json(createErrorResponse('Internal server error', 500));
      }
    }
  }

  async testConfirmPayment(req, res) {
    try {
      const { paymentIntentId } = req.body;

      const result = await this.applicationService.testConfirmPayment(paymentIntentId);

      res.json(createSuccessResponse(result, 'Payment confirmed successfully for testing'));
    } catch (error) {
      console.error('Error in testConfirmPayment:', error);
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }
}

module.exports = new ApplicationController();
