from datetime import datetime, timedelta
from flask import Blueprint, redirect, render_template, request, session, flash, jsonify, url_for
from flask_login import login_required

from comp3030j.dashboard import ProfileForm
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
    # Check if the path is for creating a profile
    if path == "profile" or path == "visual/usage":
        # Check if the user is logged in
        if not session.get('user_id'):
            flash(_ltr('Please log in to create a profile.'), 'error')
            return redirect(url_for('auth.login'))  # Redirect to the login page if the user is not logged in
    if path == "profile" or path == "visual/usage":
        profileForm = ProfileForm()
        profiles = Profile.query.filter_by(user_id=session['user_id']).all()
        profiles_dic = {}
        for profile in profiles:
            profiles_dic[profile.id] = profile.name
        return render_template(f"page/dashboard/page/{path}.j2", profiles=profiles_dic, profileForm=profileForm)
    return render_template(f"page/dashboard/page/{path}.j2")


@bp.route('/create_profile', methods=['POST'])
@login_required
def create_profile():
    profileForm = ProfileForm()
    if profileForm.validate_on_submit():
        # Add profile to the database
        user_to_update = User.query.filter_by(id=session['user_id']).first()
        if user_to_update:
            file = request.files[profileForm.usage_file.name]
            usages = read_hourly_usage_csv(file)
            for timestamp, value in usages.items():
                if value is None:
                    flash(_ltr('Not allowed data in:' + str(timestamp)), 'error')
                    return jsonify(
                        {'status': 'error', 'message': 'Not allowed data in the file.' + str(timestamp)}), 400
            profileForm.start_time.data = datetime.strptime(str(profileForm.start_time.data) + " +01:00", "%Y-%m-%d %z")
            profileForm.end_time.data = datetime.strptime(str(profileForm.end_time.data) + " +01:00", "%Y-%m-%d %z")
            print(profileForm.end_time.data)
            profile = Profile(user_id=session['user_id'], name=profileForm.name.data, desc=profileForm.desc.data,
                              start_time=profileForm.start_time.data, end_time=profileForm.end_time.data,
                              lon=profileForm.lon.data, lat=profileForm.lat.data, tech=profileForm.tech.data,
                              loss=profileForm.loss.data, power=profileForm.power.data)
            db.session.add(profile)
            db.session.commit()
            # Add usage to the database
            for timestamp, value in usages.items():
                usage = Usage(time=timestamp, usage=value, profile_id=profile.id)
                db.session.add(usage)
            db.session.commit()
            flash(_ltr('Profile created successfully.'), 'success')
            return jsonify({'status': 'success', 'message': 'Profile created successfully'}), 200
        else:
            flash(_ltr('Unavailable Account.'), 'error')
            return jsonify({'status': 'error', 'message': 'Unavailable Account.'}), 400
    else:
        form_errors = {field: error[0] for field, error in profileForm.errors.items()}
        print(form_errors)
        return jsonify({'status': 'error', 'message': 'Validation errors', 'errors': form_errors}), 400

#
# @bp.route('/update_usage', methods=['POST'])
# @login_required
# def update_usage():
#     if 'file' not in request.files:
#         flash(_ltr('Upload failed'), 'error')
#         return jsonify({'status': 'error', 'message': 'File upload failure'}), 400
#     file = request.files['file']
#     filetype = allowed_file(file.filename)
#     if file and filetype:
#         # update the avatar in the database
#         user_to_update = User.query.filter_by(id=session['user_id']).first()
#         if user_to_update:
#             if filetype == "csv":
#                 usages = read_hourly_usage_csv(file)
#             profile = Profile(user_id=session['user_id'], name=str(file.filename.rsplit(".", 1)[0]),
#                               desc="Demo Profile")
#             db.session.add(profile)
#             db.session.commit()
#             for timestamp, value in usages.items():
#                 if value is None:
#                     flash(_ltr('Not allowed data in:' + str(timestamp)), 'error')
#                     return jsonify(
#                         {'status': 'error', 'message': 'Not allowed data in the file.' + str(timestamp)}), 400
#                 usage = Usage(time=timestamp, usage=value, profile_id=profile.id)
#                 db.session.add(usage)
#             db.session.commit()
#             flash(_ltr('Usage data uploaded and saved.'), 'success')
#             return jsonify({'status': 'success', 'message': 'Usage updated successfully'}), 200
#         else:
#             flash(_ltr('Unavailable Account.'), 'error')
#             return jsonify({'status': 'error', 'message': 'Unavailable Account.'}), 400
#     else:
#         flash(_ltr('Upload failed'), 'error')
#         return jsonify({'status': 'error', 'message': 'Validation errors', 'errors': "unsupported file"}), 400
