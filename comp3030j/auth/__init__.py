# Python classes representative forms, then automatically be inverted in the html forms within  template

import re

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, ValidationError
from wtforms.validators import DataRequired, Length, Email, EqualTo
from comp3030j.db.User import User
from comp3030j.extensions import bcrypt
from comp3030j.util import _ltr


class RegistrationForm(FlaskForm):
    username = StringField(_ltr('Username'), validators=[DataRequired(), Length(min=2, max=20)])
    email = StringField(_ltr('Email'), validators=[DataRequired(), Email()])
    password = PasswordField(_ltr('Password'), validators=[DataRequired()])
    confirm_password = PasswordField(_ltr('Confirm Password'), validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField(_ltr('Sign Up'))

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
            raise ValidationError(_ltr('The password must be at least 6 characters long.'))
        if not re.search(r"\d", password.data):  # Checks for at least one digit
            raise ValidationError(_ltr('The password must contain at least one digit.'))
        if not re.search(r"[A-Za-z]", password.data):  # Checks for at least one letter
            raise ValidationError(_ltr('The password must contain at least one alphabetic character.'))


class LoginForm(FlaskForm):
    email = StringField(_ltr('Email'), validators=[DataRequired(), Email()])
    password = PasswordField(_ltr('Password'), validators=[DataRequired()])
    remember = BooleanField(_ltr('Remember Me'))
    submit = SubmitField(_ltr('Sign In'))

    def validate_password(self, field):
        user = User.query.filter_by(email=self.email.data).first()
        if user and not bcrypt.check_password_hash(user.password, field.data):
            raise ValidationError(_ltr('Invalid password. Please try again.'))


class ChangePassForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    OriginalPassword = PasswordField('Current Password', validators=[DataRequired()])
    password = PasswordField('New Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])

    def validate_password(self, password):
        if len(password.data) < 6:  # Check for minimum length
            raise ValidationError(_ltr('The password must be at least 6 characters long.'))
        if not re.search(r"\d", password.data):  # Checks for at least one digit
            raise ValidationError(_ltr('The password must contain at least one digit.'))
        if not re.search(r"[A-Za-z]", password.data):  # Checks for at least one letter
            raise ValidationError(_ltr('The password must contain at least one alphabetic character.'))

    def validate_original_password(self, email, OriginalPassword):
        user = User.query.filter_by(email=email.data).first()
        if not user and bcrypt.check_password_hash(user.password, OriginalPassword):
            raise ValidationError(_ltr('Please check your password again!'))

        
