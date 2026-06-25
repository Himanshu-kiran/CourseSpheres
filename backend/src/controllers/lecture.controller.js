import prisma from '../lib/prisma.js';

export const createLecture = async (req, res) => {
  const { sectionId, title, videoUrl, duration, isFree } = req.body;
  try {
    // verify the section exists before creating a lecture
    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const lastLecture = await prisma.lecture.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' }
    });
    const order = lastLecture ? lastLecture.order + 1 : 1;

    const lecture = await prisma.lecture.create({
      data: { sectionId, title, videoUrl, duration: duration || 0, isFree: isFree || false, order }
    });
    res.status(201).json(lecture);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Lecture order conflict, please retry.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLecture = async (req, res) => {
  try {
    const lecture = await prisma.lecture.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(lecture);
  } catch (error) {
    // P2025 means record not found
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    await prisma.lecture.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Lecture deleted' });
  } catch (error) {
    // P2025- record not found
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
