# Flask Cache related functions
from flask import request
from flask_login import current_user
from comp3030j.api.security import get_api_key_from_request_header

def make_key_post_json(*args, **kwargs):
    "Make cache key for POST application/json request."
    res = request.path
    data = request.get_json()
    res += "###" + ",".join([f"{key}={value}" for key, value in data.items()])
    return res

def make_key_post_json_user(*args, **kwargs):
    """Make cache key for POST application/json request considering user id or api key."""
    res = make_key_post_json()
    try:
        api_key = get_api_key_from_request_header()
        res += "###api_key=" + api_key
    except Exception as _:
        res += "###user_id=" + str(current_user.id)
        
    return res
