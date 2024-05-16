from comp3030j import app
from comp3030j.db import db
from comp3030j.db.Profile import Profile
from comp3030j.db.Usage import Usage
from comp3030j.db.Solar import Solar
from datetime import datetime
from typing import List
from .data import get_semspot
from .decorators import parse_profile_request, aggregate_result
import requests
import json

# def get_profiles(uid: int):
#     # return Profile(id = 1, u_id = 2, usage_id = 3, solar_id = 4), None
#     profile = db.session.scalars(db.select(Profile).filter_by(user_id=uid)).first()
#     if not profile:
#         return None, ({"code": 1, "errorMsg": "No corresponding resource"}, 400)
#     elif profile.user_id < 1000:  # public data: user_id < 1000 (typically 0)
#         return profile, None
#     elif not current_user.is_authenticated:
#         return None, current_app.login_manager.unauthorized()
#     else:
#         return None, ({"code": 2, "errorMsg": "Unauthorized access"}, 403)


@parse_profile_request
@aggregate_result
def usage_route(*args, **kwargs):
    return get_usage(*args, **kwargs)


def get_usage(
    id: int, profile: Profile, start_dt: datetime, end_dt: datetime
) -> List[Usage]:
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
    result = db.session.scalars(
        db.select(Usage)
        .filter_by(profile_id=profile.id)
        .filter(Usage.time.between(start_dt, end_dt))
    )
    result_list = list(result)  # turn consumable iterator into imperishable list
    result_list.sort(key=lambda entry: entry.time)
    return result_list


@parse_profile_request
@aggregate_result
def solar_route(*args, **kwargs):
    return get_solar(*args, **kwargs)


def get_solar(
    id: int, profile: Profile, start_dt: datetime, end_dt: datetime
) -> List[Solar]:
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
        result_list = []

        for year in query_years:
            solar_values = _query_pvgis_one_year(
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
    return result_list


class Saving:
    def __init__(self, time, saving):
        self.time = time
        self.saving = saving  # in EUR

    def to_timeseries(self):
        return self.saving

    def to_dict(self):
        return {"time": self.time, "saving": self.saving}


@parse_profile_request
@aggregate_result
def saving_route(*args, **kwargs):
    return get_saving(*args, **kwargs)


def get_saving(
    id: int, profile: Profile, start_dt: datetime, end_dt: datetime
) -> List[Saving]:

    solars = {
        s.time: s.generation
        for s in get_solar(id=id, profile=profile, start_dt=start_dt, end_dt=end_dt)
    }

    usages = {
        u.time: u.usage
        for u in get_usage(id=id, profile=profile, start_dt=start_dt, end_dt=end_dt)
    }

    semspots = {s.time: s.spot for s in get_semspot(start_dt=start_dt, end_dt=end_dt)}

    result_list = []

    available_times = set(solars.keys()) & set(usages.keys()) & set(semspots.keys())
    app.logger.info("here")

    for time in available_times:
        usage, generation, spot = usages[time], solars[time], semspots[time]

        savings = max(min(generation, usage) * 1e-3 * spot, 0)
        result_list.append(Saving(time, savings))

    result_list.sort(key=lambda entry: entry.time)
    return result_list


def _query_pvgis_one_year(
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
