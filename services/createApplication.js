const airtableConfig = require("../config/airtable.config");
const {
  DECISION_PRICES,
  PAYMENT_STATUS,
  APPLICATION_STATUS,
} = require("../utils/constants.util");

class CreateApplicant {
  constructor() {
    this.base = airtableConfig.getBase();
  }

  async createApplicantFun(
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
    uploadArea
  ) {
    const existingRecords = await this.base("Application_Data")
      .select({
        filterByFormula: `AND({applicationId} = "${applicationId}"`,
        maxRecords: 1,
      })
      .firstPage();
    console.log("existingRecords =====", existingRecords);
    let record;
    if (existingRecords.length > 0) {
      // Update existing record (don't update timestamp - it's computed)
      record = await this.base("Application_Data").update([
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
          },
        },
      ]);
      record = record[0];
    } else {
      // Create new record (don't set timestamp - it's computed)
      record = await this.base("Application_Data").create({
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
      });
    }
  }
}

module.exports = new CreateApplicant();
