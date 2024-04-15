from comp3030j.db import db
from comp3030j.db.Profile import Profile
from comp3030j.db.Usage import Usage
from flask_login import current_user
from flask import Blueprint, current_app, request, jsonify

bp = Blueprint("api/profile", __name__, url_prefix="/profile")


def get_profile(id):
    """
    Utility function to check get a profile.
    Returns a tuple (profile, response) where:
    - profile is the profile object if accessible, otherwise None
    - response is None if access is granted, otherwise an error response
    """
    # return Profile(id = 1, u_id = 2, usage_id = 3, solar_id = 4), None
    profile = db.session.scalar(db.select(Profile).filter_by(id=id))
    if not profile:
        return None, ({"code": 1, "errorMsg": "No corresponding resource"}, 400)
    elif profile.user_id < 1000:  # public data: user_id < 1000 (typically 0)
        return profile, None
    elif not current_user.is_authenticated:
        return None, current_app.login_manager.unauthorized()
    elif current_user.id == profile.u_id:
        return profile, None
    else:
        return None, ({"code": 2, "errorMsg": "Unauthorized access"}, 403)


@bp.route("/<int:id>")
def profile(id):
    profile, response = get_profile(id)
    if response:
        return response

    return profile.to_dict()


@bp.route("/<int:id>/usage", methods=["POST"])
def usage(id):
    profile, response = get_profile(id)
    if response:  # for some reason user profile is not available
        return response
    # result = db.session.execute(db.select(Usage).filter_by(profile_id=profile.id))
    # if not result:
    #     return ({"code": 3, "errorMsg": "No usage data for given profile"}, 400)
    # return jsonify(result.all())

    if len(profile.usage) == 0:
        return ({"code": 1, "errorMsg": "No corresponding resource"}, 400)
    return profile.usage.to_dict()


@bp.route("/<int:id>/solar")
def solar(id):
    profile, response = get_profile(id)
    if response:  # for some reason user profile is not available
        return response

    if len(profile.solar) == 0:
        return ({"code": 1, "errorMsg": "No corresponding resource"}, 400)
    return profile.solar.to_dict()
    # return {"code": 9999, "errorMsg": "Not implemented"}, 400
