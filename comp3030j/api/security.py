from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from comp3030j.db.apikey import ApiKey
from functools import wraps
from typing import Union

def is_valid(token) -> Union[ApiKey, bool]:
    apikey = ApiKey.find_by_token(token)
    if apikey and apikey.enabled:
        return apikey
    return False


def get_api_key_from_request_header():
    """Note: use try catch."""
    return request.headers.get("Authorization").split("Bearer ")[1].strip()


def auth_guard(return_auth: bool = False):
    """
    An decorator for those end points requires either user session login
    (@login_required) or api_key
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # compatibility with flask_login's login_required decorator
            if current_user.is_authenticated:
                if return_auth:
                    return func(current_user, *args, **kwargs)
                else:
                    return func(*args, **kwargs)

            # Authentication gate
            try:
                raw_api_key = get_api_key_from_request_header()
            except Exception as _:
                return {"errorMsg": "Missing access token"}, 401

            api_key = is_valid(raw_api_key)
            if api_key:
                api_key.update_last_used_time()
                if return_auth:
                    return func(api_key, *args, **kwargs)
                else:
                    return func(*args, **kwargs)
            else:
                return {"message": "The provided API key is not valid"}, 403

        return wrapper

    return decorator

def create_api_key():
    new_api_key = ApiKey(current_user.id)
    new_api_key.save_to_db()
    return new_api_key, 201
