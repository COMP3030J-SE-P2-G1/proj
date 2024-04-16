from flask import Flask


def bind_views(app: Flask):
    from . import landing
    from . import dashboard
    from . import auth
    from . import misc

    app.register_blueprint(landing.bp)
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(misc.bp)
