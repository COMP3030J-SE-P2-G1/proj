from comp3030j.db import db
from comp3030j.db.SEMSpot import SEMSpot
from flask import Blueprint, current_app, request, jsonify
from datetime import datetime, timedelta, MINYEAR, MAXYEAR

bp = Blueprint("api/data", __name__, url_prefix="/data")


@bp.route("/sems", methods=["POST"])
def semspot():
    content = request.json  # get POSTed content
    try:
        start_dt = datetime.strptime(content["start_time"], "%Y-%m-%d %H:%M:%S")
    except (KeyError, ValueError):
        start_dt = datetime(MINYEAR, 1, 1, 0, 0, 0)
    try:
        end_dt = datetime.strptime(content["end_time"], "%Y-%m-%d %H:%M:%S")
    except (KeyError, ValueError):
        end_dt = datetime(MAXYEAR, 12, 31, 23, 59, 59, 999)

    result = db.session.scalars(
        db.select(SEMSpot).filter(SEMSpot.time.between(start_dt, end_dt))
    )
    return jsonify([v.to_dict() for v in result])
