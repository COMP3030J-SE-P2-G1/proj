from flask import Flask, request
from flask_babel import Babel, gettext, ngettext, lazy_gettext
from comp3030j.db import initialize_db
from comp3030j.views import bind_views
from .extensions import bcrypt, login_manager
import logging


def get_locale():
    return request.accept_languages.best_match(app.config['LANGUAGES'])


app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('config.py')

if not app.debug:
    # 指定日志的级别和格式
    logging.basicConfig(filename='app.log', level=logging.WARNING,
                        format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')

babel = Babel(app, locale_selector=get_locale)

# add functions for jinja template
app.jinja_env.globals.update(_tr=gettext, _ntr=ngettext, _ltr=lazy_gettext)

initialize_db(app)
bind_views(app)

bcrypt.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
