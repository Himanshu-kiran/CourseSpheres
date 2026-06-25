import prisma from '../lib/prisma.js';
import { getCourseProgress } from '../services/progressService.js';
import { generateCertificate } from '../services/certificateService.js';

export const getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const certificate = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (certificate) {
      return res.json(certificate);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { isCertificateReady: true }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isCertificateReady) {
      return res.status(400).json({ message: 'Certificates are not yet available for this course.' });
    }

    const progress = await getCourseProgress(userId, courseId);
    if (progress.percentage < 100) {
      return res.status(400).json({ message: 'You must complete 100% course to get a certificate.' });
    }

    const newCertificate = await generateCertificate(userId, courseId);
    res.json(newCertificate);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
