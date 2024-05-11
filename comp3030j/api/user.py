from comp3030j.db import db
from comp3030j.db.Profile import Profile
from comp3030j.db.apikey import ApiKey
from comp3030j.db.User import User
from flask import Blueprint, jsonify
from flask_login import current_user, login_required
from .security import auth_guard
from typing import Union

def profiles(auth: Union[User, ApiKey]):
    user = auth if isinstance(auth, User) else auth.user
    return [profile.to_dict() for profile in user.profiles], None
