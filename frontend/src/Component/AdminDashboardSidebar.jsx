import React, { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { FaChalkboardTeacher, FaPlusCircle } from "react-icons/fa";
import { RiHome2Fill } from "react-icons/ri";
import { IoLogOut } from "react-icons/io5";
import { HiMenu, HiX } from "react-icons/hi";
import logo from "../../public/logo.webp";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_URL } from "../utils/utils";

const AdminDashboardSidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin) {
      toast.error("Please login to admin");
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("admin");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const navLinks = [
    {
      to: "/admin/our-courses",
      label: "Our Courses",
      icon: <FaChalkboardTeacher className="mr-2" />,
    },
    {
      to: "/admin/create-course",
      label: "Create Course",
      icon: <FaPlusCircle className="mr-2" />,
    },
  ];

  const isActive = (path) => location.pathname === path ? "bg-blue-600" : "";

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-20 text-3xl text-gray-800"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <HiX /> : <HiMenu />}
      </button>

      <div
        className={`fixed top-0 left-0 h-screen bg-gray-800 text-white w-64 p-5 transform z-10 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <div className="flex items-center flex-col mb-10 mt-10 md:mt-0">
          <img src={logo} alt="Logo" className="rounded-full h-20 w-20" />
          <h2 className="text-lg font-semibold mt-4">Admin Panel</h2>
        </div>

        <nav className="flex flex-col space-y-2">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <button
                className={`w-full flex items-center text-left px-4 py-3 rounded-md transition-colors ${isActive(link.to)} hover:bg-blue-700`}
              >
                {link.icon}
                {link.label}
              </button>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <Link to="/">
            <button className="w-full flex items-center text-left px-4 py-3 rounded-md transition-colors hover:bg-gray-700">
              <RiHome2Fill className="mr-2" /> Home
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center text-left px-4 py-3 rounded-md transition-colors hover:bg-red-600 mt-2"
          >
            <IoLogOut className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardSidebar;