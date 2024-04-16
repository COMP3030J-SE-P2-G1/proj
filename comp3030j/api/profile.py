from comp3030j import app
from comp3030j.db import db
from comp3030j.db.Profile import Profile
from comp3030j.db.Usage import Usage
from comp3030j.db.Solar import Solar
from flask_login import current_user
from flask import Blueprint, current_app, request, jsonify
from datetime import datetime, timedelta, MINYEAR, MAXYEAR
import requests, json

bp = Blueprint("api/profile", __name__, url_prefix="/profile")


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
def profile(id):
    profile, response = get_profile(id)
    if response:
        return response

    return profile.to_dict()


@bp.route("/<int:id>/usage", methods=["POST"])
def usage(id):
    """
    request has body as:
    {
        start_time: YYYY-MM-DD HH:MM:SS
        end_time: YYYY-MM-DD HH:MM:SS
    }
    """
    profile, response = get_profile(id)
    if response:  # for some reason user profile is not available
        return response

    content = request.json  # get POSTed content
    try:
        start_dt = datetime.strptime(content["start_time"], "%Y-%m-%d %H:%M:%S")
    except (KeyError, ValueError, TypeError):
        start_dt = profile.start_time
    try:
        end_dt = datetime.strptime(content["end_time"], "%Y-%m-%d %H:%M:%S")
    except (KeyError, ValueError, TypeError):
        end_dt = profile.end_time

    result = db.session.scalars(
        db.select(Usage)
        .filter_by(profile_id=profile.id)
        .filter(Usage.time.between(start_dt, end_dt))
    )

    return jsonify([v.to_dict() for v in result])


@bp.route("/<int:id>/solar", methods=["POST"])
def solar(id):
    """
    request has body as:
    {
        start_time: YYYY-MM-DD HH:MM:SS
        end_time: YYYY-MM-DD HH:MM:SS
    }
    """

    profile, response = get_profile(id)
    if response:  # for some reason user profile is not available
        return response

    content = request.json  # get POSTed content
    try:
        start_dt = datetime.strptime(content["start_time"], "%Y-%m-%d %H:%M:%S")
    except (KeyError, ValueError, TypeError):
        start_dt = profile.start_time
    try:
        end_dt = datetime.strptime(content["end_time"], "%Y-%m-%d %H:%M:%S")
    except (KeyError, ValueError, TypeError):
        end_dt = profile.end_time

    # query the database assuming the data is in db.

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
    # app.logger.info("length of result " + str(len(result_list)))
    stored_years = set(v.time.year for v in result_list)
    required_years = set(v for v in range(start_dt.year, end_dt.year + 1))
    query_years = stored_years.symmetric_difference(required_years)
    # app.logger.info("stored_years " + str(stored_years))
    # app.logger.info("required_years " + str(required_years))
    # app.logger.info("query_years " + str(query_years))
    if len(query_years) == 0:
        app.logger.info("returning results from DB")
        return jsonify([v.to_dict() for v in result_list])
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
        return jsonify([v.to_dict() for v in result_list])


def query_pvgis_one_year(
    lat: float,
    lon: float,
    year: int,
    power: float,  # nominal capacity, in watts
    pv_tech_code: int,
    loss: float,  # system loss
):
    queried_year = min(year, (year - 1) % 4 + 2017)
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
        timestamp = datetime.strptime(time, "%Y%m%d:%H%M")  # - eleven_minute
        # use the actual year when calling this function.
        timestamp = timestamp.replace(year=year, minute=0)
        # convert power_out (in watts) to generation (in kilojoules)
        generation = power_out * 3.6
        series_dict.update({timestamp: generation})

    return series_dict
