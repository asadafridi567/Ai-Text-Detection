from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from allauth.socialaccount.models import SocialAccount, SocialToken
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.contrib.auth import logout as django_logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from .tokens import account_activation_token
from .utils import send_activation_email
from django.http import JsonResponse
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import json
import logging
logger = logging.getLogger(__name__)

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()

            send_activation_email(request, user)

            return Response({"message": "Activation link sent to your email."}, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            if not user.is_active:
                return Response({"error": "Email not verified."}, status=status.HTTP_403_FORBIDDEN)
            tokens = get_tokens_for_user(user)
            return Response(tokens, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Optional: blacklist refresh token
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return redirect(f"{settings.FRONTEND_URL}/email-verified/?error=InvalidUserID")

        if account_activation_token.check_token(user, token):
            user.is_active = True
            user.is_verified = True
            user.save()
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # 🔁 Redirect with tokens in query string
            return redirect(
                f"{settings.FRONTEND_URL}/email-verified/?access={access_token}&refresh={refresh_token}"
            )
        else:
            return redirect(f"{settings.FRONTEND_URL}/email-verified/?error=InvalidOrExpiredToken")


class ProtectedExampleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "You're authenticated!"})


@login_required
def google_login_callback(request):
    user = request.user
    redirect_base = getattr(settings, "FRONTEND_CALLBACK_URL", f"{settings.FRONTEND_URL}/login/callback/")

    try:
        social_account = SocialAccount.objects.filter(user=user).first()
        if not social_account:
            logger.warning(f"No social account for user {user}")
            return redirect(f"{redirect_base}?error=NoSocialAccount")

        token = SocialToken.objects.filter(account=social_account, account__provider='google').first()
        if not token:
            logger.error(f"No Google token found for user {user}")
            return redirect(f"{redirect_base}?error=NoGoogleToken")

        logger.info(f"Google token found for user {user}: {token.token}")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Redirect with tokens (alternatively use cookies)
        return redirect(f"{redirect_base}?access_token={access_token}&refresh_token={refresh_token}")

    except Exception as e:
        logger.exception("Unexpected error during Google login callback")
        return redirect(f"{redirect_base}?error=ServerError")


class SessionLogoutView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [AllowAny] # Allow any request to hit this, even if not authenticated

    def post(self, request):
        # django_logout invalidates the current session
        # and removes the session cookie from the client.
        response = Response({"detail": "Successfully logged out of session."}, status=status.HTTP_200_OK)
        django_logout(request)
        response.delete_cookie(settings.SESSION_COOKIE_NAME, domain=settings.SESSION_COOKIE_DOMAIN, path=settings.SESSION_COOKIE_PATH)
        return Response({"detail": "Successfully logged out of session."}, status=status.HTTP_200_OK)

# NEW: API View to check if a session is active
class CheckSessionView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated] # Only authenticated users (via session) can access

    def get(self, request):
        # If this view is reached, it means the user is authenticated via session.
        # You can return basic user info if needed, e.g., request.user.email
        return Response({
            "detail": "Session is active.",
            "username": request.user.name, # Assuming CustomUser has a 'name' field
            "email": request.user.email
        }, status=status.HTTP_200_OK)