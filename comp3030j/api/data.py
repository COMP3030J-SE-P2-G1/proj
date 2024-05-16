from comp3030j import app, cache
from comp3030j.db import db
from comp3030j.db.SEMSpot import SEMSpot
from flask import Blueprint, current_app, request, jsonify
from datetime import datetime, timedelta, MINYEAR, MAXYEAR, timezone
from comp3030j.util import parse_iso_string, to_iso_string
from comp3030j.util.cache import make_key_post_json
from .security import auth_guard
from dateutils import relativedelta
from typing import Dict, Callable
from .profile import aggregate_result


def parse_data_request(func: Callable):

    def inner(content: Dict, *args, **kwargs):
        one_hour = timedelta(hours=1)
        start_time = "start_time" in content and content["start_time"]
        end_time = "end_time" in content and content["end_time"]
        span_hours = "span_hours" in content and content["span_hours"]
        aggregate = "aggregate" in content and content["aggregate"]

        try:

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

            return func(
                *args, start_dt=start_dt, end_dt=end_dt, aggregate=aggregate, **kwargs
            )

        except (ValueError, TypeError) as e:
            return None, (
                {
                    "errorMsg": "inappropriate timestamp format or invalid duration: "
                    + str(e),
                },
                400,
            )

        except Exception as e:
            return None, ({"errorMsg": str(e)}, 400)

    return inner


@parse_data_request
@aggregate_result
def semspot(start_dt: datetime, end_dt: datetime):
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

    if `aggregate` is not specified or blank, the returned list will consist of a
    naiively serialized json representation of the underlying database with ORM-relations
    elided. Otherwise, the only time varying data column will be returned, in the form of:

    List[List[time: str, usage: float]]

    Where the time-varying column will be summed on a left-aligned basis.
    NOTE: UNFULL BRACKETS WILL BE RETURNED!
    """

    result = db.session.scalars(
        db.select(SEMSpot).filter(SEMSpot.time.between(start_dt, end_dt))
    )
    result_list = list(result)  # turn consumable iterator into imperishable list
    return result_list
