from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Course, Enrollment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'profile_pic']
        read_only_fields = ['id', 'email']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'confirm_password', 'profile_pic']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
            profile_pic=validated_data.get('profile_pic')
        )
        return user

class LoginSerializer(serializers.Serializer):
    name = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        name = attrs.get('name')
        password = attrs.get('password')

        if name and password:
            user = authenticate(username=name, password=password)
            if not user:
                raise serializers.ValidationError('Invalid name or password')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include name and password')
        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect')
        return value

class CourseSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'created_at', 'student_count', 'is_enrolled']

    def get_student_count(self, obj):
        return obj.enrollments.count()

    def get_is_enrolled(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.enrollments.filter(student=user).exists()
        return False

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_id', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at']

    def validate_course_id(self, value):
        try:
            course = Course.objects.get(id=value)
            user = self.context['request'].user
            if Enrollment.objects.filter(student=user, course=course).exists():
                raise serializers.ValidationError('Already enrolled in this course')
            return value
        except Course.DoesNotExist:
            raise serializers.ValidationError('Course does not exist')

    def create(self, validated_data):
        course_id = validated_data.pop('course_id')
        course = Course.objects.get(id=course_id)
        user = self.context['request'].user
        enrollment = Enrollment.objects.create(student=user, course=course)
        return enrollment

class DashboardStatsSerializer(serializers.Serializer):
    coursesEnrolled = serializers.IntegerField()
    totalStudents = serializers.IntegerField()
    recentEnrollments = serializers.ListField()

class RecentEnrollmentSerializer(serializers.Serializer):
    student_name = serializers.CharField()
    course_title = serializers.CharField()
    enrolled_at = serializers.DateTimeField() 