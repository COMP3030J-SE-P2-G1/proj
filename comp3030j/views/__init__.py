from flask import Flask

def bind_views(app: Flask):
    from . import index
    app.register_blueprint(index.bp)
