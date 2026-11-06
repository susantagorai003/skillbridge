"""
Custom exception handler for consistent API error responses.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Custom exception handler for consistent error format."""
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'errors': {},
        }

        if isinstance(response.data, dict):
            if 'detail' in response.data:
                error_data['errors']['detail'] = str(response.data['detail'])
            else:
                error_data['errors'] = response.data
        elif isinstance(response.data, list):
            error_data['errors']['detail'] = response.data
        else:
            error_data['errors']['detail'] = str(response.data)

        response.data = error_data

    return response
