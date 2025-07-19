# users/urls.py

from django.urls import path
from .views import *

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('login/', LoginView.as_view(), name='login'),
    path('callback/', google_login_callback, name='google-login-callback'),
    path('validate_token/', validate_google_token, name='validate_token'),
    path('protected/', ProtectedExampleView.as_view(), name='protected-example'),
]