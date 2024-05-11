from comp3030j import app, cache
from comp3030j.db import db
from comp3030j.db.SEMSpot import SEMSpot
from flask import Blueprint, current_app, request, jsonify
from datetime import datetime, timedelta, MINYEAR, MAXYEAR, timezone
from comp3030j.util import parse_iso_string, to_iso_string
from comp3030j.util.cache import make_key_post_json
from .security import auth_guard
from dateutils import relativedelta

def semspot(content: dict):
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

        result = db.session.scalars(
            db.select(SEMSpot).filter(SEMSpot.time.between(start_dt, end_dt))
        )
        result_list = list(result)  # turn consumable iterator into imperishable list
        result_list.sort(key=lambda entry: entry.time)

        if not aggregate:
            return [v.to_dict() for v in result_list], None
        else:
            # fmt: off
            min_dt = result_list[0].time
            if aggregate == "hour":
                iter_dt = datetime(min_dt.year, min_dt.month, min_dt.day, min_dt.hour, tzinfo=timezone.utc)
                rel_t = relativedelta(hours=1)
            elif aggregate == "day":
                iter_dt = datetime(min_dt.year, min_dt.month, min_dt.day, tzinfo=timezone.utc)
                rel_t = relativedelta(days=1)
            elif aggregate == "month":
                iter_dt = datetime(min_dt.year, min_dt.month, 1, tzinfo=timezone.utc)
                rel_t = relativedelta(months=1)
            elif aggregate == "year":
                iter_dt = datetime(min_dt.year, 1, 1, tzinfo=timezone.utc)
                rel_t = relativedelta(years=1)
            else:
                raise KeyError("unrecognized aggregate statement, specifyeither 'hour', 'day', 'month' or 'year'")
            time_stamps = [to_iso_string(iter_dt)]
            time_series = [0]

            next_dt = iter_dt + rel_t
            for entry in result_list:
                if iter_dt <= entry.time < next_dt:
                    time_series[-1] += entry.spot
                elif entry.time >= next_dt:
                    iter_dt = next_dt
                    next_dt += rel_t
                    iso_dt = to_iso_string(iter_dt)
                    time_stamps.append(iso_dt)
                    time_series.append(entry.spot)
            return [*zip(time_stamps, time_series)], None

    except (ValueError, TypeError) as e:
        return None, ({
            "errorMsg": "inappropriate timestamp format or invalid duration: " + str(e),
        }, 400)

    except Exception as e:
        return None, ({"errorMsg": str(e)}, 400)
