const applicantsService = require('../services/applicants.service');
const { createSuccessResponse, createErrorResponse } = require('../utils/response.util');

class ApplicantsController {
  constructor() {
    this.applicantsService = applicantsService;
  }

  async createApplicant(req, res) {
    try {
      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json(createErrorResponse('Request body is required'));
      }

      // Handle both direct payload and nested data payload
      let applicantData = req.body;
      
      // If payload has data wrapper, extract the data
      if (applicantData.data) {
        applicantData = applicantData.data;
      }

      console.log('Received applicant data:', applicantData); // Debug log

      // Validate required fields
      const { validateApplicantData } = require('../utils/validation.util');
      const validation = validateApplicantData(applicantData);

      if (!validation.isValid) {
        return res.status(400).json(createErrorResponse(validation.errors.join(', ')));
      }

      // Create applicant
      const result = await this.applicantsService.createApplicant(applicantData);

      console.log('Applicant created successfully:', result); // Debug log

      res.status(201).json(createSuccessResponse(result, 'Applicant created successfully'));
    } catch (error) {
      console.error('Error in createApplicant:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json(createErrorResponse(error.message));
      } else if (error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json(createErrorResponse(error.message));
      }
      
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }

  async getApplicant(req, res) {
    try {
      const { email } = req.params;

      console.log('Fetching applicant with email:', email); // Debug log

      // Validate email parameter
      if (!email || email === 'null' || email === 'undefined') {
        return res.status(400).json(createErrorResponse('Valid email is required'));
      }

      // Validate email format
      const { validateEmail } = require('../utils/validation.util');
      if (!validateEmail(email)) {
        return res.status(400).json(createErrorResponse('Valid email is required'));
      }

      // Get applicant (only if exists, no auto-creation)
      const result = await this.applicantsService.getApplicantByEmail(email);

      if (!result) {
        return res.status(404).json(createErrorResponse('Applicant not found'));
      }

      res.json(createSuccessResponse(result, 'Applicant retrieved successfully'));
    } catch (error) {
      console.error('Error in getApplicant:', error);
      
      if (error.message.includes('Valid email is required') || error.message.includes('Invalid email')) {
        return res.status(400).json(createErrorResponse('Valid email is required'));
      }
      
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }

  async updateApplicant(req, res) {
    try {
      const { email } = req.params;
      const updateData = req.body;

      // Validate email parameter
      if (!email || email === 'null' || email === 'undefined') {
        return res.status(400).json(createErrorResponse('Valid email is required'));
      }

      // Validate email format
      const { validateEmail } = require('../utils/validation.util');
      if (!validateEmail(email)) {
        return res.status(400).json(createErrorResponse('Valid email is required'));
      }

      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json(createErrorResponse('Request body is required'));
      }

      // Validate at least one field to update
      if (!updateData.name && !updateData.currentStage) {
        return res.status(400).json(createErrorResponse('At least one field (name or currentStage) is required for update'));
      }

      // Update applicant
      const result = await this.applicantsService.updateApplicant(email, updateData);

      if (!result) {
        return res.status(404).json(createErrorResponse('Applicant not found'));
      }

      res.json(createSuccessResponse(result, 'Applicant updated successfully'));
    } catch (error) {
      console.error('Error in updateApplicant:', error);
      
      if (error.message.includes('Valid email is required') || error.message.includes('Invalid email') || error.message.includes('required') || error.message.includes('Invalid')) {
        return res.status(400).json(createErrorResponse(error.message));
      }
      
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }
}

module.exports = new ApplicantsController();
