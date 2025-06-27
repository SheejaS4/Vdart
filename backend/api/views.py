from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Count
from .models import User, Course, Enrollment
from .serializers import (
    UserSerializer, UserRegistrationSerializer, 
    CourseSerializer, EnrollmentSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user with profile picture support"""
    print('Registration request data:', request.data)  # Debug line
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)
    print('Registration error:', serializer.errors)  # Debug line
    return Response({
        'success': False,
        'error': {
            'message': 'Registration failed',
            'details': serializer.errors
        }
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get or update user profile with profile picture support"""
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response({
            'success': True,
            'user': serializer.data
        })
    
    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'user': serializer.data
            })
        return Response({
            'success': False,
            'error': {
                'message': 'Profile update failed',
                'details': serializer.errors
            }
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({
            'success': False,
            'error': {
                'message': 'Current password and new password are required'
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.check_password(current_password):
        return Response({
            'success': False,
            'error': {
                'message': 'Current password is incorrect'
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({
        'success': True,
        'message': 'Password changed successfully'
    })

class CourseListView(generics.ListAPIView):
    """List all available courses with student count"""
    queryset = Course.objects.annotate(students_count=Count('enrollments'))
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class EnrollmentListView(generics.ListCreateAPIView):
    """List user enrollments and create new enrollments"""
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user).select_related('course')
    
    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course')
        
        if not course_id:
            return Response({
                'success': False,
                'error': {
                    'message': 'Course ID is required'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({
                'success': False,
                'error': {
                    'message': 'Course not found'
                }
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({
                'success': False,
                'error': {
                    'message': 'Already enrolled in this course'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        enrollment = Enrollment.objects.create(student=request.user, course=course)
        serializer = self.get_serializer(enrollment)
        
        return Response({
            'success': True,
            'message': 'Successfully enrolled in course',
            'enrollment': serializer.data
        }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics"""
    print('Fetching dashboard stats for user:', request.user)  # Debug line
    total_courses = Course.objects.count()
    enrolled_courses = Enrollment.objects.filter(student=request.user).count()
    total_students = User.objects.count()
    print('Total courses:', total_courses)  # Debug line
    print('Enrolled courses:', enrolled_courses)  # Debug line
    # Get courses with most students
    popular_courses = Course.objects.annotate(
        students_count=Count('enrollments')
    ).order_by('-students_count')[:5]
    print('Popular courses:', popular_courses)  # Debug line
    stats = {
        'total_courses': total_courses,
        'enrolled_courses': enrolled_courses,
        'total_students': total_students,
        'popular_courses': CourseSerializer(popular_courses, many=True, context={'request': request}).data
    }
    
    return Response({
        'success': True,
        'stats': stats
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enrolled_courses(request):
    """Get user's enrolled courses with student count"""
    enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
    courses = [enrollment.course for enrollment in enrollments]
    
    # Add student count to each course
    for course in courses:
        course.students_count = course.enrollments.count()
    
    serializer = CourseSerializer(courses, many=True, context={'request': request})
    return Response({
        'success': True,
        'courses': serializer.data
    })

class EnrollmentDetailView(RetrieveAPIView):
    """Retrieve a single enrollment by ID"""
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user).select_related('course') 