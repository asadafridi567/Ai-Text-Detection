# users/utils.py
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import EmailMessage
from django.contrib.sites.shortcuts import get_current_site
from django.conf import settings
from .tokens import account_activation_token

def send_activation_email(request, user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)

    activation_link = f"{request.scheme}://{request.get_host()}/api/verify-email/{uid}/{token}/"

    subject = "Activate your account"
    message = f"Hi {user.username},\nPlease click the link to verify your email:\n{activation_link}"

    email = EmailMessage(subject, message, to=[user.email])
    email.send()
