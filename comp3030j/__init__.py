from flask import Flask, request
from flask_babel import Babel, gettext, ngettext, lazy_gettext
from flask_admin import Admin
from flask_caching import Cache
from comp3030j.db import initialize_db
from comp3030j.views import bind_views
from comp3030j.api import bind_apis
from .extensions import bcrypt, login_manager

from redis import Redis


def get_locale():
    return request.accept_languages.best_match(app.config['LANGUAGES'])


app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('config.py')

admin = Admin(app, name='COMP3030J', template_mode='bootstrap4')

r = Redis(host=app.config["CACHE_REDIS_HOST"], port=app.config["CACHE_REDIS_PORT"], db=app.config["CACHE_REDIS_PORT"],
          socket_connect_timeout=300)
try:
    r.ping()
    app.config["CACHE_TYPE"] = "RedisCache"
except:
    pass
print("[*] Flask Cache: Use `{}` strategy.".format(app.config["CACHE_TYPE"]))
r.close()

cache = Cache(app)
babel = Babel(app, locale_selector=get_locale)

# add functions for jinja template
app.jinja_env.globals.update(_tr=gettext, _ntr=ngettext, _ltr=lazy_gettext)

initialize_db(app)
bind_views(app)
bind_apis(app)

bcrypt.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
