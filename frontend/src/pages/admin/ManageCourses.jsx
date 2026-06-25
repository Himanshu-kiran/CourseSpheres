import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      // Use the admin endpoint to get ALL courses (including drafts)
      const { data } = await api.get('/courses/admin/all');
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    try {
      const { data } = await api.post('/courses', {
        title: 'New Course Template',
        description: 'Provide a detailed description for this course here.',
        price: 999,
      });
      // Navigate to course builder for the new course
      window.location.href = `/admin/courses/builder/${data.id}`;
    } catch (error) {
      console.error('Failed to create course', error);
      alert('Error creating course');
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      await api.put(`/courses/${course.id}`, { isPublished: !course.isPublished });
      fetchCourses();
    } catch (error) {
      console.error('Failed to update course', error);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to unpublish this course?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      fetchCourses();
    } catch (error) {
      console.error('Failed to delete course', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Manage Courses</h1>
          <p className="mt-2 text-sm text-stone-500">Create, edit, and publish your courses</p>
        </div>
        <button 
          onClick={handleCreateCourse}
          className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Course</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-md object-cover" src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900">{course.title}</div>
                        <div className="text-sm text-stone-500">{new Date(course.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-stone-900">₹{course.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => handleTogglePublish(course)}
                        className="text-stone-500 hover:text-stone-900"
                        title={course.isPublished ? "Unpublish" : "Publish"}
                      >
                        {course.isPublished ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <Link to={`/admin/courses/builder/${course.id}`} className="text-amber-600 hover:text-amber-900">
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button onClick={() => handleDelete(course.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-stone-500">
                    No courses found. Create your first course!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
