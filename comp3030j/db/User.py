from . import db
from comp3030j.extensions import login_manager
from flask_login import UserMixin


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String)
    password = db.Column(db.String(60), nullable=False)
    avatar = db.Column(db.String(255), unique=True)

    def __repr__(self):
        return f"User('{self.username}','{self.email}'"
