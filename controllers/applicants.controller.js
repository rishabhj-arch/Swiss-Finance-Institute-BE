const applicantsService = require('../services/applicants.service');
const { createSuccessResponse, createErrorResponse } = require('../utils/response.util');

class ApplicantsController {
  constructor() {
    this.applicantsService = applicantsService;
  }

  async createApplicant(req, res) {
    try {
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
        res.status(409).json(createErrorResponse(error.message));
      } else if (error.message.includes('required') || error.message.includes('Invalid')) {
        res.status(400).json(createErrorResponse(error.message));
      } else {
        res.status(500).json(createErrorResponse('Internal server error', 500));
      }
    }
  }

  async getApplicant(req, res) {
    try {
      const { email } = req.params;

      // Validate email
      const { validateEmail } = require('../utils/validation.util');
      if (!email || !validateEmail(email)) {
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
      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }

  async updateApplicant(req, res) {
    try {
      const { email } = req.params;
      const updateData = req.body;

      // Validate email
      const { validateEmail } = require('../utils/validation.util');
      if (!email || !validateEmail(email)) {
        return res.status(400).json(createErrorResponse('Valid email is required'));
      }

      // Update applicant
      const result = await this.applicantsService.updateApplicant(email, updateData);

      if (!result) {
        return res.status(404).json(createErrorResponse('Applicant not found'));
      }

      res.json(createSuccessResponse(result, 'Applicant updated successfully'));
    } catch (error) {
      console.error('Error in updateApplicant:', error);
      
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        res.status(400).json(createErrorResponse(error.message));
      } else {
        res.status(500).json(createErrorResponse('Internal server error', 500));
      }
    }
  }
}

module.exports = new ApplicantsController();
