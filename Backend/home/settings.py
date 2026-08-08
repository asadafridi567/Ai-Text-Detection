"""
Django settings for home project.
"""

import os
from pathlib import Path
from datetime import timedelta
from urllib.parse import urlparse, parse_qsl
import dotenv

dotenv.load_dotenv()

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# Was previously hardcoded in this file (and committed to git) — moved to
# .env. Generate a new one (don't reuse the old leaked value) with:
#   python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError(
        "SECRET_KEY environment variable not set. Generate one and add it "
        "to your .env file."
    )

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "True") == "True"

# Was previously hardcoded and defined twice in this file (the first
# definition near the top was dead code, silently overridden by a second
# definition near the bottom containing a stale ngrok URL). Now a single,
# env-driven list. Comma-separated in .env, e.g.:
#   ALLOWED_HOSTS=127.0.0.1,localhost,your-real-backend-host.example.com
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")

CSRF_TRUSTED_ORIGINS = os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Custom apps
    'core',
    'users',
    'blogs',

    # Third-party
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
]

SITE_ID = 1

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'home.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # Optional
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'home.wsgi.application'

# Replace the DATABASES section of your settings.py with this
tmpPostgres = urlparse(os.getenv("DATABASE_URL"))

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': tmpPostgres.path.replace('/', ''),
        'USER': tmpPostgres.username,
        'PASSWORD': tmpPostgres.password,
        'HOST': tmpPostgres.hostname,
        'PORT': 5432,
        'OPTIONS': dict(parse_qsl(tmpPostgres.query)),
    }
}

# Custom user model
AUTH_USER_MODEL = 'users.CustomUser'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Default auto field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',  # Use per-view permissions instead
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.ScopedRateThrottle',
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ),
    'DEFAULT_THROTTLE_RATES': {
        'demo': '24/day',
        'anon': '24/day',
        'user': '1000/day'
    }
}

# JWT configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# CORS for React frontend
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL_ORIGINS", "True") == "True"
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split()
CORS_ALLOW_CREDENTIALS = True


AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',  # Default backend
    'allauth.account.auth_backends.AuthenticationBackend',  # Allauth backend
)

# Was hardcoded to localhost:3000 — now env-driven so it matches wherever
# the frontend actually is (Codespaces URL, real domain, etc.)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
LOGIN_REDIRECT_URL = f"{FRONTEND_URL}/"
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
FLASK_AI_API_URL = os.getenv("FLASK_AI_API_URL", "http://localhost:5000/check-ai/")
FLASK_HUMANIZE_API_URL = os.getenv("FLASK_HUMANIZE_API_URL", "http://localhost:5000/humanize/")

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'OAUTH_PKCE_ENABLED': True,  # Enable PKCE for enhanced security
        'FETCH_USERINFO': True,  # Fetch user data from Google
    }
}

SOCIALACCOUNT_STORE_TOKENS = True  # Store tokens for social accounts
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_LOGIN_ON_GET = True

ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]

# Email backend
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
# NOTE: Gmail requires an App Password here (Google Account > Security >
# App Passwords), not your normal account password — plain password SMTP
# auth is rejected by Gmail with a 534 SMTPAuthenticationError.
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)
PASSWORD_RESET_TIMEOUT = 60 * 60 * 4  # 4 hours

# CSRF
CSRF_COOKIE_NAME = "csrftoken"
CSRF_COOKIE_HTTPONLY = False  # frontend JS needs to read this cookie

# RapidAPI (third-party plagiarism-checking service via rapidapi.com —
# unrelated to the "ai" container/service in this project)
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
PLAGIARISM_API_HOST = os.getenv("PLAGIARISM_API_HOST")

if not RAPIDAPI_KEY:
    raise ValueError("RAPIDAPI_KEY environment variable not set.")
if not PLAGIARISM_API_HOST:
    raise ValueError("PLAGIARISM_API_HOST environment variable not set.")

# Celery Configuration
# Was hardcoded to 127.0.0.1, which inside Docker refers to this
# container itself, not the "redis" service — Celery would never actually
# reach Redis. Now reads REDIS_URL, same as the CACHES config below,
# resolving to the "redis" service name on Docker's internal network.
REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Karachi'  # Or your appropriate timezone
CELERY_ENABLE_UTC = True

# Directory where generated PDFs will be stored temporarily
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Redis cache
# Was previously wrapped in a docstring (dead code, never actually
# executed) — now active. Uses the same REDIS_URL as Celery above but a
# different DB index (/1 vs /0) to keep cache and task queue data separate.
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.getenv("REDIS_CACHE_URL", "redis://127.0.0.1:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# File upload limit
# Was also inside the dead docstring above along with CACHES — now active.
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5 MB