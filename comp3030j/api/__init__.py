from flask import Flask
from flask import Blueprint

def bind_apis(app: Flask):
    from . import user, profile
    
    bp = Blueprint("api", __name__, url_prefix="/api")
    bp.register_blueprint(user.bp)
    bp.register_blueprint(profile.bp)
    
    app.register_blueprint(bp)

