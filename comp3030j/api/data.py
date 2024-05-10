from comp3030j import app, cache
from comp3030j.db import db
from comp3030j.db.SEMSpot import SEMSpot
from flask import Blueprint, current_app, request, jsonify
from datetime import datetime, timedelta, MINYEAR, MAXYEAR, timezone
from comp3030j.util import parse_iso_string, to_iso_string
from comp3030j.util.cache import make_key_post_json
from .security import auth_guard

bp = Blueprint("api/data", __name__, url_prefix="/data")


@bp.route("/sems", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json)
def semspot():
    """
    request body:
    {
        # data range specification
        start_time : str, ISO 8601 formatted time = "",
        end_time : str, ISO 8601 formatted time = "",
        span_hours : integer = "",
        # data format specification
        sum_hours : int = ""
    }

    All values are technically optional, will return datapoints according
    to the combination of parameters received:

    [start_time, end_time],
    [start_time, start_time + span_hours], or
    [end_time - span_hours, end_time], or
    [profile.start_time, end_time] if only end_time is specified, or
    [start_time, profile.end_time] if only start_time is specified

    if `sum_hours` is not specified or blank, the returned list will consist of a
    naiively serialized json representation of the underlying database with ORM-relations
    elided. Otherwise, the only time varying data column will be returned, in the form of:

    List[List[time: str, spot: float]]

    where the time-varying column will be summed on a left-aligned basis, i.e. the
    returned timestamps will consist of values sliced like [::sum_hours]. Note that
    only "full" slices will be returned.
    """
    content = request.json  # get POSTed content
    one_hour = timedelta(hours=1)
    start_time = "start_time" in content and content["start_time"]
    end_time = "end_time" in content and content["end_time"]
    span_hours = "span_hours" in content and content["span_hours"]
    sum_hours = "sum_hours" in content and content["sum_hours"]

    try:
        if sum_hours:
            sum_hours = int(sum_hours)

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

        elif span_hours:  # default to first
            start_dt = db.session.scalar(
                db.select(SEMSpot).order_by(SEMSpot.time.asc())
            ).time
            delta_hours = abs(int(span_hours))
            end_dt = start_dt + one_hour * delta_hours

        else:
            raise KeyError(
                "malformed request, specify either \
(start_time, end_time), (start_time, span_hours), (end_time, span_hours) or (span_hours): "
            )

    except (ValueError, TypeError) as e:
        return {
            "errorMsg": "inappropriate timestamp format or invalid duration: " + str(e),
        }, 400

    except Exception as e:
        return ({"errorMsg": str(e)}, 400)

    result = db.session.scalars(
        db.select(SEMSpot).filter(SEMSpot.time.between(start_dt, end_dt))
    )
    result_list = list(result)  # turn consumable iterator into imperishable list

    if not sum_hours:
        return jsonify([v.to_dict() for v in result])
    else:
        orig_series = [v.spot for v in result_list]
        time_series = [
            sum(v) for v in zip(*[orig_series[i::sum_hours] for i in range(sum_hours)])
        ]
        time_stamps = [to_iso_string(v.time) for v in result_list[::sum_hours]]
        return jsonify([*zip(time_stamps, time_series)])
