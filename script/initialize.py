#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import secrets
import sys
from os import path, getenv

project_dir = path.dirname(path.dirname(path.abspath(__file__)))
sys.path.append(project_dir)

DIRECTORY = "instance"


def env(name: str) -> str:
    e = getenv(name)
    if e is None:
        print(f"You should set environment variable {name} first!")
        exit(1)
    else:
        return e


def init_db():
    # since package initialization requires `config.py` file, we need to
    # put these `import` clause here.
    from comp3030j import app
    from comp3030j.db import db
    from comp3030j.db.User import User
    from comp3030j.db.Profile import Profile
    from comp3030j.db.SEMSpot import SEMSpot
    from comp3030j.db.Solar import Solar
    from comp3030j.db.Usage import Usage
    from comp3030j.db.apikey import ApiKey

    from script.parse_csv_data import read_spot_from_csv, read_quarter_hourly_usage_csv
    from script.parse_json_data import read_solar_json

    if getenv("POPULATE_DB"):
        with app.app_context():
            spots = read_spot_from_csv(
                "./script/historical-irish-electricity-prices.csv"
            )
            usages = read_quarter_hourly_usage_csv("./script/UCD_2023_profile.csv")
            timestamps = usages.keys()
            min_timestamp, max_timestamp = min(timestamps), max(timestamps)
            solar_input, solar_values = read_solar_json("./script/data.json")
            (lat, lon, tech_code, power, loss) = solar_input

            # initialize default/example series and convert to database
            user = User(
                username="demo_user",
                email="example@example.com",
                # password: password
                password="$2b$12$bHS.YMIatAVXvH/ME5.ewO3sXEcz5Rls5pwJ195aSzRFRj58LlLSa"
            )
            db.session.add(user)
            db.session.flush()
            # fmt: off
            demo_profile = Profile(
                user_id=user.id, name="Demo", desc="Demo Profile", lat=lat, lon=lon,
                tech=tech_code, loss=loss, power=power, start_time=min_timestamp, 
                end_time=max_timestamp,
            )
            # fmt: on
            db.session.add(demo_profile)
            db.session.flush()

            demo_api_key = ApiKey(user.id, token="dac6164cd0cf4ea6b539aa2a6a1f457d", desc="Demo Api Key.")
            db.session.add(demo_api_key)

            for timestamp, value in spots.items():
                spot = SEMSpot(time=timestamp, spot=value)
                db.session.add(spot)

            for timestamp, value in usages.items():
                usage = Usage(time=timestamp, usage=value, profile_id=demo_profile.id)
                db.session.add(usage)

            # for timestamp, value in solar_values.items():
            #     # fmt: off
            #     solar = Solar(
            #         time=timestamp, generation=value, lat=lat, lon=lon, tech=tech_code,
            #         loss=loss, power=power
            #     )
            #     # fmt: on
            #     db.session.add(solar)

            db.session.commit()


def gen_config_py(filename: str):
    # Generate a secure secret key
    secret_key = secrets.token_hex()

    configuration = f"""SECRET_KEY="{secret_key}"
SQLALCHEMY_DATABASE_URI="sqlite:///comp3030j.db"
LANGUAGES=['en', 'zh']
CACHE_TYPE="SimpleCache"
CACHE_DEFAULT_TIMEOUT=300
CACHE_REDIS_HOST="127.0.0.1"
CACHE_REDIS_PORT=6379
CACHE_REDIS_PORT=0
"""

    with open(filename, "w") as config_file:
        config_file.write(configuration)
        print(f"Configuration file '{filename}' has been generated.")


def initialize():
    gen_config_py(path.join(DIRECTORY, "config.py"))
    init_db()


if __name__ == "__main__":
    initialize()
