require('dotenv').config();

console.log('✅ .env file loaded',process.env.PORT);

const config = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  
  // Airtable Configuration
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // CORS Configuration
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
};

// Validate required environment variables
const requiredEnvVars = [
  'AIRTABLE_API_KEY',
  'AIRTABLE_BASE_ID', 
  'STRIPE_SECRET_KEY',
  // 'STRIPE_WEBHOOK_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !config[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

module.exports = config;
