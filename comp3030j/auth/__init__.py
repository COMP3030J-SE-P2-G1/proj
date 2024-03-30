# Python classes representative forms, then automatically be inverted in the html forms within  template

import re

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, ValidationError
from wtforms.validators import DataRequired, Length, Email, EqualTo
from flask_babel import gettext
from comp3030j.db.User import User
from comp3030j.extensions import bcrypt


class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=2, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('That username is taken. Please choose a different one.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('That email is taken. Please choose a different one.')

    def validate_password(self, password):
        if len(password.data) < 6:  # Check for minimum length
            raise ValidationError('The password must be at least 6 characters long.')
        if not re.search(r"\d", password.data):  # Checks for at least one digit
            raise ValidationError('The password must contain at least one digit.')
        if not re.search(r"[A-Za-z]", password.data):  # Checks for at least one letter
            raise ValidationError('The password must contain at least one alphabetic character.')


class LoginForm(FlaskForm):
    email = StringField(gettext('Email'), validators=[DataRequired(), Email()])
    password = PasswordField(gettext('Password'), validators=[DataRequired()])
    remember = BooleanField(gettext('Remember Me'))
    submit = SubmitField(gettext('Sign In'))

    def validate_password(self, field):
        user = User.query.filter_by(email=self.email.data).first()
        if user and not bcrypt.check_password_hash(user.password, field.data):
            raise ValidationError('Invalid password. Please try again.')


class ChangePassForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    OriginalPassword = PasswordField('Current Password', validators=[DataRequired()])
    password = PasswordField('New Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])

    def validate_password(self, password):
        if len(password.data) < 6:  # Check for minimum length
            raise ValidationError('The password must be at least 6 characters long.')
        if not re.search(r"\d", password.data):  # Checks for at least one digit
            raise ValidationError('The password must contain at least one digit.')
        if not re.search(r"[A-Za-z]", password.data):  # Checks for at least one letter
            raise ValidationError('The password must contain at least one alphabetic character.')

    def validate_original_password(self, email, OriginalPassword):
        user = User.query.filter_by(email=email.data).first()
        if not user and bcrypt.check_password_hash(user.password, OriginalPassword):
            raise ValidationError('Please check your password again!')
