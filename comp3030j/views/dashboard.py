from flask import Blueprint, render_template, request, session, flash, jsonify
from flask_login import login_required

from comp3030j.db import db
from comp3030j.db.Profile import Profile
from comp3030j.db.Usage import Usage
from comp3030j.db.User import User
from comp3030j.util import allowed_file, _ltr, read_hourly_usage_csv

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
        flash(_ltr('Upload failed'), 'error')
        return jsonify({'status': 'error', 'message': 'File upload failure'}), 400
    file = request.files['file']
    filetype = allowed_file(file.filename)
    if file and filetype:
        # update the avatar in the database
        user_to_update = User.query.filter_by(id=session['user_id']).first()
        if user_to_update:
            if filetype == "csv":
                usages = read_hourly_usage_csv(file)
            profile = Profile(user_id=session['user_id'], name=str(file.filename.rsplit(".", 1)[0]), desc="Demo Profile")
            db.session.add(profile)
            db.session.commit()
            for timestamp, value in usages.items():
                if value is None:
                    flash(_ltr('Not allowed data in:' + str(timestamp)), 'error')
                    return jsonify({'status': 'error', 'message': 'Not allowed data in the file.' + str(timestamp)}), 400
                usage = Usage(time=timestamp, usage=value, profile_id=profile.id)
                db.session.add(usage)
            db.session.commit()
            flash(_ltr('Usage data uploaded and saved.'), 'success')
            return jsonify({'status': 'success', 'message': 'Usage updated successfully'}), 200
        else:
            flash(_ltr('Unavailable Account.'), 'error')
            return jsonify({'status': 'error', 'message': 'Unavailable Account.'}), 400
    else:
        flash(_ltr('Upload failed'), 'error')
        return jsonify({'status': 'error', 'message': 'Validation errors', 'errors': "unsupported file"}), 400
