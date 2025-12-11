"""
Enhanced input validation utilities for the Mukhattat project.
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError(_('Enter a valid email address.'))
    return email


def validate_phone_number(phone):
    """Validate phone number format."""
    # Remove spaces, dashes, and parentheses
    phone = re.sub(r'[\s\-\(\)]', '', phone)
    # Check if it's a valid phone number (10-15 digits, may start with +)
    pattern = r'^\+?[1-9]\d{9,14}$'
    if not re.match(pattern, phone):
        raise ValidationError(_('Enter a valid phone number.'))
    return phone


def validate_password_strength(password):
    """Validate password strength."""
    if len(password) < 8:
        raise ValidationError(_('Password must be at least 8 characters long.'))
    if not re.search(r'[A-Z]', password):
        raise ValidationError(_('Password must contain at least one uppercase letter.'))
    if not re.search(r'[a-z]', password):
        raise ValidationError(_('Password must contain at least one lowercase letter.'))
    if not re.search(r'\d', password):
        raise ValidationError(_('Password must contain at least one digit.'))
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValidationError(_('Password must contain at least one special character.'))
    return password


def validate_file_size(file, max_size_mb=50):
    """Validate file size."""
    max_size_bytes = max_size_mb * 1024 * 1024
    if file.size > max_size_bytes:
        raise ValidationError(_(f'File size must not exceed {max_size_mb}MB.'))
    return file


def validate_file_type(file, allowed_types):
    """Validate file type."""
    file_extension = file.name.split('.')[-1].lower()
    if file_extension not in allowed_types:
        raise ValidationError(_(f'File type not allowed. Allowed types: {", ".join(allowed_types)}'))
    return file


def sanitize_input(text, max_length=None):
    """Sanitize user input to prevent XSS attacks."""
    if not isinstance(text, str):
        return text
    
    # Remove potentially dangerous characters
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE)
    
    if max_length and len(text) > max_length:
        text = text[:max_length]
    
    return text


def validate_coordinates(x, y):
    """Validate blueprint coordinates (0-1 range)."""
    if not (0 <= x <= 1):
        raise ValidationError(_('X coordinate must be between 0 and 1.'))
    if not (0 <= y <= 1):
        raise ValidationError(_('Y coordinate must be between 0 and 1.'))
    return x, y


def validate_positive_number(value, field_name='Value'):
    """Validate that a number is positive."""
    if value < 0:
        raise ValidationError(_(f'{field_name} must be a positive number.'))
    return value

