import prisma from '../lib/prisma.js';

export const getEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: {
                lectures: {
                  orderBy: { order: 'asc' },
                  select: { id: true }
                }
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    const enriched = await Promise.all(
      enrollments.map(async (enrollment) => {
        const allLectureIds = enrollment.course.sections.flatMap(s =>
          s.lectures.map(l => l.id)
        );

        const totalLectures = allLectureIds.length;

        const completedCount = await prisma.progress.count({
          where: { userId, lectureId: { in: allLectureIds } }
        });

        const percentage = totalLectures === 0
          ? 0
          : Math.round((completedCount / totalLectures) * 100);

        return {
          id: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          progress: percentage,
          course: {
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            thumbnailUrl: enrollment.course.thumbnailUrl,
            price: enrollment.course.price
          }
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
