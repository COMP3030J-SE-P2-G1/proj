from flask import Blueprint, render_template

bp = Blueprint("misc", __name__, url_prefix="/misc")

@bp.route('/demo_chart')
def dashboard():
    return render_template("page/misc/demo_chart.j2")
