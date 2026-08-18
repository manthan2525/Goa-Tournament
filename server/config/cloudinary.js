import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'demo_key' &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== 'demo_secret';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] Configured with remote cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[Cloudinary] Using embedded Base64/DataURI storage engine (Development Mode)');
}

/**
 * Uploads a file buffer either to Cloudinary or falls back to Base64 data URL
 * @param {Buffer} buffer - File buffer from Multer
 * @param {String} mimetype - File mime type
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<String>} - Public image URL
 */
export const uploadImageBuffer = async (buffer, mimetype = 'image/jpeg', folder = 'goa_tournaments') => {
  if (!buffer) return null;

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `goa_tournaments/${folder}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            // Fallback to data URI on error
            const base64Data = buffer.toString('base64');
            resolve(`data:${mimetype};base64,${base64Data}`);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Fast fallback for local dev without requiring cloud API keys
  const base64Data = buffer.toString('base64');
  return `data:${mimetype};base64,${base64Data}`;
};

export default cloudinary;
