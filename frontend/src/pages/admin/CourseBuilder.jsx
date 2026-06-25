import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ArrowLeft, Plus, Save, Video, Loader2, Trash2, X } from 'lucide-react';
import VideoUpload from '../../components/VideoUpload';

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Course details form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // New section form
  const [newSectionTitle, setNewSectionTitle] = useState('');
  
  // New lecture form
  const [activeSectionForLecture, setActiveSectionForLecture] = useState(null);
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureVideo, setNewLectureVideo] = useState(null);

  const fetchCourse = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setCourse(data);
      setTitle(data.title);
      setDescription(data.description);
      setPrice(data.price);
      setThumbnailUrl(data.thumbnailUrl || '');
      setIsPublished(data.isPublished);
    } catch (error) {
      console.error('Failed to fetch course', error);
      alert('Course not found');
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleSaveCourseDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const { data } = await api.put(`/courses/${courseId}`, {
        title,
        description,
        price: Number(price),
        thumbnailUrl: thumbnailUrl || undefined,
        isPublished,
      });
      setCourse(data);
      setSaveMsg('Saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (error) {
      console.error('Failed to save course', error);
      setSaveMsg('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle) return;

    try {
      await api.post('/sections', { courseId, title: newSectionTitle });
      setNewSectionTitle('');
      fetchCourse();
    } catch (error) {
      console.error('Failed to add section', error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section and all its lectures?')) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      fetchCourse();
    } catch (error) {
      console.error('Failed to delete section', error);
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!newLectureTitle || !newLectureVideo) return;

    try {
      await api.post('/lectures', {
        sectionId: activeSectionForLecture,
        title: newLectureTitle,
        videoUrl: newLectureVideo.url,
        duration: newLectureVideo.duration
      });
      setNewLectureTitle('');
      setNewLectureVideo(null);
      setActiveSectionForLecture(null);
      fetchCourse();
    } catch (error) {
      console.error('Failed to add lecture', error);
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm('Delete this lecture?')) return;
    try {
      await api.delete(`/lectures/${lectureId}`);
      fetchCourse();
    } catch (error) {
      console.error('Failed to delete lecture', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <button 
          onClick={() => navigate('/admin/courses')}
          className="flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to courses
        </button>
        <h1 className="text-3xl font-serif font-bold text-stone-900">Course Builder</h1>
        <p className="text-stone-500 mt-2">Editing: {course.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Sections & Lectures */}
        <div className="lg:col-span-2 space-y-6">
          {course.sections.map((section, index) => (
            <div key={section.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-stone-900">Section {index + 1}: {section.title}</h3>
                <button 
                  onClick={() => handleDeleteSection(section.id)}
                  className="text-stone-400 hover:text-red-500 transition-colors"
                  title="Delete Section"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {section.lectures.map((lecture) => (
                    <div key={lecture.id} className="flex items-center justify-between p-3 border border-stone-200 rounded-lg bg-stone-50">
                      <div className="flex items-center space-x-3">
                        <Video className="h-5 w-5 text-stone-400" />
                        <span className="font-medium text-stone-700">{lecture.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-stone-500">{Math.floor(lecture.duration/60)}:{(lecture.duration%60).toString().padStart(2, '0')}</span>
                        <button
                          onClick={() => handleDeleteLecture(lecture.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors"
                          title="Delete Lecture"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {section.lectures.length === 0 && (
                    <p className="text-sm text-stone-500 italic text-center py-4">No lectures yet</p>
                  )}
                </div>

                {activeSectionForLecture === section.id ? (
                  <form onSubmit={handleAddLecture} className="bg-stone-50 p-4 border border-stone-200 rounded-lg">
                    <h4 className="font-medium text-stone-900 mb-4">Add New Lecture</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Lecture Title</label>
                        <input
                          type="text"
                          required
                          value={newLectureTitle}
                          onChange={(e) => setNewLectureTitle(e.target.value)}
                          className="block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Video File</label>
                        {newLectureVideo ? (
                          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm flex items-center">
                            Video ready. Duration: {Math.floor(newLectureVideo.duration/60)}:{(newLectureVideo.duration%60).toString().padStart(2, '0')}
                          </div>
                        ) : (
                          <VideoUpload onUploadSuccess={setNewLectureVideo} />
                        )}
                      </div>
                      <div className="flex space-x-3 pt-2">
                        <button
                          type="submit"
                          disabled={!newLectureTitle || !newLectureVideo}
                          className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 disabled:opacity-50"
                        >
                          Save Lecture
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSectionForLecture(null)}
                          className="flex-1 bg-white text-stone-700 border border-stone-300 px-4 py-2 rounded-md hover:bg-stone-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setActiveSectionForLecture(section.id)}
                    className="flex items-center text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Lecture
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Section Form */}
          <div className="bg-white border border-stone-200 border-dashed rounded-xl p-6 text-center">
            <form onSubmit={handleAddSection} className="max-w-md mx-auto">
              <h3 className="font-medium text-stone-900 mb-4">Add New Section</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Introduction"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-1 rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-4 py-2 border"
                />
                <button
                  type="submit"
                  disabled={!newSectionTitle}
                  className="bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column — Course Settings (Editable) */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSaveCourseDetails} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 sticky top-8">
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-6">Course Settings</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="block w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="block w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min={0}
                  required
                  className="block w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="block w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm px-3 py-2 border"
                />
                {thumbnailUrl && (
                  <img src={thumbnailUrl} alt="Thumb preview" className="mt-2 rounded-lg w-full h-32 object-cover border border-stone-200" />
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="isPublished"
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-stone-700">
                  Published
                </label>
                <span className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isPublished ? 'Live' : 'Draft'}
                </span>
              </div>

              <div className="pt-4 border-t border-stone-200 space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex justify-center items-center rounded-lg border border-transparent bg-amber-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                >
                  {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                </button>
                {saveMsg && (
                  <p className={`text-sm text-center ${saveMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                    {saveMsg}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;
