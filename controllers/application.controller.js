const airtableConfig = require("../config/airtable.config");
const applicationService = require("../services/application.service");
const {
  createSuccessResponse,
  createErrorResponse,
} = require("../utils/response.util");

class ApplicationController {
  constructor() {
    this.applicationService = applicationService;
  }

  async getApplication(req, res) {
    try {
      const { email } = req.params;

      // Validate email parameter
      if (!email || email === "null" || email === "undefined") {
        return res
          .status(400)
          .json(createErrorResponse("Valid email is required"));
      }

      const result = await this.applicationService.getOrCreateApplication(
        email
      );

      res.json(
        createSuccessResponse(result, "Application retrieved successfully")
      );
    } catch (error) {
      console.error("Error in getApplication:", error);

      if (
        error.message.includes("Valid email is required") ||
        error.message.includes("Invalid email")
      ) {
        return res
          .status(400)
          .json(createErrorResponse("Valid email is required"));
      }

      res.status(500).json(createErrorResponse("Internal server error", 500));
    }
  }

  async saveField(req, res) {
    try {
      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json(createErrorResponse("Request body is required"));
      }

      const {
        applicationId,
        firstName,
        middleName,
        lastName,
        preferredName,
        dob,
        citizenship,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        emergencyName,
        emergencyRelationship,
        emergencyPhone,
        emergencyEmail,
        uploadArea,
        educationContainer,
        addEducationBtn,
        achievements,
        coursework,
        quantitative,
        technical,
        certifications,
        experienceContainer,
        addExperienceBtn,
        technicalSkills,
        languages,
        industry,
        activities,
        essay1,
        essay2,
        essay3,
        essay4,
        essay5,
        essay6,
        short1,
        short2,
        short3,
        short4,
        short5,
        short6,
      } = req.body;
      console.log("req.body =====", req.body);
      // Validate all required fields
      // if (!applicationId) {
      //   return res.status(400).json(createErrorResponse('Application ID is required'));
      // }
      // if (!section) {
      //   return res.status(400).json(createErrorResponse('Section is required'));
      // }
      // if (!fieldName) {
      //   return res.status(400).json(createErrorResponse('Field name is required'));
      // }
      // if (fieldValue === undefined || fieldValue === null) {
      //   return res.status(400).json(createErrorResponse('Field value is required'));
      // }

      const dbUrl = airtableConfig.getBase();

      const existingRecords = await dbUrl("Application_Data")
        .select({
          filterByFormula: `{applicationId} = "${applicationId}"`,
          maxRecords: 1,
        })
        .firstPage();
      console.log("existingRecords =====", existingRecords);
      // const existingRecords = "";
      let record;
      if (existingRecords.length > 0) {
        // Update existing record (don't update timestamp - it's computed)
        record = await dbUrl("Application_Data").update([
          {
            id: existingRecords[0].id,
            fields: {
              firstName,
              middleName,
              lastName,
              preferredName,
              dob,
              citizenship,
              email,
              phone,
              address,
              city,
              state,
              postalCode,
              country,
              emergencyName,
              emergencyRelationship,
              emergencyPhone,
              emergencyEmail,
              uploadArea,
              educationContainer,
              addEducationBtn,
              achievements,
              coursework,
              quantitative,
              technical,
              certifications,
              experienceContainer,
              addExperienceBtn,
              technicalSkills,
              languages,
              industry,
              activities,
              essay1,
              essay2,
              essay3,
              essay4,
              essay5,
              essay6,
              short1,
              short2,
              short3,
              short4,
              short5,
              short6,
            },
          },
        ]);
        record = record[0];
      } else {
        // Create new record (don't set timestamp - it's computed)
        record = await dbUrl("Application_Data").create({
          applicationId,
          firstName,
          middleName,
          lastName,
          preferredName,
          dob,
          citizenship,
          email,
          phone,
          address,
          city,
          state,
          postalCode,
          country,
          emergencyName,
          emergencyRelationship,
          emergencyPhone,
          emergencyEmail,
          uploadArea,
          educationContainer,
          addEducationBtn,
          achievements,
          coursework,
          quantitative,
          technical,
          certifications,
          experienceContainer,
          addExperienceBtn,
          technicalSkills,
          languages,
          industry,
          activities,
          essay1,
          essay2,
          essay3,
          essay4,
          essay5,
          essay6,
          short1,
          short2,
          short3,
          short4,
          short5,
          short6,
        });
      }

      // const result = await this.applicationService.saveApplicationField(
      //   applicationId,
      //   firstName,
      //   middleName,
      //   lastName,
      //   preferredName,
      //   dob,
      //   citizenship,
      //   email,
      //   phone,
      //   address,
      //   city,
      //   state,
      //   postalCode,
      //   country,
      //   emergencyName,
      //   emergencyRelationship,
      //   emergencyPhone,
      //   emergencyEmail,
      //   uploadArea,
      // );

      // console.log("Result:", result);

      res.json(createSuccessResponse(record, "Field saved successfully"));
    } catch (error) {
      console.error("Error in saveField:", error);

      if (
        error.message.includes("required") ||
        error.message.includes("Invalid")
      ) {
        return res.status(400).json(createErrorResponse(error.message));
      }

      res.status(500).json(createErrorResponse("Internal server error", 500));
    }
  }

  async createPaymentIntent(req, res) {
    try {
      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json(createErrorResponse("Request body is required"));
      }

      const { applicationId, decisionType } = req.body;

      // Validate all required fields
      if (!applicationId) {
        return res
          .status(400)
          .json(createErrorResponse("Application ID is required"));
      }
      if (!decisionType) {
        return res
          .status(400)
          .json(createErrorResponse("Decision type is required"));
      }

      const result = await this.applicationService.createPaymentIntent(
        applicationId,
        decisionType
      );

      res.json(
        createSuccessResponse(result, "Payment intent created successfully")
      );
    } catch (error) {
      console.error("Error in createPaymentIntent:", error);

      if (
        error.message.includes("required") ||
        error.message.includes("Invalid")
      ) {
        return res.status(400).json(createErrorResponse(error.message));
      }

      res.status(500).json(createErrorResponse("Internal server error", 500));
    }
  }

  async submitApplication(req, res) {
    try {
      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json(createErrorResponse("Request body is required"));
      }

      const { applicationId, paymentIntentId } = req.body;

      // Validate all required fields
      if (!applicationId) {
        return res
          .status(400)
          .json(createErrorResponse("Application ID is required"));
      }
      if (!paymentIntentId) {
        return res
          .status(400)
          .json(createErrorResponse("Payment Intent ID is required"));
      }

      const result = await this.applicationService.submitApplication(
        applicationId,
        paymentIntentId
      );

      res.json(
        createSuccessResponse(result, "Application submitted successfully")
      );
    } catch (error) {
      // Clean error handling - only log minimal info
      if (error.message.includes("Missing required sections")) {
        return res.status(400).json(createErrorResponse(error.message));
      } else if (
        error.message.includes("Payment not succeeded") ||
        error.message.includes("Payment intent not found")
      ) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Payment verification failed. Please ensure the payment is completed and valid."
            )
          );
      } else if (
        error.message.includes("required") ||
        error.message.includes("Invalid")
      ) {
        return res.status(400).json(createErrorResponse(error.message));
      } else {
        console.error("Submit application error:", error.message);
        return res
          .status(500)
          .json(createErrorResponse("Internal server error", 500));
      }
    }
  }

  async testConfirmPayment(req, res) {
    try {
      // Validate payload exists
      if (!req.body || Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json(createErrorResponse("Request body is required"));
      }

      const { paymentIntentId } = req.body;

      // Validate all required fields
      if (!paymentIntentId) {
        return res
          .status(400)
          .json(createErrorResponse("Payment Intent ID is required"));
      }

      const result = await this.applicationService.testConfirmPayment(
        paymentIntentId
      );

      res.json(
        createSuccessResponse(
          result,
          "Payment confirmed successfully for testing"
        )
      );
    } catch (error) {
      console.error("Error in testConfirmPayment:", error);

      if (
        error.message.includes("required") ||
        error.message.includes("Invalid")
      ) {
        return res.status(400).json(createErrorResponse(error.message));
      }

      res.status(500).json(createErrorResponse("Internal server error", 500));
    }
  }
}

module.exports = new ApplicationController();
