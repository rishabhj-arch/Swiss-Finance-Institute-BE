const applicantsController = require('../controllers/applicants.controller');

class ApplicantsRoutes {
  constructor() {
    this.controller = applicantsController;
  }

  setupRoutes(app) {
    // POST /api/applicants - Create new applicant
    app.post('/api/applicants', this.controller.createApplicant.bind(this.controller));

    // GET /api/applicants/:email - Get applicant by email (only if exists)
    app.get('/api/applicants/:email', this.controller.getApplicant.bind(this.controller));

    // PUT /api/applicants/:email - Update applicant by email
    app.put('/api/applicants/:email', this.controller.updateApplicant.bind(this.controller));
  }
}

module.exports = new ApplicantsRoutes();
