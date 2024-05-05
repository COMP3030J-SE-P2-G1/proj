from comp3030j import cache
from flask import Blueprint, render_template

bp = Blueprint("landing", __name__)

@bp.route('/')
@cache.cached()
def index():
    return render_template("page/landing/index.j2")
