from flask import Blueprint, render_template

bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")

@bp.route('/')
def hello():
    return render_template("page/dashboard/index.j2")
