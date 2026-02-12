const Airtable = require('airtable');
const config = require('./env.config');

class AirtableConfig {
  constructor() {
    if (!config.AIRTABLE_API_KEY || !config.AIRTABLE_BASE_ID) {
      throw new Error('Airtable API key and Base ID are required');
    }
    
    this.base = new Airtable({
      apiKey: config.AIRTABLE_API_KEY
    }).base(config.AIRTABLE_BASE_ID);
  }

  getBase() {
    return this.base;
  }
}

module.exports = new AirtableConfig();
