import React, { useEffect, useState } from "react";
import logo from "../../public/logo.webp";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";

function Home() {
  const [courses, setCourses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // token
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        console.log(response.data.courses);
        setCourses(response.data.courses);
      } catch (error) {
        console.log("error in fetchCourses ", error);
      }
    };
    fetchCourses();
  }, []);

  // logout
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("user");
      setIsLoggedIn(false);
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response.data.errors || "Error in logging out");
    }
  };

  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="bg-gradient-to-r from-black to-blue-950 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="CourseSphere Logo"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full"
            />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              CourseSphere
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-transparent text-white px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to={"/login"}
                  className="bg-transparent text-white px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to={"/signup"}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center py-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Welcome to <span className="text-orange-500">CourseSphere</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Sharpen your skills with courses crafted by industry experts. 
            Join thousands of learners worldwide.
          </p>
          
          <Link
            to={"/courses"}
            className="inline-block bg-green-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-green-600 transition-all duration-300"
          >
            Explore Courses
          </Link>
        </section>

        {/* Courses Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Featured Courses
            </h2>
            <p className="text-gray-400 text-lg">
              Discover our most popular courses and start your learning journey today
            </p>
          </div>
          
          <Slider className="courses-slider" {...settings}>
            {courses.map((course) => (
              <div key={course._id} className="p-4">
                <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300">
                  <div className="relative">
                    <img
                      className="h-48 w-full object-cover"
                      src={course.image.url}
                      alt={course.title}
                    />
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ₹{course.price}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <Link 
                      to={`/buy/${course._id}`} 
                      className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 text-center block"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* Admin Section */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Are you an instructor?</h3>
            <p className="text-gray-400 mb-8">
              Join our platform and share your knowledge with thousands of learners
            </p>
            <Link
              to="/admin/login"
              className="inline-block bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300"
            >
              Become an Instructor
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img src={logo} alt="CourseSphere Logo" className="w-12 h-12 rounded-full" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  CourseSphere
                </h2>
              </div>
              <p className="text-gray-400 mb-6">
                Empowering learners worldwide with high-quality courses from industry experts.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <FaFacebook className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <FaInstagram className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <FaTwitter className="text-xl" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Telegram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400">
              © 2024 CourseSphere. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;
