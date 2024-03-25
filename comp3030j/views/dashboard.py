from flask import Blueprint, render_template

bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@bp.route('/')
def dashboard():
    return render_template("page/dashboard/layout1/index.j2")


@bp.route('/index')
def index():
    return render_template("page/dashboard/page/index.j2")
