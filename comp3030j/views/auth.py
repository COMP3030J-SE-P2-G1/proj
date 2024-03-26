from flask import Blueprint, render_template, render_template, url_for, session, flash, redirect, request
from flask_login import current_user, login_user, logout_user, login_required
from comp3030j.db import db
from comp3030j.extensions import bcrypt
from comp3030j.db.User import User
from comp3030j.auth import RegistrationForm, LoginForm
from werkzeug.utils import secure_filename
from comp3030j.util import allowed_file
import os, uuid

bp = Blueprint("auth", __name__)


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
        flash(f'Account created for {form.username.data}!', 'success')
        flash('Your account has been created! You are now able to log in', 'success')
        return redirect(url_for('auth.login'))
    # Pass in the form
    return render_template("page/auth/register.j2", title='Register', form=form)


@bp.route('/login',
          # To accept get and post request from register route with the form data
          methods=['GET', 'POST'])
def login():
    # check if the user is already login
    if current_user.is_authenticated:
        return redirect(url_for('auth.profile'))
    form = LoginForm()
    if form.validate_on_submit():
        # Query our database to make sure the user exist
        user = User.query.filter_by(email=form.email.data).first()
        # conditional that simultaneously checks that the user exist and that their password verifies
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            # Back the user to the page they visited before login
            next_page = request.args.get('next')
            # Ternary conditional
            session['user_id'] = user.id
            return redirect(next_page) if next_page else redirect(url_for('auth.profile'))
        else:
            flash('Login Unsuccessful. Please check email and password', 'danger')
    return render_template("page/auth/login.j2", title='Login', form=form)


@bp.route('/logout')
def logout():
    logout_user()
    session.pop('user_id')
    return redirect(url_for('landing.hello'))


@bp.route('/profile')
#make sure the user login before they can access the acount page
def profile():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    return render_template("page/auth/profile/index.j2", form=User.query.filter_by(id=session['user_id']).first())


@bp.route('/image_edit', methods=['POST'])
def upload_picture():
    if 'image' not in request.files:
        flash('Can not find image')
        return redirect(request.url)
    file = request.files['image']
    if file.filename == '':
        flash('You have not selected a file')
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = User.query.filter_by(id=session['user_id']).first().avatar
        # remove the old avatar
        if filename:
            try:
                os.remove(os.path.join('static/profile_pics', filename))
            except FileNotFoundError:
                pass
        # generate the unique filename
        filename = secure_filename(file.filename)
        unique_filename = str(uuid.uuid4()) + os.path.splitext(filename)[1]
        # update the avatar in the database
        user_to_update = User.query.filter_by(id=session['user_id']).first()
        if user_to_update:
            user_to_update.avatar = unique_filename
            db.session.commit()
            # save the new avatar
            file.save(os.path.join('static/profile_pics', unique_filename))
            flash('Profile picture uploaded and saved')
            return 'Profile picture uploaded and saved' + unique_filename
        else:
            flash('Unavaiable Account')
            return 'Unavaiable Account'
    else:
        flash('Upload failed')
        return 'Upload failed'

@bp.route('/history')
def history():
    return render_template("page/auth/history/index.j2")
