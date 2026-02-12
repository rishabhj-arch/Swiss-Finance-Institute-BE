// Decision Type Prices (in cents)
const DECISION_PRICES = {
  'Regular': 50000,   // $500.00
  'Early': 250000,    // $2,500.00
  'Full': 5000000     // $50,000.00
};

// Required Application Sections
const REQUIRED_SECTIONS = [
  'biographical',
  'academic',
  'professional',
  'essay_set_1',
  'essay_set_2',
  'short_responses',
  'documents',
  'payment'
];

// Stage Mapping based on Section Names
const SECTION_STAGE_MAPPING = {
  'biographical': 1,
  'academic': 2,
  'professional': 3,
  'essay_set_1': 4,
  'essay_set_2': 5,
  'short_responses': 6,
  'documents': 7,
  'payment': 8
};

// Payment Status Options
const PAYMENT_STATUS = {
  PENDING: 'Pending',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed'
};

// Application Status Options
const APPLICATION_STATUS = {
  IN_PROGRESS: 'In Progress',
  SUBMITTED_PAID: 'Submitted & Paid'
};

module.exports = {
  DECISION_PRICES,
  REQUIRED_SECTIONS,
  SECTION_STAGE_MAPPING,
  PAYMENT_STATUS,
  APPLICATION_STATUS
};
