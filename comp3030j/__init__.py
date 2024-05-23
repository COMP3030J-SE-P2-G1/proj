from flask import Flask, request
from flask_babel import Babel, gettext, ngettext, lazy_gettext, refresh
from flask_caching import Cache
from comp3030j.db import initialize_db
from comp3030j.views import bind_views
from comp3030j.api import bind_apis
from .extensions import bcrypt, login_manager
from flask import Flask, request, session, jsonify, g

from redis import Redis

def get_locale():
    if request.args.get('language'):
        session['language'] = request.args.get('language')
    res = session.get('language', request.accept_languages.best_match(app.config['LANGUAGES']))
    return res


app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('config.py')

r = Redis(host=app.config["CACHE_REDIS_HOST"], port=app.config["CACHE_REDIS_PORT"], db=app.config["CACHE_REDIS_PORT"], socket_connect_timeout=300)
try:
    r.ping()
    app.config["CACHE_TYPE"] = "RedisCache"
except:
    pass
print("[*] Flask Cache: Use `{}` strategy.".format(app.config["CACHE_TYPE"]))
r.close()

cache = Cache(app)
babel = Babel(app, locale_selector=get_locale)

def get_locale():
    if request.args.get('language'):
        session['language'] = request.args.get('language')
    res = session.get('language', request.accept_languages.best_match(app.config['LANGUAGES']))
    return res


# add functions for jinja template
app.jinja_env.globals.update(_tr=gettext, _ntr=ngettext, _ltr=lazy_gettext)

initialize_db(app)
bind_views(app)
bind_apis(app)

bcrypt.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@app.route('/misc/set-language=<language>')
def set_language(language):
    session['language'] = language
    return jsonify({"message": "success"})

@app.route('/misc/get-language')
def get_session_language():
    lang = None if 'language' not in session else session['language']
    return jsonify(lang)
