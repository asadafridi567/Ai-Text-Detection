# analysis/services.py
import requests
import os
import json # For logging/debugging if API returns non-JSON error

# Retrieve API key and host from settings (which get them from environment variables)
# Using os.getenv directly here for clarity, assuming settings.py handles the check
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
PLAGIARISM_API_HOST = os.getenv("PLAGIARISM_API_HOST")

# Define the base URL for the plagiarism API
PLAGIARISM_API_BASE_URL = f"https://{PLAGIARISM_API_HOST}/data" # Changed from /data to a more generic base if API changes

def check_plagiarism(text_content: str):
    """
    Calls the RapidAPI plagiarism checker.

    Args:
        text_content (str): The text to be checked for plagiarism.

    Returns:
        dict: The JSON response from the RapidAPI.

    Raises:
        requests.exceptions.RequestException: For network or HTTP errors.
        ValueError: If API key or host are not configured.
        Exception: For unexpected errors.
    """
    if not RAPIDAPI_KEY or not PLAGIARISM_API_HOST:
        raise ValueError("RapidAPI key or host is not configured in environment variables.")

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": PLAGIARISM_API_HOST,
        "Content-Type": "application/x-www-form-urlencoded"
    }

    # The payload needs to be a dictionary for requests.post(data=payload)
    # when Content-Type is application/x-www-form-urlencoded
    payload = {
        "text": text_content # Assuming the API expects the text in a 'text_content' field
    }

    try:
        response = requests.post(PLAGIARISM_API_BASE_URL, data=payload, headers=headers)
        response.raise_for_status() # Raises HTTPError for bad responses (4xx or 5xx)

        # Assuming the API always returns valid JSON on success
        return response.json()

    except requests.exceptions.HTTPError as e:
        # Log the specific HTTP error and response content
        print(f"HTTP Error from RapidAPI: {e.response.status_code} - {e.response.text}")
        raise requests.exceptions.RequestException(f"RapidAPI HTTP Error: {e.response.status_code}") from e
    except requests.exceptions.ConnectionError as e:
        print(f"Connection Error to RapidAPI: {e}")
        raise requests.exceptions.RequestException("Could not connect to RapidAPI.") from e
    except requests.exceptions.Timeout as e:
        print(f"Timeout Error with RapidAPI: {e}")
        raise requests.exceptions.RequestException("RapidAPI request timed out.") from e
    except requests.exceptions.RequestException as e:
        print(f"An unexpected request error occurred with RapidAPI: {e}")
        raise requests.exceptions.RequestException(f"RapidAPI request failed: {e}") from e
    except json.JSONDecodeError as e:
        print(f"RapidAPI returned non-JSON response: {response.text}")
        raise ValueError("RapidAPI did not return valid JSON.") from e
    except Exception as e:
        print(f"An unexpected error occurred in check_plagiarism: {e}")
        raise # Re-raise unknown exceptions