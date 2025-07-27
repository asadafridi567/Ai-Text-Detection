# analysis/utils.py
import docx
import fitz # PyMuPDF
import re
from io import BytesIO

def clean_extracted_text(text):
    """
    Performs general cleaning on extracted text to improve quality.
    - Replaces common non-breaking space characters.
    - Replaces multiple spaces, tabs, and newlines with single spaces or newlines.
    - Strips leading/trailing whitespace from lines.
    - Removes common form feed characters.
    """
    if not isinstance(text, str):
        return "" # Ensure input is a string

    # Replace common non-breaking spaces with regular space
    text = text.replace('\xa0', ' ')

    # Remove non-printable ASCII characters except common whitespace
    # This keeps newlines, tabs, spaces
    text = re.sub(r'[^\x20-\x7E\n\r\t]', '', text)

    # Replace multiple spaces with a single space
    text = re.sub(r' {2,}', ' ', text)

    # Normalize various newline characters to a single '\n'
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # Remove multiple consecutive newlines (more than 2) to prevent excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Strip leading/trailing whitespace from each line
    lines = text.split('\n')
    cleaned_lines = [line.strip() for line in lines]
    text = '\n'.join(cleaned_lines)

    # Further clean up leading/trailing whitespace of the entire text block
    text = text.strip()

    return text

def extract_text_from_docx(file_obj):
    """
    Extracts text from a .docx file object, preserving paragraph breaks with double newlines.
    """
    try:
        document = docx.Document(file_obj)
        full_text_parts = []
        for para in document.paragraphs:
            # Append paragraph text; ensure a break, typically a double newline for clarity
            if para.text.strip(): # Only add if paragraph has actual content
                full_text_parts.append(para.text)

        # Join paragraphs with double newlines for clearer separation
        extracted_text = '\n\n'.join(full_text_parts)
        return clean_extracted_text(extracted_text)
    except Exception as e:
        raise ValueError(f"Could not extract text from DOCX: {e}")

def extract_text_from_pdf(file_obj):
    """
    Extracts text from a .pdf file object using PyMuPDF, attempting to preserve reading order.
    """
    try:
        # Use BytesIO to allow fitz.open to read from memory
        file_bytes = BytesIO(file_obj.read())
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page_num in range(doc.page_count):
            page = doc[page_num]
            # 'text' method with 'sort=True' often yields better reading order
            # 'flags=1' is a common default, but 'text' is clearer
            # For complex layouts, iterating through 'blocks' or 'lines' could be more precise
            page_text = page.get_text("text", sort=True)
            if page_text.strip():
                text_parts.append(page_text)
        doc.close()

        # Join pages with a page break indicator or double newline
        # Double newline is generally sufficient for AI models
        extracted_text = '\n\n'.join(text_parts)
        return clean_extracted_text(extracted_text)
    except Exception as e:
        raise ValueError(f"Could not extract text from PDF: {e}")

def get_text_from_file(uploaded_file):
    """
    Determines file type and extracts text accordingly.
    """
    filename = uploaded_file.name
    file_extension = filename.split('.')[-1].lower()

    # Ensure the file pointer is at the beginning for reading
    uploaded_file.seek(0)

    if file_extension == 'docx':
        return extract_text_from_docx(uploaded_file)
    elif file_extension == 'pdf':
        return extract_text_from_pdf(uploaded_file)
    else:
        raise ValueError("Unsupported file type. Only .docx and .pdf are supported.")