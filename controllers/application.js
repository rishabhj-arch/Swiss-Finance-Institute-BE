const base = require("../config/db.config");
const {
  createErrorResponse,
  createSuccessResponse,
} = require("../utils/response");

// Get application by email
exports.getApplications = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email || email === "null" || email === "undefined") {
      return res.status(400).json(createErrorResponse("Email is required"));
    }

    const safeEmail = email.replace(/"/g, '\\"');

    // Find Applicant by email
    const applicantRecords = await base("Applicants")
      .select({
        filterByFormula: `{email} = '${safeEmail}'`,
        maxRecords: 1,
      })
      .firstPage();

    let applicant;
    let applicationId;

    if (!applicantRecords.length) {
      const { v4: uuidv4 } = require("uuid");
      applicationId = uuidv4();

      const name = email
        .split("@")[0]
        .replace(".", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      applicant = await base("Applicants").create({
        email,
        name,
        applicationId,
      });
    } else {
      applicant = applicantRecords[0];
      applicationId = applicant.fields["applicationId"];
    }

    const applicantRecordId = applicant.id;

    // Get Application_Data linked to applicant
    const applicationDataRecords = await base("Application_Data")
      .select({
        filterByFormula: `{applicationId} = '${applicationId}'`,
        maxRecords: 1,
      })
      .firstPage();

    let applicationData = applicationDataRecords[0];

    let educationData = [];
    let experienceData = [];

    if (applicationData) {
      const educationIds = applicationData.fields.educationContainer || [];
      const experienceIds = applicationData.fields.experienceContainer || [];

      // Fetch Education records
      if (educationIds.length > 0) {
        const educationRecords = await base("Education")
          .select({
            filterByFormula: `OR(${educationIds
              .map((id) => `RECORD_ID()='${id}'`)
              .join(",")})`,
          })
          .firstPage();

        educationData = educationRecords.map((rec) => rec.fields);
      }

      // Fetch Experience records
      if (experienceIds.length > 0) {
        const experienceRecords = await base("Experience")
          .select({
            filterByFormula: `OR(${experienceIds
              .map((id) => `RECORD_ID()='${id}'`)
              .join(",")})`,
          })
          .firstPage();

        experienceData = experienceRecords.map((rec) => rec.fields);
      }
    }

    return res.json(
      createSuccessResponse(
        {
          applicationId,
          ...applicant.fields,
          ...applicationData?.fields,
          educationContainer: educationData,
          experienceContainer: experienceData,
        },
        "Application retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Error in getApplication:", error);

    return res
      .status(500)
      .json(createErrorResponse("Internal server error", 500));
  }
};

// Create application
exports.createApplication = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is required" });
    }

    const {
      applicationId,
      educationContainer = [],
      experienceContainer = [],
      ...restFields
    } = req.body;

    if (!applicationId) {
      return res.status(400).json({ error: "applicationId is required" });
    }

    // Find Applicant
    const applicantRecords = await base("Applicants")
      .select({
        filterByFormula: `{applicationId} = '${applicationId}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (!applicantRecords.length) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    const applicantRecordId = applicantRecords[0].id;

    // Check if Application_Data exists
    const existingApplication = await base("Application_Data")
      .select({
        filterByFormula: `{applicationId} = '${applicationId}'`,
        maxRecords: 1,
      })
      .firstPage();
    let applicationDataId;

    if (existingApplication.length > 0) {
      applicationDataId = existingApplication[0].id;
      console.log("existingApplication[0].id =====", existingApplication[0].id);
      await base("Application_Data").update(applicationDataId, {
        ...restFields,
      });
    } else {
      const newApplication = await base("Application_Data").create({
        ...restFields,
        applicationId: applicationId,
      });

      applicationDataId = newApplication.id;
    }

    // DELETE existing Education linked to this application
    const existingEducation = await base("Education")
      .select({
        filterByFormula: `{application_data} = '${applicationId}'`,
      })
      .all();

    if (existingEducation.length > 0) {
      await base("Education").destroy(existingEducation.map((rec) => rec.id));
    }

    // CREATE Education (fresh)
    let educationIds = [];

    if (educationContainer.length > 0) {
      const educationRecords = await base("Education").create(
        educationContainer.map((edu) => ({
          fields: {
            institutionName: edu.institutionName,
            degreeType: edu.degreeType,
            fieldOfStudy: edu.fieldOfStudy,
            concentration: edu.concentration,
            graduationDate: edu.graduationDate,
            gpa: edu.gpa,
            Application_Data: [applicationDataId],
          },
        }))
      );

      educationIds = educationRecords.map((rec) => rec.id);
    }

    // DELETE existing Experience linked to this application
    const existingExperience = await base("Experience")
      .select({
        filterByFormula: `{application_data} = '${applicationId}'`,
      })
      .all();

    if (existingExperience.length > 0) {
      await base("Experience").destroy(existingExperience.map((rec) => rec.id));
    }

    // CREATE Experience (fresh)
    let experienceIds = [];

    if (experienceContainer.length > 0) {
      const experienceRecords = await base("Experience").create(
        experienceContainer.map((exp) => ({
          fields: {
            companyName: exp.companyName,
            jobTitle: exp.jobTitle,
            startDate: exp.startDate,
            endDate: exp.endDate,
            responsibilitiesAchievements: exp.responsibilitiesAchievements,
            Application_Data: [applicationDataId],
          },
        }))
      );

      experienceIds = experienceRecords.map((rec) => rec.id);
    }

    return res.json({
      message: "Application saved successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
