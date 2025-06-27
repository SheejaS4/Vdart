import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>CourseHub</h2>
        </Link>

        {isAuthenticated ? (
          <>
            <div className="navbar-links">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/courses" className="nav-link">Courses</Link>
            </div>

            <div className="navbar-user">
              <div className="user-menu" onClick={toggleMenu}>
                <div className="user-avatar">
                  {user?.profile_pic ? (
                    <img src={user.profile_pic} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <span className="user-name">{user?.name}</span>
                <i className="fas fa-chevron-down"></i>
              </div>

              {isMenuOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    <i className="fas fa-user"></i>
                    Profile
                  </Link>
                  <Link to="/change-password" className="dropdown-item">
                    <i className="fas fa-key"></i>
                    Change Password
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button className="mobile-menu-btn" onClick={toggleMenu}>
              <i className="fas fa-bars"></i>
            </button>
          </>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isAuthenticated && isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/dashboard" className="mobile-link">Dashboard</Link>
          <Link to="/courses" className="mobile-link">Courses</Link>
          <Link to="/profile" className="mobile-link">Profile</Link>
          <Link to="/change-password" className="mobile-link">Change Password</Link>
          <button onClick={handleLogout} className="mobile-link logout-btn">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 