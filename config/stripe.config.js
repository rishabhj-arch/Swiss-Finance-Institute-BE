const stripe = require('stripe');
const config = require('./env.config');

class StripeConfig {
  constructor() {
    if (!config.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is required');
    }
    
    this.stripe = stripe(config.STRIPE_SECRET_KEY);
  }

  getStripe() {
    return this.stripe;
  }
}

module.exports = new StripeConfig();
