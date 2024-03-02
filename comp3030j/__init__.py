from flask import Flask
from comp3030j.db import initialize_db
from comp3030j.views import bind_views

app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('config.py')

initialize_db(app)
bind_views(app)

