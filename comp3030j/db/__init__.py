from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin

db = SQLAlchemy()


def initialize_db(app: Flask):
    db.init_app(app)

    from . import User, Profile, Solar, Usage, SEMSpot

    with app.app_context():
        db.create_all()
