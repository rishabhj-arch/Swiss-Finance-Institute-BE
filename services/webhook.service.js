const airtableService = require('./airtable.service');
const paymentService = require('./payment.service');

class WebhookService {
  constructor() {
    this.airtableService = airtableService;
    this.paymentService = paymentService;
  }

  async handlePaymentSucceeded(paymentIntent) {
    try {
      console.log(`Payment succeeded: ${paymentIntent.id}`);
      
      // Update payment record status to "Succeeded"
      const { PAYMENT_STATUS } = require('../utils/constants.util');
      await this.airtableService.updatePaymentStatus(paymentIntent.id, PAYMENT_STATUS.SUCCEEDED);

      // Log successful payment
      const applicationId = this.paymentService.getApplicationIdFromMetadata(paymentIntent.metadata);
      if (applicationId) {
        await this.saveApplicationField(
          applicationId,
          'payment',
          'webhookPaymentStatus',
          'succeeded'
        );
        
        await this.saveApplicationField(
          applicationId,
          'payment',
          'webhookProcessedAt',
          new Date().toISOString()
        );
      }
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
      throw error;
    }
  }

  async handlePaymentFailed(paymentIntent) {
    try {
      console.log(`Payment failed: ${paymentIntent.id}`);
      
      // Update payment record status to "Failed"
      const { PAYMENT_STATUS } = require('../utils/constants.util');
      await this.airtableService.updatePaymentStatus(paymentIntent.id, PAYMENT_STATUS.FAILED);

      // Log failed payment
      const applicationId = this.paymentService.getApplicationIdFromMetadata(paymentIntent.metadata);
      if (applicationId) {
        await this.saveApplicationField(
          applicationId,
          'payment',
          'webhookPaymentStatus',
          'failed'
        );
        
        await this.saveApplicationField(
          applicationId,
          'payment',
          'webhookProcessedAt',
          new Date().toISOString()
        );

        // Log failure reason if available
        if (paymentIntent.last_payment_error) {
          await this.saveApplicationField(
            applicationId,
            'payment',
            'paymentFailureReason',
            paymentIntent.last_payment_error.message
          );
        }
      }
    } catch (error) {
      console.error('Error handling payment failed:', error);
      throw error;
    }
  }

  async handlePaymentCanceled(paymentIntent) {
    try {
      console.log(`Payment canceled: ${paymentIntent.id}`);
      
      // Update payment record status to "Failed" (canceled is treated as failed)
      const { PAYMENT_STATUS } = require('../utils/constants.util');
      await this.airtableService.updatePaymentStatus(paymentIntent.id, PAYMENT_STATUS.FAILED);

      // Log canceled payment
      const applicationId = this.paymentService.getApplicationIdFromMetadata(paymentIntent.metadata);
      if (applicationId) {
        await this.saveApplicationField(
          applicationId,
          'payment',
          'webhookPaymentStatus',
          'canceled'
        );
        
        await this.saveApplicationField(
          applicationId,
          'payment',
          'webhookProcessedAt',
          new Date().toISOString()
        );
      }
    } catch (error) {
      console.error('Error handling payment canceled:', error);
      throw error;
    }
  }

  async saveApplicationField(applicationId, section, fieldName, fieldValue) {
    return await this.airtableService.saveApplicationField(applicationId, section, fieldName, fieldValue);
  }
}

module.exports = new WebhookService();
