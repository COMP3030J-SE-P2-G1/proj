from flask import Blueprint, render_template, render_template, url_for, flash, redirect, request
from flask_login import current_user, login_user, logout_user, login_required
from comp3030j.db import db
from comp3030j.extensions import bcrypt
from comp3030j.db.User import User
from comp3030j.auth import RegistrationForm, LoginForm

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
    #Checks wether we have post data and that data is valid to the form
    if form.validate_on_submit():

        #hash the password they entered
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        auth = User(username=form.username.data, email=form.email.data, password=hashed_password)
        #Add auth to the database
        db.session.add(auth)
        db.session.commit()
        #Flash message: Easy way to send one time alert
        flash(f'Account created for {form.username.data}!','success')
        flash('Your account has been created! You are now able to log in','success')
        return redirect(url_for('auth.login'))
    #Pass in the form
    return render_template("page/auth/register.j2", title='Register',form=form)


@bp.route('/login',
          # To accept get and post request from register route with the form data
          methods=['GET', 'POST'])
def login():
    # check if the user is already logined
    if current_user.is_authenticated:
        return redirect(url_for('auth.profile'))
    form = LoginForm()
    if form.validate_on_submit():
        #Query our database to make sure the user exist
        user = User.query.filter_by(email=form.email.data).first()
        # conditional that simoutaneosly checks that the user exist and that their password veryfies
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user,remember=form.remember.data)
            # Back the user to the page they visited before login
            next_page = request.args.get('next')
            #Ternary conditional
            return redirect(next_page) if next_page else redirect(url_for('auth.profile'))
        else:
            flash('Login Unsuccessful. Please check email and password','danger')
    return render_template("page/auth/login.j2", title='Login',form=form)

@bp.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('auth.profile'))

@bp.route('/profile')
def profile():
    return render_template("page/auth/profile/index.j2")

@bp.route('/history')
def history():
    return render_template("page/auth/history/index.j2")
