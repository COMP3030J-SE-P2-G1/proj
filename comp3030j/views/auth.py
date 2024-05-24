import os
import uuid

from flask import Blueprint, render_template, url_for, flash, redirect, request, jsonify
from flask_login import current_user, login_user, logout_user, login_required
from werkzeug.utils import secure_filename

from comp3030j.auth import RegistrationForm, LoginForm, ChangePassForm
from comp3030j.db import db
from comp3030j.db.User import User
from comp3030j.db.Profile import Profile
from comp3030j.extensions import bcrypt
from comp3030j.util import allowed_img, save_file, delete_file, _ltr, resize_img

bp = Blueprint("auth", __name__, url_prefix="/auth")


# Registration Form route
@bp.route('/register',
          # To accept get and post request from register route with the form data
          methods=['GET', 'POST'])
def register():
    # check if the auth is already registered
    if current_user.is_authenticated:
        return redirect(url_for('auth.profile'))
    # An instance of the form that going to send application 
    form = RegistrationForm()
    # Checks whether we have post data and that data is valid to the form
    if form.validate_on_submit():
        # hash the password they entered
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        auth = User(username=form.username.data, email=form.email.data, password=hashed_password)
        # Add auth to the database
        db.session.add(auth)
        db.session.commit()
        # Flash message: Easy way to send one time alert
        flash(_ltr('Your account has been created! You are now able to log in.'), 'success')
        return redirect(url_for('auth.login'))
    # Pass in the form
    return render_template("page/auth/register.j2", title='Register', form=form)


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('auth.profile'))
    form = LoginForm()
    if form.validate_on_submit():
        # Query our database to make sure the user exist
        user = User.query.filter_by(email=form.email.data).first()
        # conditional that simultaneously checks that the user exist and that their password verifies
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            user.update_last_login()  # 更新最后登录时间
            login_user(user, remember=form.remember.data)
            # Back the user to the page they visited before login
            next_page = request.args.get('next')
            # # Ternary conditional
            return redirect(next_page) if next_page else redirect(url_for('auth.profile'))
    else:
        if 'next' in request.args and request.args.get('next') == url_for('auth.profile'):
            flash(_ltr('Please login first.'), 'error')
    return render_template("page/auth/login.j2", title='Login', form=form)


@bp.route('/logout')
def logout():
    logout_user()
    return render_template("page/landing/index.j2")


@bp.route('/profile')
# make sure the user login before they can access the account page
@login_required
def profile():
    if not current_user.is_authenticated:
        return redirect(url_for('auth.login'))
    password = ChangePassForm()
    return render_template("page/auth/profile/index.j2", form=current_user, password=password)


@bp.route('/image_edit', methods=['POST'])
@login_required
def upload_picture():
    if 'file' not in request.files:
        return redirect(url_for('auth.profile'))
    file = request.files['file']
    if file and allowed_img(file.filename):
        filename = current_user.avatar_file
        # remove the old avatar
        if filename != 'default.jpg':
            delete_file('static/profile_pics', filename)

        # resize the avatar image to 200x200s
        image = resize_img(file)

        # generate the unique filename
        extension = os.path.splitext(file.filename)[1]
        unique_filename = str(uuid.uuid4()) + extension

        # update the avatar in the database
        user_to_update = current_user
        if user_to_update:
            user_to_update.avatar_file = unique_filename
            db.session.commit()
            # save the new avatar
            print(unique_filename)
            save_file(image, 'static/profile_pics', unique_filename)
            flash(_ltr('Profile picture uploaded and saved.'), 'success')
        else:
            flash(_ltr('Unavailable Account.'), 'error')
    else:
        flash(_ltr('Upload failed'), 'error')
    return redirect(url_for('auth.profile'))


@bp.route('/change_password', methods=['POST'])
@login_required
def change_pass():
    password = ChangePassForm()
    if password.validate_on_submit():
        # Query our database to make sure the user exist
        user = current_user
        hashed_password = bcrypt.generate_password_hash(password.password.data).decode('utf-8')
        user.password = hashed_password
        db.session.commit()
        flash(_ltr('Password updated successfully.'), 'success')
        return jsonify({'status': 'success', 'message': 'Password updated successfully'}), 200
    form_errors = {field: error[0] for field, error in password.errors.items()}
    return jsonify({'status': 'error', 'message': 'Validation errors', 'errors': form_errors}), 400


@bp.route('/history')
def history():
    profiles = Profile.query.filter_by(user_id=current_user.id).all()
    return render_template("page/auth/history/index.j2", profiles=profiles, form=current_user)
