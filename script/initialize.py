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
    from comp3030j.db.SEMSpot import SEMSpot
    from comp3030j.db.Usage import Usage

    from script.parse_csv_data import read_spot_from_csv, read_quarter_hourly_usage_csv

    if getenv("POPULATE_DB"):
        with app.app_context():
            spots = read_spot_from_csv("./script/historical-irish-electricity-prices.csv")
            usages = read_quarter_hourly_usage_csv("./script/UCD_2023_profile.csv")

            for timestamp, value in spots.items():
                spot = SEMSpot(time=timestamp, spot=value)
                db.session.add(spot)

            for timestamp, value in usages.items():
                usage = Usage(time=timestamp, usage=value)
                db.session.add(usage)

            db.session.commit()


def gen_config_py(filename: str):
    # Generate a secure secret key
    secret_key = secrets.token_hex()

    configuration = f"""SECRET_KEY="{secret_key}"
SQLALCHEMY_DATABASE_URI="sqlite:///comp3030j.db"
LANGUAGES=['en', 'zh']
OPENAI_API_KEY="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"
NEWS_API_KEY="590da50736284e36986ee5cddabc1624"
"""

    with open(filename, "w") as config_file:
        config_file.write(configuration)
        print(f"Configuration file '{filename}' has been generated.")


def initialize():
    gen_config_py(path.join(DIRECTORY, "config.py"))
    init_db()


if __name__ == "__main__":
    initialize()
