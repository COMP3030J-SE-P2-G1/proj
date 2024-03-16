from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# from flask_login import LoginManager
# from flask_bcrypt import Bcrypt


# app = Flask(__name__)

db = SQLAlchemy()

# login_manager = LoginManager(app)
# bcrypt = Bcrypt(app)



def initialize_db(app: Flask):
    db.init_app(app)
    
    from . import User
    
    with app.app_context():
        db.create_all()
        

