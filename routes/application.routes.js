const applicationController = require('../controllers/application.controller');
const apiKeyMiddleware = require('../middleware/apikey.middleware');

class ApplicationRoutes {
  constructor() {
    this.controller = applicationController;
    this.apiKeyMiddleware = apiKeyMiddleware;
  }

  setupRoutes(app) {
    // GET /api/get-application/:email - Protected with API key
    app.get('/api/get-application/:email', 
      this.apiKeyMiddleware.verifyApiKey.bind(this.apiKeyMiddleware),
      this.controller.getApplication.bind(this.controller)
    );

    // POST /api/save-field - Protected with API key
    app.post('/api/save-field', 
      this.apiKeyMiddleware.verifyApiKey.bind(this.apiKeyMiddleware),
      this.controller.saveField.bind(this.controller)
    );

    // POST /api/create-payment-intent - Protected with API key
    app.post('/api/create-payment-intent', 
      this.apiKeyMiddleware.verifyApiKey.bind(this.apiKeyMiddleware),
      this.controller.createPaymentIntent.bind(this.controller)
    );

    // POST /api/submit-application - Protected with API key
    app.post('/api/submit-application', 
      this.apiKeyMiddleware.verifyApiKey.bind(this.apiKeyMiddleware),
      this.controller.submitApplication.bind(this.controller)
    );

    // POST /api/test-confirm-payment - Protected with API key
    app.post('/api/test-confirm-payment', 
      this.apiKeyMiddleware.verifyApiKey.bind(this.apiKeyMiddleware),
      this.controller.testConfirmPayment.bind(this.controller)
    );
  }
}

module.exports = new ApplicationRoutes();
