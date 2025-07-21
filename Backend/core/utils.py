import docx
import fitz # PyMuPDF
from io import BytesIO

def extract_text_from_docx(file_obj):
    """
    Extracts text from a .docx file object.
    """
    try:
        document = docx.Document(file_obj)
        full_text = []
        for para in document.paragraphs:
            full_text.append(para.text)
        return '\n'.join(full_text)
    except Exception as e:
        raise ValueError(f"Could not extract text from DOCX: {e}")

def extract_text_from_pdf(file_obj):
    """
    Extracts text from a .pdf file object.
    """
    try:
        # PyMuPDF expects bytes-like object or a path
        doc = fitz.open(stream=file_obj.read(), filetype="pdf")
        text = ""
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        raise ValueError(f"Could not extract text from PDF: {e}")

def get_text_from_file(uploaded_file):
    """
    Determines file type and extracts text accordingly.
    """
    filename = uploaded_file.name
    file_extension = filename.split('.')[-1].lower()

    if file_extension == 'docx':
        return extract_text_from_docx(uploaded_file)
    elif file_extension == 'pdf':
        return extract_text_from_pdf(uploaded_file)
    else:
        raise ValueError("Unsupported file type. Only .docx and .pdf are supported.")