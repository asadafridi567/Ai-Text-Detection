# core/tasks.py
from celery import shared_task
from django.template.loader import render_to_string
from weasyprint import HTML # Import HTML from weasyprint
from django.conf import settings
import os
from datetime import datetime
import uuid # To generate unique filenames

@shared_task
def generate_pdf_report_task(context_data):
    """
    Celery task to generate a PDF report.
    context_data: A dictionary containing all the context needed for the template.
    """
    try:
        # Re-render HTML from template using the passed context
        # Make sure the template path is correct relative to your TEMPLATES DIRS
        html_string = render_to_string('core/pdf_report.html', context_data)
        
        # WeasyPrint needs a base_url for relative paths (like CSS or images)
        html = HTML(string=html_string, base_url=settings.BASE_DIR) # Adjust base_url as needed

        # Generate PDF bytes
        pdf_bytes = html.write_pdf()

        # Generate a unique filename for the PDF
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_id = uuid.uuid4().hex[:8] # Short unique ID
        filename = f"plagiarism_report_{timestamp}_{unique_id}.pdf"
        
        # Define the path to save the PDF
        # Ensure settings.MEDIA_ROOT exists and is writable
        pdf_storage_path = os.path.join(settings.MEDIA_ROOT, 'reports', filename)
        
        # Create the 'reports' directory if it doesn't exist
        os.makedirs(os.path.dirname(pdf_storage_path), exist_ok=True)

        # Save the PDF to the specified path
        with open(pdf_storage_path, 'wb') as f:
            f.write(pdf_bytes)

        # Return the URL or path to the generated PDF
        # The URL will be accessible via MEDIA_URL in your Django project
        pdf_url = os.path.join(settings.MEDIA_URL.strip('/'), 'reports', filename).replace('\\', '/')
        return {"status": "success", "pdf_url": pdf_url, "filename": filename}

    except Exception as e:
        # Log the error for debugging
        print(f"Error generating PDF in Celery task: {e}")
        return {"status": "error", "message": str(e)}