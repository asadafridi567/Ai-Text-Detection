from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager

class CustomUser(AbstractUser):
    username = None
    name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    # Assign your custom manager
    objects = CustomUserManager() # <<< ADD THIS LINE

    def __str__(self):
        return self.email