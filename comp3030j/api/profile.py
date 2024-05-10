from comp3030j import app, cache
from comp3030j.db import db
from comp3030j.db.Profile import Profile
from comp3030j.db.Usage import Usage
from comp3030j.db.Solar import Solar
from flask_login import current_user
from flask import Blueprint, current_app, request, jsonify
from datetime import datetime, timedelta, MINYEAR, MAXYEAR
from datetime import timezone
from dateutils import relativedelta
import requests, json
from comp3030j.util import parse_iso_string, to_iso_string
from .security import auth_guard
from comp3030j.util.cache import make_key_post_json_user

bp = Blueprint("api/v1/profile", __name__, url_prefix="/profile")


def get_profile(id):
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


@bp.route("/<int:id>")
@auth_guard()
def profile(id):
    profile, response = get_profile(id)
    if response:
        return response
    return profile.to_dict()


@bp.route("/<int:id>/usage", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json_user)
def usage(id):
    """
    request body:
    {
        # data range specification
        start_time : str, ISO 8601 formatted time = "",
        end_time : str, ISO 8601 formatted time = "",
        span_hours : integer = "",
        # data format specification
        aggregate: str = ""
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
    profile, response = get_profile(id)
    if response:  # for some reason user profile is not available
        return response

    content = request.json  # get POSTed content
    one_hour = timedelta(hours=1)

    start_time = "start_time" in content and content["start_time"]
    end_time = "end_time" in content and content["end_time"]
    span_hours = "span_hours" in content and content["span_hours"]
    aggregate = "aggregate" in content and content["aggregate"]
    # sum_hours = "sum_hours" in content and content["sum_hours"]

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

        result = db.session.scalars(
            db.select(Usage)
            .filter_by(profile_id=profile.id)
            .filter(Usage.time.between(start_dt, end_dt))
        )
        result_list = list(result)  # turn consumable iterator into imperishable list
        result_list.sort(key=lambda entry: entry.time)

        if not aggregate:
            return jsonify([v.to_dict() for v in result_list])
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
                    time_series[-1] += entry.generation
                elif entry.time >= next_dt:
                    iter_dt = next_dt
                    next_dt += rel_t
                    iso_dt = to_iso_string(iter_dt)
                    time_stamps.append(iso_dt)
                    time_series.append(entry.usage)

            return jsonify([*zip(time_stamps, time_series)])

    except (ValueError, TypeError) as e:
        return {
            "errorMsg": "inappropriate timestamp format or invalid duration: " + str(e),
        }, 400

    except Exception as e:
        return ({"errorMsg": str(e)}, 400)


@bp.route("/<int:id>/solar", methods=["POST"])
@auth_guard()
@cache.cached(make_cache_key=make_key_post_json_user)
def solar(id):
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
    profile, response = get_profile(id)
    if response:  # for some reason user profile is not available
        return response

    content = request.json  # get POSTed content
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

        result = db.session.scalars(
            db.select(Solar)
            .filter_by(
                lon=profile.lon,
                lat=profile.lat,
                tech=profile.tech,
                loss=profile.loss,
                power=profile.power,
            )
            .filter(Solar.time.between(start_dt, end_dt))
        )
        result_list = list(result)

        stored_years = set(v.time.year for v in result_list)
        required_years = set(v for v in range(start_dt.year, end_dt.year + 1))
        query_years = stored_years.symmetric_difference(required_years)

        if len(query_years) == 0:
            app.logger.info("returning results from DB")
        else:
            app.logger.info("querying PVGIS")
            # dispatch query_pvgis_one_year
            result_list = []

            for year in query_years:
                solar_values = query_pvgis_one_year(
                    lat=profile.lat,
                    lon=profile.lon,
                    year=year,
                    power=profile.power,
                    loss=profile.loss,
                    pv_tech_code=profile.tech,
                )

                for timestamp, value in solar_values.items():
                    solar = Solar(
                        time=timestamp,
                        generation=value,
                        lat=profile.lat,
                        lon=profile.lon,
                        tech=profile.tech,
                        loss=profile.loss,
                        power=profile.power,
                    )
                    db.session.add(solar)
                    if start_dt <= timestamp <= end_dt:
                        result_list.append(solar)

            db.session.commit()

        result_list.sort(key=lambda entry: entry.time)
        if not aggregate:
            return jsonify([v.to_dict() for v in result_list])
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
                    time_series[-1] += entry.generation
                elif entry.time >= next_dt:
                    iter_dt = next_dt
                    next_dt += rel_t
                    iso_dt = to_iso_string(iter_dt)
                    time_stamps.append(iso_dt)
                    time_series.append(entry.generation)

            return jsonify([*zip(time_stamps, time_series)])

    except (ValueError, TypeError) as e:
        return {
            "errorMsg": "inappropriate timestamp format, invalid duration or sum: "
            + str(e),
        }, 400

    except Exception as e:
        return {"errorMsg": str(e)}, 400


def query_pvgis_one_year(
    lat: float,
    lon: float,
    year: int,  # PVGIS returns result in UTC, therefore no further processing is necessary
    power: float,  # nominal capacity, in watts
    pv_tech_code: int,
    loss: float,  # system loss
):
    queried_year = min(year, (year - 1) % 4 + 2017)  # actual valid dates are 2005-2020
    pvgis_5_2 = "https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?"

    try:
        pv_tech_string = ["crystSi", "CIS", "CdTe"][pv_tech_code]
    except KeyError:
        raise ValueError("invalid pv_tech_code")

    payload = {
        "outputformat": "json",
        "optimalinclination": 1,
        "optimalangles": 1,
        "pvcalculation": 1,
        "lat": lat,
        "lon": lon,
        "startyear": queried_year,
        "endyear": queried_year,
        "peakpower": power,
        "pvtechchoice": pv_tech_string,
        "loss": loss,
    }
    response = requests.get(pvgis_5_2, params=payload)
    if response.ok:
        json_data = json.loads(response.content)
    else:
        response.raise_for_status()

    series_dict = {}
    for datapoint in json_data["outputs"]["hourly"]:
        time, power_out = datapoint["time"], datapoint["P"]
        # read the complete timestamp but normalize to start of hour.
        timestamp = datetime.strptime(time + " +00:00", "%Y%m%d:%H%M %z")
        # use the actual year when calling this function.
        timestamp = timestamp.replace(year=year, minute=0)
        # convert power_out (in watts) to generation (in kilowatt-hour)
        generation = power_out * 3.6
        series_dict.update({timestamp: generation})

    return series_dict
