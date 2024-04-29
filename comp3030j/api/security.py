from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from comp3030j.db.apikey import ApiKey
from functools import wraps

bp = Blueprint("api/security", __name__, url_prefix="/security")

def is_valid(token):
    apikey = ApiKey.find_by_token(token)
    if apikey:
        return True
    return False

def auth_guard(func):
    """
    An decorator for those end points requires either user session login
    (@login_required) or api_key
    """
    @wraps(func)
    def decorator(*args, **kwargs):
        # compatibility with flask_login's login_required decorator
        if current_user.is_authenticated:
            return func(*args, **kwargs)
            
        # Authentication gate
        try:
            api_key = request.headers.get('Authorization').split('Bearer ')[1].strip()
        except Exception as _:
            return {"errorMsg": "Missing access token"}, 401
        
        if is_valid(api_key):
            return func(*args, **kwargs)
        else:
            return {"message": "The provided API key is not valid"}, 403
    return decorator


@bp.route("/create_api_key")
@login_required
def create_api_key():
    new_api_key = ApiKey(current_user.id)
    new_api_key.save_to_db()
    return new_api_key.to_dict(), 201
