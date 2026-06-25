import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { BookOpen, PlayCircle } from 'lucide-react';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const { data } = await api.get('/enrollments');
        setEnrollments(data);
      } catch (error) {
        console.error('Failed to fetch enrollments', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-stone-900">My Learning</h1>
        <p className="mt-2 text-sm text-stone-500">All the courses you've enrolled in.</p>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <img 
                src={enrollment.course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                alt={enrollment.course.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-stone-900 mb-2 line-clamp-2">{enrollment.course.title}</h3>
                <div className="mt-4 mb-6">
                  <div className="flex justify-between text-sm mb-1 text-stone-500">
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full transition-all" style={{ width: `${enrollment.progress}%` }}></div>
                  </div>
                </div>
                <div className="mt-auto">
                  <Link 
                    to={`/learn/${enrollment.course.id}`}
                    className="w-full flex justify-center items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <PlayCircle className="h-5 w-5" />
                    <span>{enrollment.progress === 100 ? 'Review Course' : enrollment.progress > 0 ? 'Continue Course' : 'Start Course'}</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 p-12 text-center max-w-3xl mx-auto">
          <BookOpen className="mx-auto h-12 w-12 text-stone-400 mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No courses yet</h3>
          <p className="text-stone-500 mb-6">You haven't enrolled in any courses. Browse our catalog to start learning.</p>
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors shadow-sm font-medium"
          >
            Explore Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
