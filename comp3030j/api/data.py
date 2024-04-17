from comp3030j import app
from comp3030j.db import db
from comp3030j.db.SEMSpot import SEMSpot
from flask import Blueprint, current_app, request, jsonify
from datetime import datetime, timedelta, MINYEAR, MAXYEAR, timezone

bp = Blueprint("api/data", __name__, url_prefix="/data")


@bp.route("/sems", methods=["POST"])
def semspot():
    content = request.json  # get POSTed content
    try:
        start_time = content["start_time"]
        end_time = content["end_time"]
        span_hours = content["span_hours"]

        if start_time and end_time:
            start_dt = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S%z")
            end_dt = datetime.strptime(end_time, "%Y-%m-%dT%H:%M:%S%z")
            result = db.session.scalars(
                db.select(SEMSpot).filter(SEMSpot.time.between(start_dt, end_dt))
            )
            return jsonify([v.to_dict() for v in result])

        elif start_time and span_hours:
            start_dt = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S%z")
            delta_hours = int(span_hours)
            one_hour = timedelta(hours=1)
            end_dt = start_dt + one_hour * delta_hours

            result = db.session.scalars(
                db.select(SEMSpot).filter(SEMSpot.time.between(start_dt, end_dt))
            )
            return jsonify([v.to_dict() for v in result])

        else:
            raise KeyError()

    except (ValueError, TypeError) as e:
        return {
            "errorMsg": "inappropriate timestamp format or invalid duration: " + str(e),
        }, 400

    except KeyError as e:
        return (
            {
                "errorMsg": "malformed request, specify either \
(start_time, end_time) or (start_time, span_hours): "
                + str(e),
            },
            400,
        )
