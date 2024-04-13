from flask import Blueprint, render_template, request, session, flash
from flask_login import login_required
from werkzeug.utils import secure_filename
from comp3030j.db.User import User
from comp3030j.util import allowed_file, _ltr

bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@bp.route('/')
def dashboard():
    return render_template("page/dashboard/layout1/index.j2")


@bp.route('/<path:path>')
def serve_static(path):
    return render_template(f"page/dashboard/page/{path}.j2")


@bp.route('/update_usage', methods=['POST'])
@login_required
def update_usage():
    if 'file' not in request.files:
        return render_template(f"page/dashboard/page/usage.j2")
    file = request.files['file']
    if file and allowed_file(file.filename):
        # generate the unique filename
        filename = secure_filename(file.filename)
        # update the avatar in the database
        user_to_update = User.query.filter_by(id=session['user_id']).first()
        if user_to_update:
            flash(_ltr('Profile picture uploaded and saved.'), 'success')
        else:
            flash(_ltr('Unavailable Account.'), 'error')
    else:
        flash(_ltr('Upload failed'), 'error')
    return render_template(f"page/dashboard/page/usage.j2")
