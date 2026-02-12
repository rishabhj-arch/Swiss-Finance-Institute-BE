const airtableService = require('./airtable.service');
const { createSuccessResponse, createErrorResponse } = require('../utils/response.util');

class ApplicantsService {
  constructor() {
    this.airtableService = airtableService;
  }

  async createApplicant(applicantData) {
    try {
      const { email, name, applicationId } = applicantData;

      // Check if applicant already exists
      const existingApplicant = await this.airtableService.getApplicant(email);
      if (existingApplicant) {
        throw new Error('Applicant with this email already exists');
      }

      // Create applicant in Airtable with current stage 8
      const applicant = await this.airtableService.createApplicant(email, name, applicationId);

      return {
        id: applicant.id,
        applicationId: applicant.fields['Application ID'],
        email: applicant.fields['Email'],
        name: applicant.fields['Name'],
        currentStage: applicant.fields['Current Stage'],
        createdAt: applicant.fields['Created At']
      };
    } catch (error) {
      console.error('Error creating applicant:', error);
      throw error;
    }
  }

  async getApplicantByEmail(email) {
    try {
      const applicant = await this.airtableService.getApplicant(email);
      
      if (!applicant) {
        return null;
      }

      return {
        id: applicant.id,
        applicationId: applicant.fields['Application ID'],
        email: applicant.fields['Email'],
        name: applicant.fields['Name'],
        currentStage: applicant.fields['Current Stage'],
        createdAt: applicant.fields['Created At']
      };
    } catch (error) {
      console.error('Error getting applicant:', error);
      throw error;
    }
  }

  async updateApplicant(email, updateData) {
    try {
      // Check if applicant exists
      const existingApplicant = await this.airtableService.getApplicant(email);
      if (!existingApplicant) {
        return null;
      }

      // Update applicant in Airtable
      const updatedApplicant = await this.airtableService.updateApplicant(email, updateData);

      return {
        id: updatedApplicant.id,
        applicationId: updatedApplicant.fields['Application ID'],
        email: updatedApplicant.fields['Email'],
        name: updatedApplicant.fields['Name'],
        currentStage: updatedApplicant.fields['Current Stage'],
        createdAt: updatedApplicant.fields['Created At']
      };
    } catch (error) {
      console.error('Error updating applicant:', error);
      throw error;
    }
  }
}

module.exports = new ApplicantsService();
