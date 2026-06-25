import prisma from '../lib/prisma.js';

export const updateProgress = async (userId, lectureId) => {
  try {
    // Upsert progress for the lecture
    await prisma.progress.upsert({
      where: { userId_lectureId: { userId, lectureId } },
      update: { completedAt: new Date() },
      create: { userId, lectureId }
    });

    // Get the course for this lecture
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: { section: true }
    });

    if (!lecture) throw new Error('Lecture not found');
    const courseId = lecture.section.courseId;

    // Calculate overall course progress
    const allLectures = await prisma.lecture.findMany({
      where: { section: { courseId } },
      select: { id: true }
    });

    const totalLectures = allLectures.length;

    const completedLecturesCount = await prisma.progress.count({
      where: {
        userId,
        lectureId: { in: allLectures.map(l => l.id) }
      }
    });

    const percentage = totalLectures === 0 ? 0 : Math.round((completedLecturesCount / totalLectures) * 100);

    return { percentage, completedLecturesCount, totalLectures };
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

export const getCourseProgress = async (userId, courseId) => {
  try {
    const allLectures = await prisma.lecture.findMany({
      where: { section: { courseId } },
      select: { id: true }
    });

    const totalLectures = allLectures.length;

    if (totalLectures === 0) return { percentage: 0, completedLectures: [] };

    const completedProgress = await prisma.progress.findMany({
      where: {
        userId,
        lectureId: { in: allLectures.map(l => l.id) }
      },
      select: { lectureId: true }
    });

    const completedLecturesCount = completedProgress.length;
    const percentage = Math.round((completedLecturesCount / totalLectures) * 100);

    return {
      percentage,
      completedLectures: completedProgress.map(p => p.lectureId)
    };
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};
