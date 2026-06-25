import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, Clock, Loader2, CheckCircle } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);
      } catch (error) {
        console.error('Failed to fetch course', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      const { data } = await api.post('/payment/checkout', { courseId: id });
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout failed', error);
      alert(error.response?.data?.message || 'Failed to initiate checkout');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-xl font-medium text-stone-600">Course not found</div>;
  }

  let totalLectures = 0;
  course.sections.forEach(s => totalLectures += s.lectures.length);

  return (
    <div className="flex-1 bg-stone-50">
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-stone-300 mb-8 max-w-3xl">
                {course.description}
              </p>
              <div className="flex items-center space-x-6 text-sm text-stone-400">
                <div className="flex items-center space-x-2">
                  <PlayCircle className="h-5 w-5" />
                  <span>{totalLectures} lectures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Self-paced</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-stone-200 sticky top-8 text-stone-900">
                <img 
                  src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-3xl font-bold text-amber-600 mb-6">
                    ₹{course.price}
                  </div>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || user?.role === 'ADMIN'}
                    className="w-full flex justify-center items-center rounded-lg border border-transparent bg-amber-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                  >
                    {enrolling ? <Loader2 className="animate-spin h-5 w-5" /> : (user?.role === 'ADMIN' ? 'Admin Cannot Enroll' : 'Enroll Now')}
                  </button>
                  <p className="mt-4 text-xs text-center text-stone-500">
                    30-day money-back guarantee. Secure payment via Stripe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Course Content</h2>
          <div className="space-y-4">
            {course.sections.map((section, index) => (
              <div key={section.id} className="border border-stone-200 rounded-lg bg-white overflow-hidden">
                <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-stone-900">Section {index + 1}: {section.title}</h3>
                  <span className="text-sm text-stone-500">{section.lectures.length} lectures</span>
                </div>
                <div className="divide-y divide-stone-100">
                  {section.lectures.map((lecture, lIndex) => (
                    <div key={lecture.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        {lecture.isFree ? (
                          <PlayCircle className="h-5 w-5 text-amber-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-stone-300" />
                        )}
                        <span className={`text-sm ${lecture.isFree ? 'font-medium text-amber-700' : 'text-stone-700'}`}>
                          {index + 1}.{lIndex + 1} {lecture.title}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500">
                        {lecture.isFree && <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs mr-2 font-medium">Preview</span>}
                        {Math.floor(lecture.duration / 60)}:{(lecture.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                  {section.lectures.length === 0 && (
                    <div className="px-6 py-4 text-sm text-stone-500 italic">No lectures in this section yet.</div>
                  )}
                </div>
              </div>
            ))}
            {course.sections.length === 0 && (
              <div className="text-stone-500 italic">Course content is currently being updated.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
