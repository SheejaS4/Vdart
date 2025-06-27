import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './CourseList.css';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollingCourse, setEnrollingCourse] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesResponse, enrollmentsResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/courses/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://127.0.0.1:8000/api/enrollments/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (coursesResponse.ok && enrollmentsResponse.ok) {
        const coursesData = await coursesResponse.json();
        const enrollmentsData = await enrollmentsResponse.json();
        setCourses(coursesData);
        setEnrollments(enrollmentsData);
      } else {
        setError('Failed to fetch data');
      }
    } catch (error) {
      setError('An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourse(courseId);
      const response = await fetch('http://127.0.0.1:8000/api/enrollments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ course: courseId })
      });

      if (response.ok) {
        // Refresh enrollments data
        const enrollmentsResponse = await fetch('http://127.0.0.1:8000/api/enrollments/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          setEnrollments(enrollmentsData);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to enroll in course');
      }
    } catch (error) {
      setError('An error occurred while enrolling');
    } finally {
      setEnrollingCourse(null);
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.course === courseId);
  };

  const getEnrollmentDate = (courseId) => {
    const enrollment = enrollments.find(enrollment => enrollment.course === courseId);
    return enrollment ? new Date(enrollment.enrolled_date).toLocaleDateString() : null;
  };

  if (isLoading) {
    return (
      <div className="course-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-list-container">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchData} className="btn btn-primary">
            <i className="fas fa-refresh"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <div className="header-content">
          <h1>Available Courses</h1>
          <p>Explore and enroll in courses to enhance your skills</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <i className="fas fa-book"></i>
            <div>
              <span className="stat-number">{courses.length}</span>
              <span className="stat-label">Total Courses</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-user-graduate"></i>
            <div>
              <span className="stat-number">{enrollments.length}</span>
              <span className="stat-label">My Enrollments</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <div className="course-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="course-status">
                {isEnrolled(course.id) ? (
                  <span className="status enrolled">
                    <i className="fas fa-check-circle"></i>
                    Enrolled
                  </span>
                ) : (
                  <span className="status available">
                    <i className="fas fa-plus-circle"></i>
                    Available
                  </span>
                )}
              </div>
            </div>

            <div className="course-content">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>
              
              <div className="course-meta">
                <div className="meta-item">
                  <i className="fas fa-clock"></i>
                  <span>{course.duration} hours</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-users"></i>
                  <span>{course.students_count} students</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-star"></i>
                  <span>{course.difficulty}</span>
                </div>
              </div>

              {isEnrolled(course.id) && (
                <div className="enrollment-info">
                  <i className="fas fa-calendar-check"></i>
                  <span>Enrolled on {getEnrollmentDate(course.id)}</span>
                </div>
              )}
            </div>

            <div className="course-actions">
              {isEnrolled(course.id) ? (
                <button className="btn btn-success btn-full" disabled>
                  <i className="fas fa-check"></i>
                  Already Enrolled
                </button>
              ) : (
                <button 
                  className="btn btn-primary btn-full"
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingCourse === course.id}
                >
                  {enrollingCourse === course.id ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Enroll Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No courses available</h3>
          <p>Check back later for new courses</p>
        </div>
      )}
    </div>
  );
};

export default CourseList; 