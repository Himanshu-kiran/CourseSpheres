import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../lib/prisma.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
  //generating certificate using pdf-lib 
export const generateCertificate = async (userId, courseId) => {
  try {
    // Check if certificate already exists
    const existingCert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    
    if (existingCert) return existingCert;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!user || !course) throw new Error('User or course not found');

    const pdfDoc = await PDFDocument.create();
    // A4 landscape dimensions in points (1 point = 1/72 inch)
    const page = pdfDoc.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();

    const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const bodyFont  = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont  = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const amber = rgb(0.851, 0.467, 0.024); // #d97706
    const dark  = rgb(0.11,  0.098, 0.09);  // #1c1917
    const muted = rgb(0.471, 0.443, 0.424); // #78716c
    const white = rgb(1, 1, 1);

    // White background
    page.drawRectangle({ x: 0, y: 0, width, height, color: white });

    // Outer border
    page.drawRectangle({
      x: 20, y: 20,
      width: width - 40, height: height - 40,
      borderColor: amber, borderWidth: 12
    });

    // Inner border
    page.drawRectangle({
      x: 38, y: 38,
      width: width - 76, height: height - 76,
      borderColor: amber, borderWidth: 2
    });

    // Helper to center text horizontally
    const centerText = (text, font, size, y, color) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
    };

    // Title
    centerText('Certificate of Completion', titleFont, 42, height - 140, amber);

    // Body text
    centerText('This is to certify that', bodyFont, 16, height - 200, dark);

    // Student name
    centerText(user.name, boldFont, 34, height - 255, dark);

    // Underline below name
    page.drawLine({
      start: { x: (width - 300) / 2, y: height - 268 },
      end:   { x: (width + 300) / 2, y: height - 268 },
      thickness: 1, color: amber
    });

    // Course completion line
    centerText('has successfully completed the course', bodyFont, 16, height - 310, dark);

    // Course title (truncate if too long)
    const courseTitle = course.title.length > 55
      ? course.title.substring(0, 52) + '...'
      : course.title;
    centerText(courseTitle, boldFont, 28, height - 365, dark);

    // Issue date
    const dateText = `Issued on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    centerText(dateText, bodyFont, 13, height - 480, muted);

    // Serialize to buffer — same type (Buffer) that Cloudinary upload_stream expects
    const pdfBuffer = Buffer.from(await pdfDoc.save());
    // --- End pdf-lib generation ---

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'image', 
          type: 'upload',
          access_mode: 'public',
          folder: 'coursesphere_certificates', 
          format: 'pdf' 
        },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error', error);
            return reject(error);
          }
          
          try {
            const cert = await prisma.certificate.upsert({
              where: { userId_courseId: { userId, courseId } },
              update: { cloudinaryUrl: result.secure_url },
              create: {
                userId,
                courseId,
                cloudinaryUrl: result.secure_url
              }
            });
            resolve(cert);
          } catch (dbError) {
            reject(dbError);
          }
        }
      );
      
      uploadStream.end(pdfBuffer);
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};