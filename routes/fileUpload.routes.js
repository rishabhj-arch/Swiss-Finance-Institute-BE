const express = require('express');
const fileUploadController = require('../controllers/fileUpload.controller');
const fileUploadMiddleware = require('../middleware/fileUpload.middleware');
const apiKeyMiddleware = require('../middleware/apikey.middleware');

class FileUploadRoutes {
  constructor() {
    this.router = express.Router();
    this.fileUploadController = fileUploadController;
    this.fileUploadMiddleware = fileUploadMiddleware;
    this.apiKeyMiddleware = apiKeyMiddleware;
    this.setupRoutes();
  }

  setupRoutes() {
    // Single endpoint for both upload and replace (with API key)
    this.router.post(
      '/upload',
      this.apiKeyMiddleware.verifyApiKey.bind(this.apiKeyMiddleware),
      this.fileUploadMiddleware.getUploadMiddleware(),
      this.fileUploadController.uploadFile.bind(this.fileUploadController)
    );
  }

  // Helper method to get file info
  async getFileInfo(req, res) {
    try {
      const { applicationId, fieldName } = req.params;

      if (!applicationId || !fieldName) {
        return res.status(400).json(createErrorResponse('Application ID and field name are required'));
      }

      const airtableService = require('../services/airtable.service');
      const applicationData = await airtableService.getApplicationData(applicationId);
      
      const field = applicationData.find(record => 
        record.fields['Application ID'] === applicationId && 
        record.fields['Field Name'] === fieldName
      );

      if (!field) {
        return res.status(404).json(createErrorResponse('File not found'));
      }

      const fieldValue = field.fields['Field Value'];
      const { createSuccessResponse } = require('../utils/response.util');

      // Check if it's a Cloudinary URL
      if (fieldValue && fieldValue.includes('cloudinary.com')) {
        res.json(createSuccessResponse({
          applicationId,
          fieldName,
          fileUrl: fieldValue,
          isCloudinary: true
        }, 'File info retrieved'));
      } else {
        res.json(createSuccessResponse({
          applicationId,
          fieldName,
          fieldValue,
          isCloudinary: false
        }, 'Field info retrieved'));
      }
    } catch (error) {
      console.error('Error getting file info:', error);
      const { createErrorResponse } = require('../utils/response.util');
      return res.status(500).json(createErrorResponse('Failed to retrieve file info', 500));
    }
  }

  getRoutes() {
    return this.router;
  }
}

module.exports = new FileUploadRoutes();
