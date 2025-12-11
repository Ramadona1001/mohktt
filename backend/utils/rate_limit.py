"""
Rate limiting utilities for views.
"""
from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status


def rate_limit(key_func, rate='5/m', method='GET'):
    """
    Rate limiting decorator for views.
    
    Args:
        key_func: Function to generate cache key (usually based on user/IP)
        rate: Rate limit string (e.g., '5/m' for 5 per minute)
        method: HTTP method to apply rate limit to
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if request.method != method:
                return view_func(request, *args, **kwargs)
            
            # Parse rate limit
            limit, period = rate.split('/')
            limit = int(limit)
            period_map = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}
            period_seconds = period_map.get(period.lower(), 60)
            
            # Generate cache key
            cache_key = f"rate_limit:{key_func(request)}:{view_func.__name__}"
            
            # Check current count
            current = cache.get(cache_key, 0)
            if current >= limit:
                if hasattr(request, 'user') and request.user.is_authenticated:
                    return Response(
                        {'detail': 'Rate limit exceeded. Please try again later.'},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
                else:
                    return JsonResponse(
                        {'detail': 'Rate limit exceeded. Please try again later.'},
                        status=429
                    )
            
            # Increment counter
            cache.set(cache_key, current + 1, period_seconds)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def get_client_ip(request):
    """Get client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_key(request):
    """Generate rate limit key based on user."""
    if hasattr(request, 'user') and request.user.is_authenticated:
        return f"user:{request.user.id}"
    return f"ip:{get_client_ip(request)}"

