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
from .tasks import generate_pdf_report_task
import os

from .services import check_plagiarism
from .utils import get_text_from_file # Import your new utility
import requests # Keep for exception handling
from django.conf import settings

try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False
    print("WeasyPrint is not installed or its dependencies are missing. PDF generation will be disabled.")


class PlagiarismDetectionView(APIView):
    permission_classes = [IsAuthenticated]
    # Allow both JSON (for direct text input) and MultiPart/Form (for file uploads)
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request, format=None):
        text_content = None
        uploaded_file = None

        # 1. Try to get text from JSON body (for direct text input)
        if 'text_content' in request.data and isinstance(request.data['text_content'], str):
            text_content = request.data.get('text_content')
        elif 'text' in request.data and isinstance(request.data['text'], str):
            text_content = request.data.get('text')

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
        # We no longer strictly need WEASYPRINT_AVAILABLE check here if always offloading
        # But if you want a fallback or quick response for small PDFs, you could keep it.
        # For this example, we'll offload unconditionally.

        original_text = request.data.get('original_text')
        full_report_data = request.data.get('plagiarism_report')

        if not original_text or not full_report_data:
            return Response(
                {"detail": "Both 'original_text' and 'plagiarism_report' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        plagiarism_status = full_report_data.get('status')
        plagiarism_links = full_report_data.get('duplicate_content_found_on_links', [])
        ai_report_data = full_report_data.get('plagiarism_report', {}) # Nested AI report

        context_data = { # Renamed to context_data for clarity in task argument
            'original_text': original_text,
            'plagiarism_status': plagiarism_status,
            'plagiarism_links': plagiarism_links,
            'ai_report': ai_report_data,
            'current_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        # --- Dispatch the PDF generation task to Celery ---
        # .delay() is a shortcut for .apply_async()
        # We pass the context data to the task. Celery will serialize this.
        task = generate_pdf_report_task.delay(context_data)

        # Return an immediate response with the task ID
        # The frontend can use this task ID to poll for the PDF status/URL
        return Response(
            {
                "detail": "PDF generation started successfully.",
                "task_id": task.id,
                "status_url": f"/api/pdf-report/status/{task.id}/" # Example URL to check status
            },
            status=status.HTTP_202_ACCEPTED # 202 Accepted indicates processing has started
        )

# Optional: Add a new view to check the status of the Celery task and retrieve the PDF
class PDFReportStatusView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, task_id, format=None):
        from celery.result import AsyncResult
        
        task_result = AsyncResult(task_id)
        
        if task_result.state == 'PENDING':
            response_data = {"status": "pending", "message": "PDF generation is pending."}
            return Response(response_data, status=status.HTTP_200_OK)
        elif task_result.state == 'STARTED':
            response_data = {"status": "started", "message": "PDF generation is in progress."}
            return Response(response_data, status=status.HTTP_200_OK)
        elif task_result.state == 'SUCCESS':
            result_data = task_result.get() # Get the result (which is the dict returned by the task)
            if result_data.get("status") == "success":
                pdf_url = result_data.get("pdf_url")
                filename = result_data.get("filename", "plagiarism_report.pdf") # Default filename
                response_data = {
                    "status": "completed",
                    "message": "PDF generated successfully.",
                    "pdf_url": pdf_url,
                    "filename": filename # Provide filename for frontend download
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else: # Task completed but with an error inside
                response_data = {
                    "status": "failed",
                    "message": f"PDF generation failed: {result_data.get('message', 'Unknown error')}"
                }
                return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        elif task_result.state == 'FAILURE':
            response_data = {
                "status": "failed",
                "message": f"PDF generation failed due to an internal error: {task_result.info}"
            }
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            response_data = {"status": task_result.state, "message": "Unknown task status."}
            return Response(response_data, status=status.HTTP_200_OK)
    

class AIDetectionView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    # Define the URL for your Flask AI detection API
    FLASK_AI_API_URL = settings.FLASK_AI_API_URL

    def post(self, request, format=None):
        text_content = None # Initialize text_content to None

        # 1. Try to get text from raw JSON body (for direct text input)
        # request.data handles parsed data from various parsers
        if 'text_content' in request.data and isinstance(request.data['text_content'], str):
            text_content = request.data.get('text_content')
            print(f"Received JSON text content: {text_content[:50]}...") # For debugging
        elif 'text' in request.data and isinstance(request.data['text'], str):
            text_content = request.data.get('text')
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
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    FLASK_HUMANIZE_API_URL = settings.FLASK_HUMANIZE_API_URL

    def post(self, request, format=None):
        text_content = None # Initialize text_content to None
        
        # 1. Try to get text from raw JSON body (for direct text input)
        if isinstance(request.data, dict) and 'text' in request.data and isinstance(request.data['text'], str):
            text_content = request.data.get('text')
            print(f"Humanize: Received JSON text: {text_content[:50]}...") # For debugging
        elif isinstance(request.data, dict) and 'text_content' in request.data and isinstance(request.data['text_content'], str):
            text_content = request.data.get('text_content')
            print(f"Humanize: Received JSON text_content: {text_content[:50]}...") # For debugging

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