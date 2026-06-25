import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Trophy, Clock, PlayCircle, Search } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
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

  const completedCount = enrollments.filter(e => e.progress === 100).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-stone-900">Welcome back, {user.name}!</h1>
        <p className="mt-2 text-sm text-stone-500">Pick up where you left off and keep learning.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-stone-500">Enrolled Courses</p>
              <p className="text-3xl font-semibold text-stone-900">{enrollments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-stone-500">Completed</p>
              <p className="text-3xl font-semibold text-stone-900">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Clock className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-stone-500">In Progress</p>
              <p className="text-3xl font-semibold text-stone-900">{enrollments.length - completedCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-stone-900">Continue Learning</h2>
          <Link to="/my-courses" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
            View All My Courses
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.slice(0, 3).map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <img 
                  src={enrollment.course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                  alt={enrollment.course.title} 
                  className="w-full h-40 object-cover"
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-stone-900 mb-3 line-clamp-2">{enrollment.course.title}</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1 text-stone-500">
                      <span>Progress</span>
                      <span>{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div className="bg-amber-600 h-2 rounded-full transition-all" style={{ width: `${enrollment.progress}%` }}></div>
                    </div>
                  </div>
                  <Link 
                    to={`/learn/${enrollment.course.id}`}
                    className="mt-auto w-full flex justify-center items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>{enrollment.progress > 0 ? 'Continue' : 'Start'} Course</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 p-12 text-center">
            <PlayCircle className="mx-auto h-12 w-12 text-stone-400 mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">No courses yet</h3>
            <p className="text-stone-500 mb-6">You haven't enrolled in any courses yet.</p>
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
            >
              <Search className="h-4 w-4 mr-1" />
              <span>Explore Courses</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
