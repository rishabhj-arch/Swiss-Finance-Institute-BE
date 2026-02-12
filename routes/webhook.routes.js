const webhookController = require('../controllers/webhook.controller');

class WebhookRoutes {
  constructor() {
    this.controller = webhookController;
  }

  setupRoutes(app) {
    // POST /api/webhook
    app.post('/api/webhook', this.controller.handleWebhook.bind(this.controller));
  }
}

module.exports = new WebhookRoutes();
