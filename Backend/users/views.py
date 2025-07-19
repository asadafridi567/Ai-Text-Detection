from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
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
            return redirect("http://localhost:3000/email-verified/?error=InvalidUserID")

        if account_activation_token.check_token(user, token):
            user.is_active = True
            user.is_verified = True
            user.save()
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # 🔁 Redirect with tokens in query string
            return redirect(
                f"http://localhost:3000/email-verified/?access={access_token}&refresh={refresh_token}"
            )
        else:
            return redirect("http://localhost:3000/email-verified/?error=InvalidOrExpiredToken")


class ProtectedExampleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "You're authenticated!"})


@login_required
def google_login_callback(request):
    user = request.user
    redirect_base = getattr(settings, "FRONTEND_CALLBACK_URL", "http://localhost:5173/login/callback/")

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


@csrf_exempt
def validate_google_token(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            google_token = data.get('access_token')

            if not google_token:
                return JsonResponse({'detail': 'Access Token is missing.'}, status=400)

            # Verify token
            try:
                idinfo = id_token.verify_oauth2_token(
                    google_token,
                    requests.Request(),
                    audience=os.getenv("GOOGLE_CLIENT_ID")  # ← Optional: restrict to your client
                )
                return JsonResponse({'valid': True, 'email': idinfo.get('email')})
            except ValueError:
                return JsonResponse({'valid': False, 'error': 'Invalid token'}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({'detail': 'Invalid JSON.'}, status=400)

    return JsonResponse({'detail': 'Method not allowed.'}, status=405)
