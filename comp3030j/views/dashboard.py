from datetime import datetime, timedelta
from flask import Blueprint, redirect, render_template, request, session, flash, jsonify, send_file
from flask_login import login_required, current_user

from comp3030j.dashboard import ProfileForm
from comp3030j.db import db
from comp3030j.db.Profile import Profile
from comp3030j.db.Usage import Usage
from comp3030j.db.User import User
from comp3030j.util import _ltr, read_hourly_usage_csv

bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@bp.route('/')
@login_required
def dashboard():
    return render_template("page/dashboard/layout1/index.j2", form=current_user)

@bp.route('/<path:path>')
@login_required
def render_subpage(path):
    if path == "profile":
        return render_profile_subpage(path)
    if path == "index":
        return render_index_subpage(path)
    return render_template(f"page/dashboard/page/{path}.j2")


def render_profile_subpage(path):
    profileForm = ProfileForm()
    profiles = Profile.query.filter_by(user_id=current_user.id).all()
    profiles_dic = {}
    for profile in profiles:
        profiles_dic[profile.id] = profile.name
    return render_template(f"page/dashboard/page/{path}.j2", profiles=profiles_dic, profileForm=profileForm)


def render_index_subpage(path):
    profiles = Profile.query.filter_by(user_id=current_user.id).all()
    profiles_dic = {}
    for profile in profiles:
        profiles_dic[profile.id] = profile.name
    return render_template(f"page/dashboard/page/{path}.j2", profiles_amount=len(profiles_dic))


@bp.route('/create_profile', methods=['POST'])
@login_required
def create_profile():
    profileForm = ProfileForm()
    if profileForm.validate_on_submit():
        # Add profile to the database
        user_to_update = User.query.filter_by(id=current_user.id).first()
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
            profile = Profile(user_id=current_user.id, name=profileForm.name.data, desc=profileForm.desc.data,
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


@bp.route('/download_template', methods=['Get'])
@login_required
def download_templates():
    return send_file('static/demo_2023.csv', as_attachment=True)
