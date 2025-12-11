"""
Enhanced logging middleware for request/response logging.
"""
import logging
import time
import json
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all HTTP requests and responses with detailed information.
    """
    
    def process_request(self, request):
        """Log incoming request."""
        request.start_time = time.time()
        
        # Log request details
        log_data = {
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.GET),
            'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
        
        # Log request body for POST/PUT/PATCH (excluding sensitive data)
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                body = json.loads(request.body.decode('utf-8')) if request.body else {}
                # Remove sensitive fields
                sensitive_fields = ['password', 'token', 'secret', 'key', 'authorization']
                sanitized_body = {
                    k: '***' if any(sensitive in k.lower() for sensitive in sensitive_fields) else v
                    for k, v in body.items()
                }
                log_data['request_body'] = sanitized_body
            except (json.JSONDecodeError, UnicodeDecodeError):
                log_data['request_body'] = 'Unable to parse request body'
        
        logger.info(f"Request: {json.dumps(log_data, indent=2)}")
    
    def process_response(self, request, response):
        """Log outgoing response."""
        duration = time.time() - getattr(request, 'start_time', time.time())
        
        log_data = {
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'duration_ms': round(duration * 1000, 2),
            'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
        }
        
        # Log response data for errors
        if response.status_code >= 400:
            try:
                if hasattr(response, 'data'):
                    log_data['error_data'] = str(response.data)
                elif hasattr(response, 'content'):
                    content = response.content.decode('utf-8')[:500]  # Limit to 500 chars
                    log_data['error_content'] = content
            except Exception:
                pass
        
        if response.status_code >= 500:
            logger.error(f"Response: {json.dumps(log_data, indent=2)}")
        elif response.status_code >= 400:
            logger.warning(f"Response: {json.dumps(log_data, indent=2)}")
        else:
            logger.info(f"Response: {json.dumps(log_data, indent=2)}")
        
        return response
    
    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

