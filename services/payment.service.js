const stripeConfig = require('../config/stripe.config');
const { DECISION_PRICES, PAYMENT_STATUS } = require('../utils/constants.util');

class PaymentService {
  constructor() {
    this.stripe = stripeConfig.getStripe();
  }

  getDecisionTypePrice(decisionType) {
    const price = DECISION_PRICES[decisionType];
    if (!price) {
      throw new Error(`Invalid decision type: ${decisionType}`);
    }
    return price;
  }

  async createPaymentIntent(applicationId, decisionType) {
    try {
      const amount = this.getDecisionTypePrice(decisionType);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: {
          applicationId: applicationId,
          decisionType: decisionType
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  async confirmPaymentSuccess(paymentIntentId) {
    try {
      const paymentIntent = await this.retrievePaymentIntent(paymentIntentId);
      
      if (!paymentIntent) {
        throw new Error(`Payment intent not found: ${paymentIntentId}`);
      }
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not succeeded. Current status: ${paymentIntent.status}`);
      }

      // Update payment status in Airtable to Succeeded
      const airtableService = require('./airtable.service');
      const { PAYMENT_STATUS } = require('../utils/constants.util');
      
      await airtableService.updatePaymentStatus(paymentIntentId, PAYMENT_STATUS.SUCCEEDED);
      console.log(`Payment ${paymentIntentId} status updated to Succeeded in Airtable`);

      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment success:', error);
      throw error;
    }
  }

  constructWebhookEvent(payload, signature, secret) {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
      return event;
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw error;
    }
  }

  formatAmountForDisplay(amountInCents) {
    return (amountInCents / 100).toFixed(2);
  }

  getDecisionTypeFromMetadata(metadata) {
    return metadata.decisionType || null;
  }

  async testConfirmPayment(paymentIntentId) {
    try {
      // Confirm payment using test card (for testing only)
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: 'pm_card_visa'
        }
      );

      // If payment succeeded, update status in Airtable
      if (paymentIntent.status === 'succeeded') {
        const airtableService = require('./airtable.service');
        const { PAYMENT_STATUS } = require('../utils/constants.util');
        
        await airtableService.updatePaymentStatus(paymentIntentId, PAYMENT_STATUS.SUCCEEDED);
        console.log(`Payment ${paymentIntentId} status updated to Succeeded in Airtable`);
      }

      return paymentIntent;
    } catch (error) {
      console.error('Error confirming test payment:', error);
      throw error;
    }
  }

  getApplicationIdFromMetadata(metadata) {
    return metadata.applicationId || null;
  }
}

module.exports = new PaymentService();
