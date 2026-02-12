const webhookService = require('../services/webhook.service');
const { createSuccessResponse, createErrorResponse } = require('../utils/response.util');

class WebhookController {
  constructor() {
    this.webhookService = webhookService;
  }

  async handleWebhook(req, res) {
    try {
      const sig = req.headers['stripe-signature'];
      const payload = req.rawBody;
      
      if (!payload) {
        return res.status(400).json(createErrorResponse('Payload is required'));
      }

      if (!sig) {
        return res.status(400).json(createErrorResponse('Signature is required'));
      }

      const config = require('../config/env.config');
      if (!config.STRIPE_WEBHOOK_SECRET) {
        return res.status(500).json(createErrorResponse('Webhook secret not configured', 500));
      }

      // Construct and verify the event
      const event = this.webhookService.paymentService.constructWebhookEvent(
        payload,
        sig,
        config.STRIPE_WEBHOOK_SECRET
      );

      console.log(`Webhook received: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.webhookService.handlePaymentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.webhookService.handlePaymentFailed(event.data.object);
          break;

        case 'payment_intent.canceled':
          await this.webhookService.handlePaymentCanceled(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Return 200 OK to acknowledge receipt of the event
      res.json(createSuccessResponse(null, 'Webhook processed successfully'));
    } catch (error) {
      console.error('Webhook error:', error);
      
      if (error.message.includes('signature') || error.message.includes('Webhook secret')) {
        res.status(400).json(createErrorResponse(error.message));
      } else {
        res.status(500).json(createErrorResponse('Webhook handler failed', 500));
      }
    }
  }
}

module.exports = new WebhookController();
