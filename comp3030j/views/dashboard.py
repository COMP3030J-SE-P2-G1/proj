from flask import Blueprint, render_template

bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@bp.route('/')
def dashboard():
    return render_template("page/dashboard/layout1/index.j2")

@bp.route('/<path:path>')
def serve_static(path):
    print(f"page/dashboard/page/{path}.j2")
    return render_template(f"page/dashboard/page/{path}.j2")

