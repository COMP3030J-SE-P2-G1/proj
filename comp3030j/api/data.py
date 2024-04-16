from comp3030j.db import db
from comp3030j.db.SEMSpot import SEMSpot
from flask import Blueprint, current_app, request, jsonify
from datetime import datetime, timedelta

bp = Blueprint("api/data", __name__, url_prefix="/data")


@bp.route("/sems", methods=["POST"])
def semspot():
    content = request.json  # get POSTed content
    start_dt = datetime.strptime(content["start_time"], "%Y-%m-%d %H:%M:%S")
    end_dt = datetime.strptime(content["end_time"], "%Y-%m-%d %H:%M:%S")

    result = db.session.scalars(
        db.select(SEMSpot).filter(SEMSpot.time.between(start_dt, end_dt))
    )
    return jsonify([v.to_dict() for v in result])