from comp3030j import app
from comp3030j.db import db
from comp3030j.db.SEMSpot import SEMSpot
from flask import Blueprint, current_app, request, jsonify
from datetime import datetime, timedelta, MINYEAR, MAXYEAR, timezone
from comp3030j.util import parse_iso_string

bp = Blueprint("api/data", __name__, url_prefix="/data")


@bp.route("/sems", methods=["POST"])
def semspot():
    content = request.json  # get POSTed content
    one_hour = timedelta(hours=1)
    try:
        start_time = content["start_time"]
        end_time = content["end_time"]
        span_hours = content["span_hours"]

        if start_time and end_time:
            start_dt = parse_iso_string(start_time)
            end_dt = parse_iso_string(end_time)

        elif start_time and span_hours:
            start_dt = parse_iso_string(start_time)
            delta_hours = abs(int(span_hours))
            end_dt = start_dt + one_hour * delta_hours

        elif end_time and span_hours:
            end_dt = parse_iso_string(end_time)
            delta_hours = abs(int(span_hours))
            start_dt = end_dt - one_hour * delta_hours

        else:
            raise KeyError()

        result = db.session.scalars(
            db.select(SEMSpot).filter(SEMSpot.time.between(start_dt, end_dt))
        )
        return jsonify([v.to_dict() for v in result])

    except (ValueError, TypeError) as e:
        return {
            "errorMsg": "inappropriate timestamp format or invalid duration: " + str(e),
        }, 400

    except KeyError as e:
        return (
            {
                "errorMsg": "malformed request, specify either \
(start_time, end_time), (start_time, span_hours) or (end_time, span_hours): "
                + str(e),
            },
            400,
        )
