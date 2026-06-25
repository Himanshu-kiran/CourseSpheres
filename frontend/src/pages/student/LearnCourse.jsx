import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import VideoPlayer from '../../components/VideoPlayer';
import { ArrowLeft, CheckCircle, PlayCircle, Menu, X, Award } from 'lucide-react';

const LearnCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLecture, setActiveLecture] = useState(null);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [certError, setCertError] = useState(null);

  // Polling removed. Certificate is now generated strictly on-demand via user click.
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/progress/${courseId}`)
        ]);

        const fetchedCourse = courseRes.data;
        setCourse(fetchedCourse);
        setCompletedLectures(progressRes.data.completedLectures || []);

        // Find first unfinished lecture or default to first lecture
        let firstUnfinished = null;
        for (const section of fetchedCourse.sections) {
          for (const lecture of section.lectures) {
            if (!progressRes.data.completedLectures?.includes(lecture.id)) {
              firstUnfinished = lecture;
              break;
            }
          }
          if (firstUnfinished) break;
        }

        if (firstUnfinished) {
          setActiveLecture(firstUnfinished);
        } else if (fetchedCourse.sections[0]?.lectures[0]) {
          setActiveLecture(fetchedCourse.sections[0].lectures[0]);
        }

        // We removed the automatic certificate check here.
        // The student must explicitly click the "Get Certificate" button.
      } catch (error) {
        console.error('Failed to fetch course details', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [courseId, navigate]);

  const handleVideoEnded = async () => {
    if (!activeLecture || completedLectures.includes(activeLecture.id)) return;

    try {
      const { data } = await api.post(`/progress/${activeLecture.id}`);
      setCompletedLectures([...completedLectures, activeLecture.id]);
      
    } catch (error) {
      console.error('Failed to mark complete', error);
    }
  };

  const handleClaimCertificate = async () => {
    setIsGeneratingCert(true);
    setCertError(null);
    try {
      const { data } = await api.get(`/certificates/${courseId}`);
      setCertificate(data);
    } catch (error) {
      // Show the message from the backend (e.g., "Certificates are not yet available")
      setCertError(error.response?.data?.message || "Failed to get certificate. Please try again later.");
    } finally {
      setIsGeneratingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  let totalLectures = 0;
  course.sections.forEach(s => totalLectures += s.lectures.length);
  const progressPercentage = totalLectures === 0 ? 0 : Math.round((completedLectures.length / totalLectures) * 100);

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-white overflow-hidden h-[calc(100vh-64px)]">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'md:mr-80' : ''}`}>
        <div className="bg-stone-900 text-white p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-stone-400 hover:text-white transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="font-serif font-bold text-lg md:text-xl truncate max-w-md">{course.title}</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-stone-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          {activeLecture ? (
            <>
              <div className="mb-6">
                <VideoPlayer 
                  url={activeLecture.videoUrl} 
                  onEnded={handleVideoEnded}
                />
              </div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">{activeLecture.title}</h2>
                  <p className="text-stone-500 flex items-center">
                    <CheckCircle className={`h-5 w-5 mr-2 ${completedLectures.includes(activeLecture.id) ? 'text-green-500' : 'text-stone-300'}`} />
                    {completedLectures.includes(activeLecture.id) ? 'Completed' : 'Marked complete automatically after watching'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-stone-50 rounded-xl border border-stone-200">
              <h2 className="text-xl font-medium text-stone-600">Select a lecture from the sidebar to begin</h2>
            </div>
          )}

          {progressPercentage === 100 && (
            <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <Award className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Congratulations!</h3>
              <p className="text-stone-700 mb-6">You've successfully completed 100% of the course.</p>
              
              {certificate ? (
                // They have it! Show the link.
                <a 
                  href={certificate.cloudinaryUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  <Award className="h-5 w-5" />
                  <span>View Certificate</span>
                </a>
              ) : (
                // They don't have it yet. Show the claim button.
                <div className="flex flex-col items-center">
                  <button 
                    onClick={handleClaimCertificate}
                    disabled={isGeneratingCert}
                    className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGeneratingCert ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Award className="h-5 w-5" />
                    )}
                    <span>{isGeneratingCert ? 'Generating...' : 'Get Certificate'}</span>
                  </button>
                  
                  {/* Show error if the course isn't ready or generation fails */}
                  {certError && (
                    <p className="mt-4 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200 text-sm">
                      {certError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-stone-50 border-l border-stone-200 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-20 flex flex-col md:top-16`}>
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-bold text-stone-900">Course Content</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-full bg-stone-200 rounded-full h-1.5 w-24">
                <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <span className="text-xs text-stone-500 font-medium">{progressPercentage}%</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-stone-500 hover:text-stone-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {course.sections.map((section, sIdx) => (
            <div key={section.id} className="border-b border-stone-200">
              <div className="px-4 py-3 bg-stone-100/50">
                <h4 className="font-bold text-sm text-stone-900">Section {sIdx + 1}: {section.title}</h4>
              </div>
              <div>
                {section.lectures.map((lecture, lIdx) => {
                  const isCompleted = completedLectures.includes(lecture.id);
                  const isActive = activeLecture?.id === lecture.id;
                  return (
                    <button
                      key={lecture.id}
                      onClick={() => {
                        setActiveLecture(lecture);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 flex items-start space-x-3 transition-colors ${isActive ? 'bg-amber-50 border-l-4 border-amber-600' : 'hover:bg-stone-100 border-l-4 border-transparent'}`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <PlayCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                      )}
                      <div>
                        <p className={`text-sm ${isActive ? 'font-medium text-amber-900' : 'text-stone-700'}`}>
                          {lIdx + 1}. {lecture.title}
                        </p>
                        <p className="text-xs text-stone-500 mt-1">
                          {Math.floor(lecture.duration/60)}:{(lecture.duration%60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnCourse;