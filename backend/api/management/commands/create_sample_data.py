from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Course, Enrollment
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create sample courses
        courses_data = [
            {
                'title': 'Introduction to Python Programming',
                'description': 'Learn the fundamentals of Python programming language including variables, loops, functions, and object-oriented programming.'
            },
            {
                'title': 'Web Development with Django',
                'description': 'Build web applications using Django framework. Learn about models, views, templates, and deployment.'
            },
            {
                'title': 'React.js Fundamentals',
                'description': 'Master React.js for building modern user interfaces. Learn components, state management, and hooks.'
            },
            {
                'title': 'Database Design and SQL',
                'description': 'Learn database design principles and SQL for managing data effectively.'
            },
            {
                'title': 'Machine Learning Basics',
                'description': 'Introduction to machine learning concepts, algorithms, and practical applications.'
            },
            {
                'title': 'DevOps and CI/CD',
                'description': 'Learn about DevOps practices, continuous integration, and deployment strategies.'
            }
        ]

        courses = []
        for course_data in courses_data:
            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults={'description': course_data['description']}
            )
            courses.append(course)
            if created:
                self.stdout.write(f'Created course: {course.title}')

        # Create sample users if they don't exist
        users_data = [
            {'name': 'John Doe', 'email': 'john@example.com'},
            {'name': 'Jane Smith', 'email': 'jane@example.com'},
            {'name': 'Bob Johnson', 'email': 'bob@example.com'},
            {'name': 'Alice Brown', 'email': 'alice@example.com'},
        ]

        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={'name': user_data['name']}
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created user: {user.name}')
            users.append(user)

        # Create some random enrollments
        for user in users:
            # Enroll each user in 2-4 random courses
            num_courses = random.randint(2, 4)
            selected_courses = random.sample(courses, num_courses)
            
            for course in selected_courses:
                enrollment, created = Enrollment.objects.get_or_create(
                    student=user,
                    course=course
                )
                if created:
                    self.stdout.write(f'Enrolled {user.name} in {course.title}')

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        ) 