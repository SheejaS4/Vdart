import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [profilePic, setProfilePic] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          profilePic: 'File size must be less than 5MB'
        }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePic: 'Please select an image file'
        }));
        return;
      }

      setProfilePic(file);
      setErrors(prev => ({
        ...prev,
        profilePic: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = new FormData();
      userData.append('name', formData.name);
      userData.append('email', formData.email);
      if (profilePic) {
        userData.append('profile_pic', profilePic);
      }

      const result = await updateProfile(userData);
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setProfilePic(null); // Clear the file input
      } else {
        setApiError(result.error.message || 'Profile update failed');
      }
    } catch (error) {
      setApiError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.profile_pic ? (
              <img 
                src={`http://localhost:8000${user.profile_pic}`} 
                alt="Profile" 
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <h2>Profile Settings</h2>
          <p>Update your personal information</p>
        </div>

        {apiError && (
          <div className="error-message">
            {apiError}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="profilePic">Profile Picture</label>
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              onChange={handleFileChange}
              accept="image/*"
              className="file-input"
            />
            {errors.profilePic && <span className="error-text">{errors.profilePic}</span>}
            {profilePic && (
              <div className="file-preview">
                <img 
                  src={URL.createObjectURL(profilePic)} 
                  alt="Preview" 
                  className="image-preview"
                />
                <span className="preview-text">New profile picture preview</span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Updating Profile...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Update Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile; 