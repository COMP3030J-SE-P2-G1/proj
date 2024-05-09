from comp3030j import cache
from flask import Blueprint, render_template
from flask_login import current_user

bp = Blueprint("landing", __name__)

@bp.route('/')
@cache.cached()
def index():
    return render_template("page/landing/index.j2")
