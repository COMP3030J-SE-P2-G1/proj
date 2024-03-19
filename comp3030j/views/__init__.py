from flask import Flask

def bind_views(app: Flask):
    from . import landing
    from . import dashboard
    
    app.register_blueprint(landing.bp)
    app.register_blueprint(dashboard.bp)
