import React, { useState } from 'react';
import './ChangePassword.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'New password must be at least 6 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Password changed successfully!');
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setApiError(data.error.message || 'Password change failed');
      }
    } catch (error) {
      setApiError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <div className="change-password-header">
          <div className="password-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h2>Change Password</h2>
          <p>Update your account password</p>
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

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="current_password">Current Password</label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              className={errors.current_password ? 'error' : ''}
              placeholder="Enter your current password"
            />
            {errors.current_password && <span className="error-text">{errors.current_password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="new_password">New Password</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              className={errors.new_password ? 'error' : ''}
              placeholder="Enter your new password"
            />
            {errors.new_password && <span className="error-text">{errors.new_password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm New Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={errors.confirm_password ? 'error' : ''}
              placeholder="Confirm your new password"
            />
            {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Changing Password...
              </>
            ) : (
              <>
                <i className="fas fa-key"></i>
                Change Password
              </>
            )}
          </button>
        </form>

        <div className="password-tips">
          <h4>Password Tips:</h4>
          <ul>
            <li>Use at least 6 characters</li>
            <li>Include a mix of letters, numbers, and symbols</li>
            <li>Avoid using common words or phrases</li>
            <li>Don't reuse passwords from other accounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword; 