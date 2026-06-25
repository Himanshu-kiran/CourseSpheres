import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-amber-600" />
              <span className="font-serif text-2xl font-bold text-stone-900">CourseSphere</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-stone-600 hover:text-stone-900 font-medium px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link to="/register" className="bg-amber-600 text-white hover:bg-amber-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} 
                  className="flex items-center space-x-1 text-stone-600 hover:text-amber-600 px-3 py-2 rounded-md font-medium"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center space-x-2 pl-4 border-l border-stone-200">
                  <User className="h-5 w-5 text-stone-400" />
                  <span className="text-sm font-medium text-stone-700">{user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="ml-4 flex items-center space-x-1 text-stone-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
