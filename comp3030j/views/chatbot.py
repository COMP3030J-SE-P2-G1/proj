from flask import Blueprint, render_template

bp = Blueprint("chatbot", __name__, url_prefix="/chatbot")


@bp.route('/')
def chatbot():
    return render_template("page/chatbot/index.j2")
