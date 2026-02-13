const multer = require('multer');
const cloudinaryConfig = require('../config/cloudinary.config');
const { createErrorResponse } = require('../utils/response.util');

class FileUploadMiddleware {
  constructor() {
    this.cloudinaryConfig = cloudinaryConfig;
  }

  getMiddleware() {
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1
      },
      fileFilter: (req, file, cb) => {
        if (!this.cloudinaryConfig.isValidFileType(file.mimetype)) {
          const error = new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.');
          error.code = 'INVALID_FILE_TYPE';
          return cb(error, false);
        }
        cb(null, true);
      }
    });

    return upload.single('file');
  }

  getUploadMiddleware() {
    const upload = this.getMiddleware();
    
    return (req, res, next) => {
      upload(req, res, async (error) => {
        if (error) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json(createErrorResponse('File size exceeds 10MB limit.'));
          } else if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json(createErrorResponse('Too many files uploaded. Only one file allowed.'));
          } else if (error.code === 'INVALID_FILE_TYPE') {
            return res.status(400).json(createErrorResponse('Invalid file type. Only JPG, PNG, and PDF files are allowed.'));
          } else {
            return res.status(400).json(createErrorResponse('File upload failed: ' + error.message));
          }
        }
        
        if (req.file) {
          try {
            const resourceType = 'auto';
            const applicationId = req.body && req.body.applicationId ? req.body.applicationId : '';
            
            const result = await this.cloudinaryConfig.uploadFile(req.file.buffer, 'swiss-finance-applications', resourceType, req.file.originalname, applicationId);
            
            req.cloudinaryFile = {
              url: result.secure_url,
              publicId: result.public_id,
              originalName: req.file.originalname,
              mimetype: req.file.mimetype,
              size: req.file.size
            };
            
            next();
          } catch (cloudinaryError) {
            return res.status(500).json(createErrorResponse('Cloudinary upload failed. Please try again.', 500));
          }
        } else {
          return res.status(400).json(createErrorResponse('No file uploaded'));
        }
      });
    };
  }
}

module.exports = new FileUploadMiddleware();
