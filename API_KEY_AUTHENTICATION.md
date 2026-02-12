# API Key Authentication Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication Method

All application-related endpoints now require **API Key** authentication using the `x-api-key` header.

## API Key Configuration

The API key is configured in your `.env` file:
```env
NODE_API_KEY=d83f9c91bafc4a1f9e8b2d3e1c6a4f12
```

## Protected Endpoints

All application endpoints require API key authentication:

### How to Use:

1. **Add API Key to Header:**
```bash
curl -X GET http://localhost:3000/api/get-application/john.doe@example.com \
  -H "Content-Type: application/json" \
  -H "x-api-key: d83f9c91bafc4a1f9e8b2d3e1c6a4f12"
```

2. **Save Application Data:**
```bash
curl -X POST http://localhost:3000/api/save-field \
  -H "Content-Type: application/json" \
  -H "x-api-key: d83f9c91bafc4a1f9e8b2d3e1c6a4f12" \
  -d '{"applicationId":"app-123","section":"biographical","fieldName":"firstName","fieldValue":"John"}'
```

3. **Create Payment Intent:**
```bash
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "x-api-key: d83f9c91bafc4a1f9e8b2d3e1c6a4f12" \
  -d '{"applicationId":"app-123","decisionType":"Full"}'
```

## Wix Integration Example

Your Wix code will work perfectly with this API:

```javascript
import { fetch } from 'wix-fetch';
import { getSecret } from 'wix-secrets-backend';

export async function submitFormToNode(formData) {
  const apiKey = await getSecret('NODE_API_KEY'); // Gets: d83f9c91bafc4a1f9e8b2d3e1c6a4f12
  
  const response = await fetch('http://localhost:3000/api/save-field', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey, // This will be validated
    },
    body: JSON.stringify({ formData }),
  });
  
  if (!response.ok) {
    throw new Error('Node API failed');
  }
  return response.json();
}
```

## Security Features

- ✅ **API Key Authentication**: Simple key-based authentication
- ✅ **Header Validation**: Checks `x-api-key` header
- ✅ **Environment Security**: Key stored in environment variables
- ✅ **Error Handling**: Clear error messages for invalid keys
- ✅ **No Session**: Stateless authentication

## Error Responses

- `401` - API key required
- `403` - Invalid API key
- `500` - Server configuration error

## API Structure

**Public Endpoints (No Auth Required):**
- `POST /api/applicants` - Create applicant
- `GET /api/applicants/:email` - Get applicant
- `PUT /api/applicants/:email` - Update applicant

**Protected Endpoints (API Key Required):**
- `GET /api/get-application/:email` - Get application data
- `POST /api/save-field` - Save application field
- `POST /api/create-payment-intent` - Create payment intent
- `POST /api/submit-application` - Submit application
- `POST /api/test-confirm-payment` - Test payment confirmation

## Middleware Flow

1. **Extract API Key**: Gets `x-api-key` from request header
2. **Validate Key**: Compares with `NODE_API_KEY` from environment
3. **Grant Access**: If valid, allows request to proceed
4. **Error Response**: If invalid, returns 403 Forbidden

## File Structure

```
middleware/
├── apikey.middleware.js      # API key verification
├── cors.middleware.js         # CORS handling
└── error.middleware.js         # Error handling

controllers/
└── application.controller.js  # Protected endpoints

routes/
└── application.routes.js    # API key protected routes

utils/
└── response.util.js         # API responses
```
