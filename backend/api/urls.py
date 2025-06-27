from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_user, name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('profile/', views.user_profile, name='profile'),
    path('change-password/', views.change_password, name='change-password'),
    
    # Course endpoints
    path('courses/', views.CourseListView.as_view(), name='course-list'),
    
    # Enrollment endpoints
    path('enrollments/', views.EnrollmentListView.as_view(), name='enrollment-list'),
    path('enrollments/<int:pk>/', views.EnrollmentDetailView.as_view(), name='enrollment-detail'),
    
    # Dashboard endpoints
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/enrolled-courses/', views.enrolled_courses, name='enrolled-courses'),
] 