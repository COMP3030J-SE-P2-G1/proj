from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def initialize_db(app: Flask):
    db.init_app(app)
    
    from . import User
    
    with app.app_context():
        db.create_all()
        

