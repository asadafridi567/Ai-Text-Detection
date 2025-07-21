from django.urls import path
from .views import *

urlpatterns = [
    path('plagiarism-check/', PlagiarismDetectionView.as_view(), name='plagiarism_check'),
    path('generate-pdf-report/', PDFReportGenerationView.as_view(), name='generate_pdf_report'),
]