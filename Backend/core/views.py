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
    # permission_classes = [IsAuthenticated] # Or whatever permission is suitable

    def post(self, request, format=None):
        if not WEASYPRINT_AVAILABLE:
            return Response(
                {"detail": "PDF generation service is not available on the server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        original_text = request.data.get('original_text')
        # This 'plagiarism_report' variable will now hold the *entire* outer report object
        full_report_data = request.data.get('plagiarism_report')

        if not original_text or not full_report_data:
            return Response(
                {"detail": "Both 'original_text' and 'plagiarism_report' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extract plagiarism-specific data from the main report object
        plagiarism_status = full_report_data.get('status')
        plagiarism_links = full_report_data.get('duplicate_content_found_on_links', []) # Default to empty list

        # Extract AI-specific data from the NESTED 'plagiarism_report' key
        ai_report_data = full_report_data.get('plagiarism_report', {}) # Default to empty dict if not present

        context = {
            'original_text': original_text,
            'plagiarism_status': plagiarism_status, # Pass plagiarism status directly
            'plagiarism_links': plagiarism_links,   # Pass plagiarism links directly
            'ai_report': ai_report_data,            # Pass AI data under a clear name
            'current_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        # Render HTML from template
        # Ensure the template path matches your project structure (e.g., 'analysis/pdf_report.html')
        # Based on your previous code, it was 'analysis/pdf_report.html', but here it's 'core/pdf_report.html'
        # I'll use 'core/pdf_report.html' as per your provided snippet.
        html_string = render_to_string('core/pdf_report.html', context)
        html = HTML(string=html_string, base_url=request.build_absolute_uri('/'))

        # Generate PDF bytes
        pdf_bytes = html.write_pdf()

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="plagiarism_report.pdf"'
        return response
    

class AIDetectionView(APIView):
    # permission_classes = [IsAuthenticated] # Uncomment this when ready for authentication
    # Add JSONParser to allow raw JSON body
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    # Define the URL for your Flask AI detection API
    FLASK_AI_API_URL = "https://b466907579a3.ngrok-free.app/check-ai/"

    def post(self, request, format=None):
        text_content = None # Initialize text_content to None

        # 1. Try to get text from raw JSON body (for direct text input)
        # request.data handles parsed data from various parsers
        if 'text_content' in request.data and isinstance(request.data['text_content'], str):
            text_content = request.data.get('text_content')
            print(f"Received JSON text: {text_content[:50]}...") # For debugging

        # 2. If no text from JSON, check for file upload
        elif 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            print(f"Received file: {uploaded_file.name}") # For debugging
            try:
                text_content = get_text_from_file(uploaded_file)
            except ValueError as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"detail": f"Failed to process file: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 3. If neither text nor file, return error
        if not text_content or not text_content.strip():
            return Response(
                {"detail": "No input text or file provided. Please provide 'text_content' in JSON or upload a .docx/.pdf file."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Basic text length validation (optional)
        if len(text_content) < 50: # Example minimum length
            return Response(
                {"detail": "Input text is too short for meaningful AI analysis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Send the extracted/provided text to your Flask AI detection API
            flask_response = requests.post(
                self.FLASK_AI_API_URL,
                json={"text": text_content}, # Flask API expects JSON with a 'text' key
                timeout=60 # Set a timeout for the request to the Flask API
            )
            flask_response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)

            # Return the JSON response from the Flask API directly to the client
            return Response(flask_response.json(), status=flask_response.status_code)

        except ValueError as e: # This might catch errors if flask_response.json() fails
            return Response(
                {"detail": f"Error parsing response from AI detection service: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except requests.exceptions.Timeout:
            return Response(
                {"detail": "AI detection service timed out. Please try again later."},
                status=status.HTTP_504_GATEWAY_TIMEOUT # Gateway Timeout
            )
        except requests.exceptions.ConnectionError:
            return Response(
                {"detail": "Could not connect to the AI detection service. Please ensure it is running and accessible."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE # Service Unavailable
            )
        except requests.exceptions.HTTPError as e:
            # Catch HTTP errors from the Flask API (e.g., Flask returns 400, 500)
            print(f"Flask AI API returned error: {e.response.status_code} - {e.response.text}")
            try:
                # Try to return Flask's error message if available and it's JSON
                return Response(e.response.json(), status=e.response.status_code)
            except ValueError: # If Flask's error response is not JSON
                return Response(
                    {"detail": f"AI detection service returned an error: {e.response.text}"},
                    status=e.response.status_code
                )
        except Exception as e:
            # Catch any other unexpected errors
            print(f"An unexpected error occurred in AIDetectionView: {e}")
            return Response(
                {"detail": "An unexpected error occurred during AI text detection."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HumanizeTextView(APIView):
    # permission_classes = [IsAuthenticated] # Uncomment this when ready for authentication
    # Allow both JSON (for direct text input) and MultiPart/Form (for file uploads)
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    FLASK_HUMANIZE_API_URL = "https://b466907579a3.ngrok-free.app/humanize/" # Example: Adjust if using ngrok

    def post(self, request, format=None):
        text_content = None # Initialize text_content to None
        
        # 1. Try to get text from raw JSON body (for direct text input)
        if isinstance(request.data, dict) and 'text' in request.data and isinstance(request.data['text'], str):
            text_content = request.data.get('text')
            print(f"Humanize: Received JSON text: {text_content[:50]}...") # For debugging

        # 2. If no text from JSON, check for file upload
        elif 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            print(f"Humanize: Received file: {uploaded_file.name}") # For debugging
            try:
                # Use your existing utility function for file text extraction
                text_content = get_text_from_file(uploaded_file)
            except ValueError as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"detail": f"Humanize: Failed to process file: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 3. If neither text nor file, return error
        if not text_content or not text_content.strip():
            return Response(
                {"detail": "Humanize: No input text or file provided. Please provide 'text' in JSON or upload a .docx/.pdf file."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Basic text length validation (optional)
        # Adjust min/max lengths as appropriate for your humanization model
        MIN_TEXT_LENGTH = 50
        MAX_TEXT_LENGTH = 10000 # Example: Prevent very long texts for LLM processing
        if len(text_content) < MIN_TEXT_LENGTH:
            return Response(
                {"detail": f"Humanize: Input text is too short for meaningful humanization (minimum {MIN_TEXT_LENGTH} characters)."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(text_content) > MAX_TEXT_LENGTH:
            return Response(
                {"detail": f"Humanize: Input text is too long for humanization (maximum {MAX_TEXT_LENGTH} characters)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Send the extracted/provided text to your Flask Humanize API
            flask_response = requests.post(
                self.FLASK_HUMANIZE_API_URL,
                json={"text": text_content}, # Flask API expects JSON with a 'text' key
                timeout=90 # Humanization can be slower, set a higher timeout
            )
            flask_response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)

            # Return the JSON response from the Flask API directly to the client
            return Response(flask_response.json(), status=flask_response.status_code)

        except ValueError as e: # This might catch errors if flask_response.json() fails
            return Response(
                {"detail": f"Humanize: Error parsing response from humanization service: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except requests.exceptions.Timeout:
            return Response(
                {"detail": "Humanize: Humanization service timed out. Please try again later."},
                status=status.HTTP_504_GATEWAY_TIMEOUT # Gateway Timeout
            )
        except requests.exceptions.ConnectionError:
            return Response(
                {"detail": "Humanize: Could not connect to the humanization service. Please ensure it is running and accessible."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE # Service Unavailable
            )
        except requests.exceptions.HTTPError as e:
            # Catch HTTP errors from the Flask API (e.g., Flask returns 400, 500)
            print(f"Humanize: Flask Humanize API returned error: {e.response.status_code} - {e.response.text}")
            try:
                # Try to return Flask's error message if available and it's JSON
                return Response(e.response.json(), status=e.response.status_code)
            except ValueError: # If Flask's error response is not JSON
                return Response(
                    {"detail": f"Humanize: Humanization service returned an error: {e.response.text}"},
                    status=e.response.status_code
                )
        except Exception as e:
            # Catch any other unexpected errors
            print(f"Humanize: An unexpected error occurred in HumanizeTextView: {e}")
            return Response(
                {"detail": "Humanize: An unexpected error occurred during text humanization."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )