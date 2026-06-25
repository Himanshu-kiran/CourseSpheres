import prisma from '../lib/prisma.js';

export const createSection = async (req, res) => {
  const { courseId, title } = req.body;
  try {

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    //finding section with highest  order with "findFirst" 
    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });
    //if not found then default to 1
    const order = lastSection ? lastSection.order + 1 : 1;

    const section = await prisma.section.create({
      data: { courseId, title, order }
    });
    res.status(201).json(section);

  } catch (error) {
    // P2025 means "record not found" error
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Section order conflict, please retry.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSection = async (req, res) => {
  try {
    const section = await prisma.section.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(section);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Section not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSection = async (req, res) => {
  try {
    await prisma.section.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Section deleted' });
  } catch (error) {
    //  P2025 means "record not found" error
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Section not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
