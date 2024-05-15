from comp3030j import cache
from flask import Blueprint, request, jsonify
from . import profile, data, security, user
from .security import auth_guard
from flask_login import login_required
from comp3030j.util.cache import make_key_post_json_user, make_key_post_json
from comp3030j.db.User import User
from comp3030j.db.apikey import ApiKey
from typing import Union

bp_security = Blueprint("api/v1/security", __name__, url_prefix="/security")
bp_data = Blueprint("api/v1/data", __name__, url_prefix="/data")
bp_user = Blueprint("api/v1/user", __name__, url_prefix="/user")
bp_profile = Blueprint("api/v1/profile", __name__, url_prefix="/profile")

def _return(ret: tuple[any, any], process = None):
    res, response = ret
    if response and not (isinstance(response, int) and response // 100 == 2):
        return response
    return process(res) if process else res

def _return_dict(ret: tuple[any, any]):
    return _return(ret, lambda res: res.to_dict())

def _return_jsonify(ret: tuple[any, any]):
    return _return(ret, lambda res: jsonify(res))

@bp_profile.route("/<int:id>")
@auth_guard()
def profile_profile(id):
    return _return_dict(profile.get_profile(id))

@bp_profile.route("/<int:id>/usage", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json_user)
def profile_usage(id):
    return _return_jsonify(profile.usage(id, request.json))

@bp_profile.route("/<int:id>/solar", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json_user)
def profile_solar(id):
    return _return_jsonify(profile.solar(id, request.json))

@bp_data.route("/sems", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json)
def data_semspot():
    return _return_jsonify(data.semspot(request.json))

@bp_security.route("/create_api_key")
@login_required
def security_create_api_key():
    return _return_dict(security.create_api_key())


@bp_user.route("/profiles")
@auth_guard(return_auth=True)
def user_profiles(auth: Union[User, ApiKey]):
    return _return(user.profiles(auth))

