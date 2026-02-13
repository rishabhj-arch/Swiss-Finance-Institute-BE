const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

class CloudinaryConfig {
  constructor() {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Missing required Cloudinary environment variables');
    }
  }

  getCloudinary() {
    return cloudinary;
  }

  async uploadFile(fileBuffer, folder = 'swiss-finance-applications', resourceType = 'auto', originalFilename = 'file', applicationId = '') {
    try {
      const uniqueFilename = applicationId ? `${applicationId}_${originalFilename}` : originalFilename;
      
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: folder,
            max_file_size: 10485760,
            use_filename: true,
            unique_filename: false,
            filename_override: uniqueFilename,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  extractPublicId(url) {
    if (!url) return null;
    const matches = url.match(/\/([^\/]+)\.([^\/]+)$/);
    return matches ? matches[1] : null;
  }

  isValidFileType(mimetype) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    return allowedTypes.includes(mimetype);
  }

  isValidFileSize(size) {
    const maxSize = 10 * 1024 * 1024;
    return size <= maxSize;
  }
}

module.exports = new CloudinaryConfig();
