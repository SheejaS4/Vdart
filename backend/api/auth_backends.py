from django.contrib.auth.backends import ModelBackend
from .models import User

class EmailBackend(ModelBackend):
    def authenticate(self, request, name=None, password=None, **kwargs):
        try:
            user = User.objects.get(name=name)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None 