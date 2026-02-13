const { createSuccessResponse, createErrorResponse } = require('../utils/response.util');
const airtableService = require('../services/airtable.service');

class FileUploadController {
  constructor() {
    this.airtableService = airtableService;
  }

  // Single endpoint that handles both upload and replace automatically
  async uploadFile(req, res) {
    try {
      console.log('🎯 File upload controller started');
      console.log('Request body:', req.body);
      console.log('Cloudinary file:', req.cloudinaryFile);
      
      // Validate payload
      if (!req.body || !req.body.applicationId || !req.body.fieldName) {
        console.log('❌ Validation failed: missing applicationId or fieldName');
        return res.status(400).json(createErrorResponse('Application ID and field name are required'));
      }

      const { applicationId, fieldName } = req.body;
      const cloudinaryFile = req.cloudinaryFile;

      if (!cloudinaryFile) {
        console.log('❌ No cloudinaryFile found in request');
        return res.status(400).json(createErrorResponse('File upload failed'));
      }

      console.log('🔍 Checking for existing file...');
      // Check if file already exists for this applicationId and fieldName
      const existingRecords = await this.airtableService.getApplicationData(applicationId);
      console.log('Found records:', existingRecords.length);
      
      const existingField = existingRecords.find(record => 
        record.fields['Application ID'] === applicationId && 
        record.fields['Field Name'] === fieldName
      );

      let wasReplaced = false;
      let finalUrl = cloudinaryFile.url;

      // If file exists for same applicationId and fieldName, replace it
      if (existingField && existingField.fields['Field Value']) {
        const oldValue = existingField.fields['Field Value'];
        console.log('🗑️ Existing file found for same applicationId and fieldName:', oldValue);
        
        if (oldValue && oldValue.includes('cloudinary.com')) {
          // Extract public ID from old URL and delete from Cloudinary
          const cloudinaryConfig = require('../config/cloudinary.config');
          const oldPublicId = cloudinaryConfig.extractPublicId(oldValue);
          
          if (oldPublicId) {
            try {
              await cloudinaryConfig.deleteFile(oldPublicId);
              console.log(`✅ Deleted old file from Cloudinary: ${oldPublicId}`);
              wasReplaced = true;
            } catch (deleteError) {
              console.warn('⚠️ Failed to delete old file from Cloudinary:', deleteError);
              // Continue with upload even if delete fails
            }
          }
        }
      } else {
        console.log('➕ No existing file found, creating new');
      }

      console.log('💾 Saving new file to Airtable...');
      // Save or update file URL in application field
      const result = await this.airtableService.saveApplicationField(
        applicationId,
        'documents', // All uploaded files go to documents section
        fieldName,
        finalUrl
      );

      console.log('✅ File saved to Airtable:', result.id);

      const message = wasReplaced ? 'File replaced successfully' : 'File uploaded successfully';

      res.json(createSuccessResponse({
        id: result.id,
        applicationId: result.fields['Application ID'],
        fieldName: result.fields['Field Name'],
        fileUrl: finalUrl,
        originalName: cloudinaryFile.originalName,
        mimetype: cloudinaryFile.mimetype,
        size: cloudinaryFile.size,
        replaced: wasReplaced,
        duplicate: false
      }, message));
    } catch (error) {
      console.error('💥 Error in uploadFile:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      return res.status(500).json(createErrorResponse('File upload failed. Please try again.', 500));
    }
  }
}

module.exports = new FileUploadController();
