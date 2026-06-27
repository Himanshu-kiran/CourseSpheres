import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DollarSign, PlusCircle, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/courses/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Instructor Dashboard</h1>
          <p className="mt-2 text-sm text-stone-500">Manage your courses and view analytics</p>
        </div>
        <Link 
          to="/admin/courses" 
          className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <BookOpen className="h-5 w-5" />
          <span>Manage Courses</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-stone-500">Total Courses</p>
              <p className="text-3xl font-semibold text-stone-900">
                {loading ? <Loader2 className="animate-spin h-6 w-6 mt-2 text-stone-400" /> : stats.totalCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-stone-500">Total Students</p>
              <p className="text-3xl font-semibold text-stone-900">
                {loading ? <Loader2 className="animate-spin h-6 w-6 mt-2 text-stone-400" /> : stats.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-stone-500">Total Revenue</p>
              <p className="text-3xl font-semibold text-stone-900">
                {loading ? <Loader2 className="animate-spin h-6 w-6 mt-2 text-stone-400" /> : `₹${stats.totalRevenue}`}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 p-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-stone-400 mb-4" />
        <h3 className="text-lg font-medium text-stone-900 mb-2">Ready to create a new course?</h3>
        <p className="text-stone-500 mb-6">Start building your next masterpiece today.</p>
        <Link 
          to="/admin/courses" 
          className="inline-flex items-center space-x-2 bg-white text-stone-700 border border-stone-300 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors shadow-sm"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Create Course</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
