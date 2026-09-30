import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, User, LogOut, LayoutDashboard, Upload, ClipboardList, Mail, Menu, X } from 'lucide-react';

const NavLink = ({ to, icon: Icon, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const authLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload',    icon: Upload,          label: 'Upload' },
    { to: '/reports',   icon: ClipboardList,   label: 'Reports' },
    { to: '/cover-letter', icon: Mail,         label: 'Cover Letter' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Resume Analyzer</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/">Home</NavLink>

            {user ? (
              <>
                {authLinks.map(({ to, icon, label }) => (
                  <NavLink key={to} to={to} icon={icon}>{label}</NavLink>
                ))}
                <div className="flex items-center space-x-2 border-l ml-2 pl-4">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700 max-w-[120px] truncate">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link
                  to="/register"
                  className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1 shadow-lg">
          <NavLink to="/">Home</NavLink>
          {user ? (
            <>
              {authLinks.map(({ to, icon, label }) => (
                <NavLink key={to} to={to} icon={icon}>{label}</NavLink>
              ))}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <User className="h-4 w-4" /> {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-600 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 mt-2"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
