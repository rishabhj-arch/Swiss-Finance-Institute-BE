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
        filterByFormula: `FIND('${applicantRecordId}', ARRAYJOIN({applicationId}))`,
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

    // Find Applicant by applicationId
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

    // Create Application_Data record
    const applicationData = await base("Application_Data").create({
      ...restFields,
      applicationId: [applicantRecordId],
    });

    const applicationDataId = applicationData.id;

    // Create Education records (multiple)
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
            applicationData: [applicationDataId], // link back
          },
        }))
      );

      educationIds = educationRecords.map((rec) => rec.id);
    }

    // Create Experience records (multiple)
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
            applicationData: [applicationDataId], // link back
          },
        }))
      );

      experienceIds = experienceRecords.map((rec) => rec.id);
    }

    // Update Application_Data to store linked education & experience
    await base("Application_Data").update(applicationDataId, {
      educationContainer: educationIds,
      experienceContainer: experienceIds,
    });

    return res.json({
      message: "Application created successfully",
      data: applicationData,
    });
  } catch (error) {
    console.error("Error in createApplication:", error);

    return res.status(500).json({ error: error.message });
  }
};
