from comp3030j.db import db
from comp3030j.db.Profile import Profile
from flask import Blueprint
from flask_login import current_user
from flask import current_app

bp = Blueprint("api/profile", __name__, url_prefix="/profile")

@bp.route('/<int:id>')
def profile(id):
    profile = db.session.scalar(
        db.select(Profile)
        .filter_by(id=id))
    if not profile:
        return { "code": 1, "errorMsg": "No corresponding resource"}, 400
    elif profile.u_id < 1000: # public data: user_id < 1000 (typically 0)
        # TODO to json? 
        return profile
    elif not current_user.is_authenticated:
        # this is what flask_login's `login_required` decorator do
        return current_app.login_manager.unauthorized()
    elif current_user.id == profile.u_id:
        # TODO
        return profile
    
    return { "code": 1, "errorMsg": "El Psy Congroo" }, 400

        

