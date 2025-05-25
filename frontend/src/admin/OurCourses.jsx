import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";
import AdminDashboardSidebar from "../Component/AdminDashboardSidebar";

function OurCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    const token = admin?.token;

    if (!token) {
      toast.error("Please login to admin");
      navigate("/admin/login");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        setCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchCourses:", error);
      }
    };

    fetchCourses();
  }, [navigate]);

  const handleDelete = async (id) => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    const token = admin?.token;

    try {
      const response = await axios.delete(
        `${BACKEND_URL}/course/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(error.response?.data?.errors || "Error deleting course");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminDashboardSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main content */}
      <main className="w-full bg-white p-4 md:p-8">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Our Courses</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                  <img
                    src={course?.image?.url}
                    alt={course.title}
                    className="h-40 w-full object-cover rounded-t-lg"
                  />
                  <h2 className="text-xl font-semibold mt-4 text-gray-800">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 mt-2 text-sm">
                    {course.description.length > 200
                      ? `${course.description.slice(0, 200)}...`
                      : course.description}
                  </p>
                  <div className="flex justify-between mt-4 text-gray-800 font-bold">
                    <div>
                      ₹{course.price}{" "}
                      <span className="line-through text-gray-500">₹300</span>
                    </div>
                    <div className="text-green-600 text-sm mt-2">10% off</div>
                  </div>

                  <div className="flex justify-between">
                    <Link
                      to={`/admin/update-course/${course._id}`}
                      className="bg-orange-500 text-white py-2 px-4 mt-4 rounded hover:bg-blue-600"
                    >
                      Update
                    </Link>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="bg-red-500 text-white py-2 px-4 mt-4 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OurCourses;