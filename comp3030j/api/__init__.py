from flask import Flask
from flask import Blueprint


def bind_apis(app: Flask):
    from . import user, profile, data, security

    bp = Blueprint("api/v1", __name__, url_prefix="/api/v1")
    bp.register_blueprint(user.bp)
    bp.register_blueprint(profile.bp)
    bp.register_blueprint(data.bp)
    bp.register_blueprint(security.bp)

    app.register_blueprint(bp)
