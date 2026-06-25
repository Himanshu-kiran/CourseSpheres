import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary credentials are missing from environment variables.');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

export const getUploadSignature = (req, res) => {
  try {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const folder = 'coursesphere';

    const signature = cloudinary.utils.api_sign_request({
      timestamp,
      folder
    }, CLOUDINARY_API_SECRET);

    res.json({
      signature,
      timestamp,
      folder,
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating upload signature' });
  }
};
