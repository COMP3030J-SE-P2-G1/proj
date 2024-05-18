from flask import Flask
from flask import Blueprint


def bind_apis(app: Flask):
    from . import restful, graphql

    api = Blueprint("api", __name__, url_prefix="/api")

    restful_prefix = Blueprint("api/v1", __name__, url_prefix="/v1")
    restful_prefix.register_blueprint(restful.bp_security)
    restful_prefix.register_blueprint(restful.bp_data)
    restful_prefix.register_blueprint(restful.bp_user)
    restful_prefix.register_blueprint(restful.bp_profile)
    restful_prefix.register_blueprint(restful.bp_apikey_management)

    api.register_blueprint(restful_prefix)
    api.register_blueprint(graphql.bp)

    app.register_blueprint(api)
