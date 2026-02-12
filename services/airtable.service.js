const airtableConfig = require('../config/airtable.config');
const { DECISION_PRICES, PAYMENT_STATUS, APPLICATION_STATUS } = require('../utils/constants.util');

class AirtableService {
  constructor() {
    this.base = airtableConfig.getBase();
  }

  async createApplicant(email, name, applicationId) {
    try {
      const recordData = {
        'Email': email,
        'Name': name,
        'Application ID': applicationId,
        'Current Stage': 1
      };

      const record = await this.base('Applicants').create(recordData);
      return record;
    } catch (error) {
      console.error('Error creating applicant:', error);
      throw error;
    }
  }

  async getApplicant(email) {
    try {
      const records = await this.base('Applicants')
        .select({
          filterByFormula: `{Email} = "${email}"`,
          maxRecords: 1
        })
        .firstPage();
      
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('Error fetching applicant:', error);
      throw error;
    }
  }

  async updateApplicantStatus(applicationId, status, submittedAt = null) {
    try {
      const records = await this.base('Applicants')
        .select({
          filterByFormula: `{Application ID} = "${applicationId}"`,
          maxRecords: 1
        })
        .firstPage();

      if (records.length === 0) {
        throw new Error('Applicant not found');
      }

      const updateData = {
        'Status': status
      };

      if (submittedAt) {
        updateData['Submitted At'] = submittedAt;
      }

      const updatedRecord = await this.base('Applicants').update([
        {
          id: records[0].id,
          fields: updateData
        }
      ]);

      return updatedRecord[0];
    } catch (error) {
      console.error('Error updating applicant status:', error);
      throw error;
    }
  }

  async updateApplicant(email, updateData) {
    try {
      const records = await this.base('Applicants')
        .select({
          filterByFormula: `{Email} = "${email}"`,
          maxRecords: 1
        })
        .firstPage();

      if (records.length === 0) {
        return null;
      }

      const fieldsToUpdate = {};

      // Map updateData to Airtable fields
      if (updateData.name) {
        fieldsToUpdate['Name'] = updateData.name;
      }
      if (updateData.currentStage) {
        fieldsToUpdate['Current Stage'] = updateData.currentStage;
      }

      const updatedRecord = await this.base('Applicants').update([
        {
          id: records[0].id,
          fields: fieldsToUpdate
        }
      ]);

      return updatedRecord[0];
    } catch (error) {
      console.error('Error updating applicant:', error);
      throw error;
    }
  }

  async saveApplicationField(applicationId, section, fieldName, fieldValue) {
    try {
      const { SECTION_STAGE_MAPPING } = require('../utils/constants.util');
      
      // Save field to Application_Data table
      const record = await this.base('Application_Data').create({
        'Application ID': applicationId,
        'Section': section,
        'Field Name': fieldName,
        'Field Value': fieldValue
      });

      // Automatically update applicant stage based on section
      const newStage = SECTION_STAGE_MAPPING[section];
      if (newStage) {
        await this.updateApplicantStageByApplicationId(applicationId, newStage);
      }

      return record;
    } catch (error) {
      console.error('Error saving application field:', error);
      throw error;
    }
  }

  async updateApplicantStageByApplicationId(applicationId, newStage) {
    try {
      const records = await this.base('Applicants')
        .select({
          filterByFormula: `{Application ID} = "${applicationId}"`,
          maxRecords: 1
        })
        .firstPage();

      if (records.length === 0) {
        return null;
      }

      const updatedRecord = await this.base('Applicants').update([
        {
          id: records[0].id,
          fields: {
            'Current Stage': newStage
          }
        }
      ]);

      return updatedRecord[0];
    } catch (error) {
      console.error('Error updating applicant stage by application ID:', error);
      throw error;
    }
  }

  async getAllApplicationData() {
    try {
      const records = await this.base('Application_Data')
        .select({
          maxRecords: 100
        })
        .firstPage();
      
      return records;
    } catch (error) {
      console.error('Error fetching all application data:', error);
      throw error;
    }
  }

  async getApplicationData(applicationId) {
    try {
      const records = await this.base('Application_Data')
        .select({
          filterByFormula: `{Application ID} = "${applicationId}"`
        })
        .firstPage();
      
      return records;
    } catch (error) {
      console.error('Error fetching application data:', error);
      throw error;
    }
  }

  async createPaymentRecord(applicationId, decisionType, amountInCents, status, stripePaymentIntentId) {
    try {
      // Convert cents to dollars for Airtable storage
      const amountInDollars = amountInCents / 100;
      
      const record = await this.base('Payments').create({
        'Application ID': applicationId,
        'Decision Type': decisionType,
        'Amount': amountInDollars, // Store in dollars
        'Status': status,
        'Stripe Payment Intent ID': stripePaymentIntentId
      });
      return record;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  }

  async updatePaymentStatus(stripePaymentIntentId, status) {
    try {
      const records = await this.base('Payments')
        .select({
          filterByFormula: `{Stripe Payment Intent ID} = "${stripePaymentIntentId}"`,
          maxRecords: 1
        })
        .firstPage();

      if (records.length === 0) {
        throw new Error('Payment record not found');
      }

      const updatedRecord = await this.base('Payments').update([
        {
          id: records[0].id,
          fields: {
            'Status': status
          }
        }
      ]);

      return updatedRecord[0];
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async validateApplicationSections(applicationId) {
    try {
      const records = await this.getApplicationData(applicationId);
      const { validateRequiredSections } = require('../utils/validation.util');
      
      return validateRequiredSections(records);
    } catch (error) {
      console.error('Error validating application sections:', error);
      throw error;
    }
  }
}

module.exports = new AirtableService();
