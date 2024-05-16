from comp3030j.db import db
from typing import Dict, Callable
from comp3030j.util import parse_iso_string, to_iso_string
from datetime import datetime, timezone, timedelta
from dateutils import relativedelta
from comp3030j.db.SEMSpot import SEMSpot
from comp3030j.db.Profile import Profile
from flask import current_app
from flask_login import current_user


def get_profile(id: int):
    """
    Utility function to check get a profile.
    Returns a tuple (profile, response) where:
    - profile is the profile object if accessible, otherwise None
    - response is None if access is granted, otherwise an error response
    """
    # return Profile(id = 1, u_id = 2, usage_id = 3, solar_id = 4), None
    profile = db.session.scalar(db.select(Profile).filter_by(id=id))
    if not profile:
        return None, ({"code": 1, "errorMsg": "No corresponding resource"}, 400)
    elif profile.user_id < 1000:  # public data: user_id < 1000 (typically 0)
        return profile, None
    elif not current_user.is_authenticated:
        return None, current_app.login_manager.unauthorized()
    elif current_user.id == profile.u_id:
        return profile, None
    else:
        return None, ({"code": 2, "errorMsg": "Unauthorized access"}, 403)


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


def parse_profile_request(func: Callable):

    def inner(id: int, content: Dict, *args, **kwargs):
        profile, response = get_profile(id)
        if response:  # for some reason user profile is not available
            return None, response

        start_time = "start_time" in content and content["start_time"]
        end_time = "end_time" in content and content["end_time"]
        span_hours = "span_hours" in content and content["span_hours"]
        aggregate = "aggregate" in content and content["aggregate"]
        one_hour = timedelta(hours=1)
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

            elif start_time:
                start_dt = parse_iso_string(start_time)
                end_dt = profile.end_time

            elif end_time:
                start_dt = profile.start_time
                end_dt = parse_iso_string(end_time)

            else:
                raise KeyError(
                    "malformed request, specify either one of \
(start_time, end_time), (start_time, span_hours), (end_time, span_hours), \
(start_time), (end_time): "
                )

            return func(
                *args,
                id=id,
                profile=profile,
                start_dt=start_dt,
                end_dt=end_dt,
                aggregate=aggregate,
                **kwargs,
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


def aggregate_result(func: Callable):

    def inner(aggregate: str, *args, **kwargs):
        result_list = func(*args, **kwargs)

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
                    time_series[-1] += entry.to_timeseries()
                elif entry.time >= next_dt:
                    iter_dt = next_dt
                    next_dt += rel_t
                    iso_dt = to_iso_string(iter_dt)
                    time_stamps.append(iso_dt)
                    time_series.append(entry.to_timeseries())

            return [*zip(time_stamps, time_series)], None

    return inner
