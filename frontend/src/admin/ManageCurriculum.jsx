import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";
import AdminDashboardSidebar from "../components/AdminDashboardSidebar";

function ManageCurriculum() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Forms state
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [lectureForm, setLectureForm] = useState({ title: "", videoFile: null, isFree: false });
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  const fetchCurriculum = async () => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin"));
      const response = await axios.get(`${BACKEND_URL}/lecture/curriculum/${courseId}`, {
        headers: { Authorization: `Bearer ${admin?.token}` },
        withCredentials: true
      });
      setSections(response.data.sections || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load curriculum");
      setLoading(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle) return;

    try {
      const admin = JSON.parse(localStorage.getItem("admin"));
      await axios.post(`${BACKEND_URL}/lecture/section`, {
        courseId,
        title: newSectionTitle,
        order: sections.length
      }, {
        headers: { Authorization: `Bearer ${admin?.token}` },
        withCredentials: true
      });
      toast.success("Section added!");
      setNewSectionTitle("");
      fetchCurriculum();
    } catch (error) {
      toast.error("Failed to add section");
    }
  };

  const handleVideoUpload = async (file) => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin"));
      // 1. Get signature from our backend
      const sigRes = await axios.get(`${BACKEND_URL}/course/upload-signature`, {
        headers: { Authorization: `Bearer ${admin?.token}` },
        withCredentials: true
      });
      const { signature, timestamp, cloudName, apiKey } = sigRes.data;

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", "coursesphere_lectures");

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        formData
      );

      return uploadRes.data.secure_url;
    } catch (error) {
      console.error("Video upload error:", error);
      throw error;
    }
  };

  const handleAddLecture = async (e, sectionId, currentLecturesCount) => {
    e.preventDefault();
    if (!lectureForm.title || !lectureForm.videoFile) {
      toast.error("Please provide title and video");
      return;
    }

    setUploadingVideo(true);
    toast.loading("Uploading video...", { id: "upload" });

    try {
      // Direct Cloudinary Upload
      const videoUrl = await handleVideoUpload(lectureForm.videoFile);

      // Save to database
      const admin = JSON.parse(localStorage.getItem("admin"));
      await axios.post(`${BACKEND_URL}/lecture/lecture`, {
        sectionId,
        title: lectureForm.title,
        videoUrl,
        order: currentLecturesCount,
        isFree: lectureForm.isFree
      }, {
        headers: { Authorization: `Bearer ${admin?.token}` },
        withCredentials: true
      });

      toast.success("Lecture added successfully!", { id: "upload" });
      setLectureForm({ title: "", videoFile: null, isFree: false });
      setActiveSectionId(null);
      fetchCurriculum();
    } catch (error) {
      toast.error("Failed to add lecture", { id: "upload" });
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminDashboardSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Manage Curriculum</h1>
            <button onClick={() => navigate("/admin/our-courses")} className="text-blue-600 hover:underline">
              Back to Courses
            </button>
          </div>

          {/* Add Section Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Section</h2>
            <form onSubmit={handleAddSection} className="flex gap-4">
              <input
                type="text"
                placeholder="Section Title (e.g., Introduction)"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Add Section
              </button>
            </form>
          </div>

          {/* Curriculum List */}
          {loading ? (
            <p className="text-center text-gray-500">Loading curriculum...</p>
          ) : sections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">No sections yet. Start by adding one above.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Section {section.order + 1}: {section.title}</h3>
                    <button 
                      onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition"
                    >
                      {activeSectionId === section.id ? "Cancel" : "+ Add Lecture"}
                    </button>
                  </div>

                  {/* Add Lecture Form */}
                  {activeSectionId === section.id && (
                    <div className="p-6 bg-blue-50 border-b border-blue-100">
                      <form onSubmit={(e) => handleAddLecture(e, section.id, section.lectures.length)} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Title</label>
                          <input
                            type="text"
                            value={lectureForm.title}
                            onChange={(e) => setLectureForm({...lectureForm, title: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                            disabled={uploadingVideo}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setLectureForm({...lectureForm, videoFile: e.target.files[0]})}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            required
                            disabled={uploadingVideo}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`free-${section.id}`}
                            checked={lectureForm.isFree}
                            onChange={(e) => setLectureForm({...lectureForm, isFree: e.target.checked})}
                            disabled={uploadingVideo}
                          />
                          <label htmlFor={`free-${section.id}`} className="text-sm text-gray-700">Preview Available (Free)</label>
                        </div>
                        <button 
                          type="submit" 
                          disabled={uploadingVideo}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                        >
                          {uploadingVideo ? "Uploading..." : "Save Lecture"}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Lectures List */}
                  <div className="p-0">
                    {section.lectures.length === 0 ? (
                      <p className="px-6 py-4 text-sm text-gray-500 italic">No lectures in this section.</p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {section.lectures.map((lecture, idx) => (
                          <li key={lecture.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 font-mono text-sm">{idx + 1}.</span>
                              <span className="font-medium text-gray-800">{lecture.title}</span>
                              {lecture.isFree && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Free Preview</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ManageCurriculum;
