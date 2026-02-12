# Applicants API Documentation

## Overview
This API provides endpoints for managing applicants in the Airtable database with only essential fields.

## Base URL
```
http://localhost:3000/api
```

## Table Structure
The Applicants table stores only these fields:
- **Email** (from payload)
- **Name** (from payload) 
- **Application ID** (from payload)
- **Current Stage** (backend managed, starts at 1, updates dynamically)
- **Created At** (backend managed)

## Endpoints

### 1. Create Applicant (POST)
**Endpoint:** `POST /api/applicants`

**Description:** Creates a new applicant entry in the database.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "applicationId": "app-123456789"
}
```

**OR with data wrapper:**
```json
{
  "data": {
    "email": "john.doe@example.com",
    "name": "John Doe",
    "applicationId": "app-123456789"
  }
}
```

**Required Fields:**
- `email` (string, valid email format)
- `name` (string, non-empty)
- `applicationId` (string, non-empty)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Applicant created successfully",
  "data": {
    "id": "rec123456789",
    "applicationId": "app-123456789",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "currentStage": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Get Applicant by Email (GET)
**Endpoint:** `GET /api/applicants/:email`

**Description:** Retrieves applicant data only if the email exists in the database. **Does not create new entries.**

**URL Parameters:**
- `email` (string) - The email address of the applicant

**Success Response (200):**
```json
{
  "success": true,
  "message": "Applicant retrieved successfully",
  "data": {
    "id": "rec123456789",
    "applicationId": "app-123456789",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "currentStage": 8,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Update Applicant (PUT)
**Endpoint:** `PUT /api/applicants/:email`

**Description:** Updates an existing applicant's information.

**URL Parameters:**
- `email` (string) - The email address of the applicant to update

**Request Body:**
```json
{
  "name": "John Updated",
  "currentStage": 9
}
```

**Optional Fields:**
- `name` (string)
- `currentStage` (number)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Applicant updated successfully",
  "data": {
    "id": "rec123456789",
    "applicationId": "app-123456789",
    "email": "john.doe@example.com",
    "name": "John Updated",
    "currentStage": 9,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Key Features

1. **Minimal Data Storage**: Only stores essential fields (Email, Name, Application ID, Current Stage, Created At)
2. **No Auto-Creation on GET**: The GET endpoint only returns existing data and never creates new entries
3. **Automatic Stage Management**: Backend starts applicants at stage 1 and automatically updates stage based on form sections filled
4. **Email Validation**: All endpoints validate email format
5. **Duplicate Prevention**: POST endpoint prevents creating duplicate applicants
6. **Clean Codebase**: Removed all unused fields and code

## Automatic Stage Mapping

The system automatically updates the applicant's stage based on the section being filled:

| Section Name | Stage |
|--------------|--------|
| biographical | 1 |
| academic | 2 |
| professional | 3 |
| essay_set_1 | 4 |
| essay_set_2 | 5 |
| short_responses | 6 |
| documents | 7 |
| payment | 8 |

When users fill form data in any section, the stage automatically updates to the corresponding number.

## Usage Examples

### Create a new applicant:
```bash
curl -X POST http://localhost:3000/api/applicants \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "applicationId": "app-987654321"
  }'
```

### Get applicant by email:
```bash
curl http://localhost:3000/api/applicants/jane.smith@example.com
```

### Update applicant:
```bash
curl -X PUT http://localhost:3000/api/applicants/jane.smith@example.com \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith Updated"
  }'
```

### Save form data (automatically updates stage):
```bash
curl -X POST http://localhost:3000/api/save-field \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "app-987654321",
    "section": "academic",
    "fieldName": "university",
    "fieldValue": "Harvard University"
  }'
```
*This will automatically update the applicant's stage to 2 (academic section)*

## Error Responses

- `400` - Validation errors or invalid data
- `404` - Applicant not found
- `409` - Applicant with email already exists
- `500` - Internal server error
