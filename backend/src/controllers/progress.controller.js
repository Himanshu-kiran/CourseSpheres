import { updateProgress, getCourseProgress } from '../services/progressService.js';

export const markLectureComplete = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.user.id;

    const progress = await updateProgress(userId, lectureId);
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await getCourseProgress(userId, courseId);
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
