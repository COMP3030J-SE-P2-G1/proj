from comp3030j.db import db
from comp3030j.db.Profile import Profile
from flask import Blueprint
from flask_login import current_user, login_required

bp = Blueprint("api/user", __name__, url_prefix="/user")

@bp.route('/profiles')
@login_required
def profiles():
    profiles = db.session.scalars(
        db.select(Profile)
        .filter_by(u_id=current_user.id)).all()
    return profiles
    
