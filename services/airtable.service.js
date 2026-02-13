const airtableConfig = require("../config/airtable.config");
const {
  DECISION_PRICES,
  PAYMENT_STATUS,
  APPLICATION_STATUS,
} = require("../utils/constants.util");

class AirtableService {
  constructor() {
    this.base = airtableConfig.getBase();
  }

  async createApplicant(email, name, applicationId) {
    try {
      const recordData = {
        Email: email,
        Name: name,
        "Application ID": applicationId,
        "Current Stage": 1,
      };

      const record = await this.base("Applicants").create(recordData);
      return record;
    } catch (error) {
      console.error("Error creating applicant:", error);
      throw error;
    }
  }

  async getApplicant(email) {
    try {
      // Validate email parameter
      if (
        !email ||
        typeof email !== "string" ||
        email === "null" ||
        email === "undefined"
      ) {
        throw new Error("Valid email is required");
      }

      const records = await this.base("Applicants")
        .select({
          filterByFormula: `{Email} = "${email}"`,
          maxRecords: 1,
        })
        .firstPage();

      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error("Error fetching applicant:", error);
      throw error;
    }
  }

  async updateApplicantStatus(applicationId, status, submittedAt = null) {
    try {
      // Validate applicationId parameter
      if (
        !applicationId ||
        typeof applicationId !== "string" ||
        applicationId === "null" ||
        applicationId === "undefined"
      ) {
        throw new Error("Valid application ID is required");
      }

      const records = await this.base("Applicants")
        .select({
          filterByFormula: `{Application ID} = "${applicationId}"`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) {
        throw new Error("Applicant not found");
      }

      const updateData = {
        Status: status,
      };

      if (submittedAt) {
        updateData["Submitted At"] = submittedAt;
      }

      const updatedRecord = await this.base("Applicants").update([
        {
          id: records[0].id,
          fields: updateData,
        },
      ]);

      return updatedRecord[0];
    } catch (error) {
      console.error("Error updating applicant status:", error);
      throw error;
    }
  }

  async updateApplicant(email, updateData) {
    try {
      const records = await this.base("Applicants")
        .select({
          filterByFormula: `{Email} = "${email}"`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) {
        return null;
      }

      const fieldsToUpdate = {};

      // Map updateData to Airtable fields
      if (updateData.name) {
        fieldsToUpdate["Name"] = updateData.name;
      }
      if (updateData.currentStage) {
        fieldsToUpdate["Current Stage"] = updateData.currentStage;
      }

      const updatedRecord = await this.base("Applicants").update([
        {
          id: records[0].id,
          fields: fieldsToUpdate,
        },
      ]);

      return updatedRecord[0];
    } catch (error) {
      console.error("Error updating applicant:", error);
      throw error;
    }
  }
  // section, fieldName, fieldValue
  async saveApplicationField(createApplicantBody) {
    try {
      console.log(" ====3=");
      const { SECTION_STAGE_MAPPING } = require("../utils/constants.util");
      const applicationId = createApplicantBody?.applicationId;
      // delete createApplicantBody["applicationId"];
      console.log(" ==4===");
      console.log("createApplicantBody =====", createApplicantBody);
      // First, check if a record with this applicationId, section, and fieldName already exists
      const existingRecords = await this.base("Application_Data")
        .select({
          filterByFormula: `AND({applicationId} = "${applicationId}"`,
          maxRecords: 1,
        })
        .firstPage();
      // console.log("existingRecords =====", existingRecords);
      // let record;
      // if (existingRecords.length > 0) {
      //   // Update existing record (don't update timestamp - it's computed)
      //   record = await this.base("Application_Data").update([
      //     {
      //       id: existingRecords[0].id,
      //       fields: {
      //         createApplicantBody,
      //       },
      //     },
      //   ]);
      //   record = record[0];
      //   console.log(
      //     `Updated existing field: ${fieldName} for application: ${applicationId}`
      //   );
      // } else {
      //   // Create new record (don't set timestamp - it's computed)
      //   record = await this.base("Application_Data").create({
      //     "applicationId": applicationId,
      //     ...createApplicantBody,
      //   });
      //   console.log(
      //     `Created new field: ${fieldName} for application: ${applicationId}`
      //   );
      // }

      // Automatically update applicant stage based on section
      // const newStage = SECTION_STAGE_MAPPING[section];
      // if (newStage) {
      //   await this.updateApplicantStageByApplicationId(applicationId, newStage);
      // }

      return record;
    } catch (error) {
      console.error("Error saving application field:", error);
      throw error;
    }
  }

  async updateApplicantStageByApplicationId(applicationId, newStage) {
    try {
      const records = await this.base("Applicants")
        .select({
          filterByFormula: `{Application ID} = "${applicationId}"`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) {
        return null;
      }

      const updatedRecord = await this.base("Applicants").update([
        {
          id: records[0].id,
          fields: {
            "Current Stage": newStage,
          },
        },
      ]);

      return updatedRecord[0];
    } catch (error) {
      console.error("Error updating applicant stage by application ID:", error);
      throw error;
    }
  }

  async getAllApplicationData() {
    try {
      const records = await this.base("Application_Data")
        .select({
          maxRecords: 100,
        })
        .firstPage();

      return records;
    } catch (error) {
      console.error("Error fetching all application data:", error);
      throw error;
    }
  }

  async getApplicationData(applicationId) {
    try {
      const records = await this.base("Application_Data")
        .select({
          filterByFormula: `{Application ID} = "${applicationId}"`,
        })
        .firstPage();

      return records;
    } catch (error) {
      console.error("Error fetching application data:", error);
      throw error;
    }
  }

  async createPaymentRecord(
    applicationId,
    decisionType,
    amountInCents,
    status,
    stripePaymentIntentId
  ) {
    try {
      // Convert cents to dollars for Airtable storage
      const amountInDollars = amountInCents / 100;

      const record = await this.base("Payments").create({
        "Application ID": applicationId,
        "Decision Type": decisionType,
        Amount: amountInDollars, // Store in dollars
        Status: status,
        "Stripe Payment Intent ID": stripePaymentIntentId,
      });
      return record;
    } catch (error) {
      console.error("Error creating payment record:", error);
      throw error;
    }
  }

  async updatePaymentStatus(stripePaymentIntentId, status) {
    try {
      const records = await this.base("Payments")
        .select({
          filterByFormula: `{Stripe Payment Intent ID} = "${stripePaymentIntentId}"`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) {
        throw new Error("Payment record not found");
      }

      const updatedRecord = await this.base("Payments").update([
        {
          id: records[0].id,
          fields: {
            Status: status,
          },
        },
      ]);

      return updatedRecord[0];
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  }

  async deleteApplicationField(applicationId, fieldName) {
    try {
      // Find the record to delete
      const records = await this.base("Application_Data")
        .select({
          filterByFormula: `AND({Application ID} = "${applicationId}", {Field Name} = "${fieldName}")`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) {
        throw new Error("Application field not found");
      }

      // Delete the record
      await this.base("Application_Data").destroy([records[0].id]);

      console.log(
        `Deleted application field: ${fieldName} for application: ${applicationId}`
      );
      return true;
    } catch (error) {
      console.error("Error deleting application field:", error);
      throw error;
    }
  }

  async validateApplicationSections(applicationId) {
    try {
      const records = await this.getApplicationData(applicationId);
      const { validateRequiredSections } = require("../utils/validation.util");

      return validateRequiredSections(records);
    } catch (error) {
      console.error("Error validating application sections:", error);
      throw error;
    }
  }
}

module.exports = new AirtableService();
