import json
from functools import wraps
from flask import request, jsonify
from app.extensions import redis_client

def cache_response(timeout=300):
    """
    Decorator to cache Flask API responses in Redis.
    Key is based on request path and query string.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Skip caching if Redis is not available
            try:
                if not redis_client:
                    return f(*args, **kwargs)
            except Exception:
                return f(*args, **kwargs)

            # Generate unique cache key based on path and query parameters
            # e.g. view:/api/doctors:page=1&sort=name
            query_string = request.query_string.decode('utf-8')
            cache_key = f"view:{request.path}:{query_string}"
            
            try:
                # Check cache
                cached_data = redis_client.get(cache_key)
                if cached_data:
                    data = json.loads(cached_data)
                    # Return cached response
                    return jsonify(data), 200
            except Exception as e:
                # If Redis read fails, just proceed to DB
                print(f"Cache read error: {e}")

            # Execute the original view function
            response = f(*args, **kwargs)
            
            # Helper to extract data and status code
            resp_obj = response
            status_code = 200
            
            if isinstance(response, tuple):
                resp_obj = response[0]
                if len(response) > 1:
                    status_code = response[1]
            
            # Only cache successful 200 responses
            if status_code == 200:
                try:
                    # Extract JSON data from Response object or dict
                    data_to_cache = None
                    
                    if hasattr(resp_obj, 'get_json'):
                        # It's a Flask Response object (from jsonify)
                        data_to_cache = resp_obj.get_json()
                    elif isinstance(resp_obj, dict):
                        # It's a dictionary
                        data_to_cache = resp_obj
                        
                    if data_to_cache is not None:
                        redis_client.setex(
                            cache_key,
                            timeout,
                            json.dumps(data_to_cache)
                        )
                except Exception as e:
                    print(f"Cache write error: {e}")
            
            return response
            
        return decorated_function
    return decorator
