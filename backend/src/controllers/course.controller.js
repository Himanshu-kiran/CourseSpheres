import prisma from '../lib/prisma.js';

export const getCourses = async (req, res) => {
  const { title, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = { isPublished: true };
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    const courses = await prisma.course.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { lectures: { orderBy: { order: 'asc' } } }
        }
      }
    });

    const total = await prisma.course.count({ where });

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin endpoint: returns all courses (published and draft)
export const getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { lectures: { orderBy: { order: 'asc' } } }
        },
        _count: { select: { enrollments: true } }
      }
    });

    res.json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInstructorStats = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.id },
      include: {
        _count: { select: { enrollments: true } }
      }
    });

    const totalCourses = courses.length;
    let totalStudents = 0;
    let totalRevenue = 0;

    courses.forEach(course => {
      const enrollmentsCount = course._count.enrollments;
      totalStudents += enrollmentsCount;
      totalRevenue += enrollmentsCount * course.price;
    });

    res.json({ totalCourses, totalStudents, totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lectures: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const course = await prisma.course.create({
      data: {
        ...req.body,
        instructorId: req.user.id,
        // Provide a default thumbnail if none given
        thumbnailUrl: req.body.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    });
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    // Verify ownership
    const existingCourse = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!existingCourse) return res.status(404).json({ message: 'Course not found' });
    if (existingCourse.instructorId !== req.user.id) return res.status(403).json({ message: 'Not authorized to edit this course' });

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    // Verify ownership
    const existingCourse = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!existingCourse) return res.status(404).json({ message: 'Course not found' });
    if (existingCourse.instructorId !== req.user.id) return res.status(403).json({ message: 'Not authorized to delete this course' });

    // Soft delete: set isPublished to false
    await prisma.course.update({
      where: { id: req.params.id },
      data: { isPublished: false }
    });
    res.json({ message: 'Course unpublished (soft deleted)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
