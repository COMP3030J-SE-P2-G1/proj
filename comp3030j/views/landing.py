from flask import Blueprint, render_template

bp = Blueprint("landing", __name__)


@bp.route('/')
def hello():
    return render_template("page/landing/index.j2")
