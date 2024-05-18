from comp3030j import cache
from flask import Blueprint, request, jsonify
from . import profile, data, security, user, decorators, apikey_management
from .security import auth_guard
from typing import Tuple, Any  # Python 3.8 compatibility
from flask_login import login_required
from comp3030j.util.cache import make_key_post_json_user, make_key_post_json
from comp3030j.db.User import User
from comp3030j.db.apikey import ApiKey
from typing import Union

bp_security = Blueprint("api/v1/security", __name__, url_prefix="/security")
bp_data = Blueprint("api/v1/data", __name__, url_prefix="/data")
bp_user = Blueprint("api/v1/user", __name__, url_prefix="/user")
bp_profile = Blueprint("api/v1/profile", __name__, url_prefix="/profile")
bp_apikey_management = Blueprint("api/v1/apikey", __name__, url_prefix="/apikey")


def _return(ret: Tuple[Any, Any], process=None):
    res, response = ret
    if response and not (isinstance(response, int) and response // 100 == 2):
        return response
    return process(res) if process else res


def _return_dict(ret: Tuple[Any, Any]):
    return _return(ret, lambda res: res.to_dict())


def _return_jsonify(ret: Tuple[Any, Any]):
    return _return(ret, lambda res: jsonify(res))


@bp_profile.route("/<int:id>")
@auth_guard()
def profile_profile(id):
    return _return_dict(decorators.get_profile(id))


@bp_profile.route("/<int:id>/usage", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json_user)
def profile_usage(id):
    return _return_jsonify(profile.usage_route(id, request.json))


@bp_profile.route("/<int:id>/solar", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json_user)
def profile_solar(id):
    return _return_jsonify(profile.solar_route(id, request.json))


@bp_profile.route("/<int:id>/saving", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json_user)
def profile_saving(id):
    return _return_jsonify(profile.saving_route(id, request.json))


@bp_data.route("/sems", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json)
def data_semspot():
    return _return_jsonify(data.semspot_route(request.json))


@bp_security.route("/create_api_key")
@login_required
def security_create_api_key():
    return _return_dict(security.create_api_key())

@bp_user.route("/profiles")
@auth_guard(return_auth=True)
def user_profiles(auth: Union[User, ApiKey]):
    return _return(user.profiles(auth))

@bp_apikey_management.route("/list")
@auth_guard(return_auth=True)
def apikey_management_list(auth: Union[User, ApiKey]):
    return _return(apikey_management.list_apikeys(auth))

# curl -H 'Authorization: Bearer wwwwww' --json '{"desc": "test"}' http://localhost:5000/api/v1/apikey/create
@bp_apikey_management.route("/create", methods=["POST"])
@auth_guard(return_auth=True)
def apikey_management_create(auth: Union[User, ApiKey]):
    desc = None if 'desc' not in request.json else request.json['desc']
    return _return_dict(apikey_management.create_apikey(auth, desc))

# curl -H 'Authorization: Bearer wwwwww' "http://localhost:5000/api/v1/apikey/delete?token=xxxxxxx"
@bp_apikey_management.route("/<int:id>/delete")
@auth_guard(return_auth=True)
def apikey_management_delete(auth: Union[User, ApiKey], id: int):
    return _return(apikey_management.delete_apikey(auth, id))

@bp_apikey_management.route("/<int:id>/enable")
@auth_guard(return_auth=True)
def apikey_management_enable(auth: Union[User, ApiKey], id: int):
    return _return(apikey_management.set_key_enable_status(auth, id, True))

@bp_apikey_management.route("/<int:id>/disable")
@auth_guard(return_auth=True)
def apikey_management_disable(auth: Union[User, ApiKey], id: int):
    return _return(apikey_management.set_key_enable_status(auth, id, False))

