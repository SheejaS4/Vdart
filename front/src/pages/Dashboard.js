import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      const [statsResponse, coursesResponse] = await Promise.all([
        fetch('http://localhost:8000/api/dashboard/stats/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/dashboard/enrolled-courses/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok && coursesResponse.ok) {
        const statsData = await statsResponse.json();
        let coursesData = await coursesResponse.json();

        // Ensure coursesData is always an array
        if (!Array.isArray(coursesData)) {
          console.warn("Enrolled courses is not an array. Setting it to empty array.");
          coursesData = [];
        }

        setStats(statsData);
        setEnrolledCourses(coursesData);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('An error occurred while fetching dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const pieChartData = [
    { name: 'Enrolled Courses', value: stats?.enrolled_courses || 0 },
    { name: 'Available Courses', value: (stats?.total_courses || 0) - (stats?.enrolled_courses || 0) }
  ];

  const barChartData = Array.isArray(enrolledCourses)
    ? enrolledCourses.map(course => ({
        name: course.title,
        students: course.students_count || 0
      }))
    : [];

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  console.log("Stats:", stats);
  console.log("Enrolled Courses:", enrolledCourses);
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            <i className="fas fa-refresh"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="user-avatar">
            {user?.profile_pic ? (
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
          <div className="welcome-text">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's your learning progress overview</p>
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-book"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats?.total_courses || 0}</span>
              <span className="stat-label">Total Courses</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats?.enrolled_courses || 0}</span>
              <span className="stat-label">My Enrollments</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats?.total_students || 0}</span>
              <span className="stat-label">Total Students</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Course Enrollment Overview</h3>
              <p>Your enrollment status across all courses</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Students per Course</h3>
              <p>Number of students enrolled in your courses</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                    fontSize={12}
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="recent-courses">
          <div className="section-header">
            <h3>Recent Enrollments</h3>
            <p>Your latest course enrollments</p>
          </div>
          <div className="courses-grid">
            {Array.isArray(enrolledCourses) && enrolledCourses.slice(0, 6).map(course => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <div className="course-icon">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <div className="course-status">
                    <span className="status enrolled">
                      <i className="fas fa-check-circle"></i>
                      Enrolled
                    </span>
                  </div>
                </div>
                <div className="course-content">
                  <h4 className="course-title">{course.title}</h4>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <div className="meta-item">
                      <i className="fas fa-clock"></i>
                      <span>{course.duration || '—'} hours</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-users"></i>
                      <span>{course.students_count || 0} students</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {enrolledCourses.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-book-open"></i>
              <h3>No enrollments yet</h3>
              <p>Start by enrolling in some courses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
