# analysis/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser # Import for file uploads
from django.template.loader import render_to_string
from django.http import HttpResponse, FileResponse
from django.conf import settings
from datetime import datetime
import os

from .services import check_plagiarism
from .utils import get_text_from_file # Import your new utility
import requests # Keep for exception handling


try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False
    print("WeasyPrint is not installed or its dependencies are missing. PDF generation will be disabled.")


class PlagiarismDetectionView(APIView):
    #permission_classes = [IsAuthenticated]
    # Allow both JSON (for direct text input) and MultiPart/Form (for file uploads)
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request, format=None):
        text_content = None
        uploaded_file = None

        # 1. Try to get text from JSON body (for direct text input)
        if 'text_content' in request.data:
            text_content = request.data.get('text_content')

        # 2. Try to get text from uploaded file
        if 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            try:
                text_content = get_text_from_file(uploaded_file)
            except ValueError as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                # Catch unexpected errors during file processing
                return Response({"detail": f"Failed to process file: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Ensure we have text content
        if not text_content:
            return Response(
                {"detail": "Either 'text_content' in JSON or a 'file' upload is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Basic text length validation (optional but good practice)
        if len(text_content) < 50: # Example minimum length
            return Response(
                {"detail": "Text content is too short for meaningful analysis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            plagiarism_results = check_plagiarism(text_content)
            # You might want to save the original text and results temporarily
            # for PDF generation (see Feature 2)
            # For MVP, we'll assume PDF generation can happen immediately.

            return Response(plagiarism_results, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response(
                {"detail": f"Failed to connect to plagiarism service: {e}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except ValueError as e:
            return Response(
                {"detail": f"Service configuration error or invalid API response: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            print(f"An unexpected error occurred in PlagiarismDetectionView: {e}")
            return Response(
                {"detail": "An unexpected error occurred during plagiarism detection."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PDFReportGenerationView(APIView):
    #permission_classes = [IsAuthenticated] # Or whatever permission is suitable

    def post(self, request, format=None):
        if not WEASYPRINT_AVAILABLE:
            return Response(
                {"detail": "PDF generation service is not available on the server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Expecting JSON like:
        # {
        #   "original_text": "...",
        #   "plagiarism_report": { "status": "...", "duplicate_content_found_on_links": [...] }
        # }
        original_text = request.data.get('original_text')
        plagiarism_report = request.data.get('plagiarism_report')

        if not original_text or not plagiarism_report:
            return Response(
                {"detail": "Both 'original_text' and 'plagiarism_report' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        context = {
            'original_text': original_text,
            'report': plagiarism_report,
            'current_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        # Render HTML from template
        html_string = render_to_string('analysis/pdf_report.html', context)
        html = HTML(string=html_string, base_url=request.build_absolute_uri('/')) # Use base_url for relative paths like images if any

        # Generate PDF bytes
        pdf_bytes = html.write_pdf()

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="plagiarism_report.pdf"'
        return response