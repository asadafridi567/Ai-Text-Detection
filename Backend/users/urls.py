# users/urls.py

from django.urls import path
from .views import RegisterView, LoginView, VerifyEmailView, ProtectedExampleView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('login/', LoginView.as_view(), name='login'),
    path('protected/', ProtectedExampleView.as_view(), name='protected-example'),
]