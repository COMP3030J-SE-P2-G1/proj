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
    if (e is None):
        print(f"You should set environment variable {name} first!")
        exit(1)
    else:
        return e

def init_db():
    # since pakcage initialization requires `config.py` file, we need to
    # put these `import` clause here.
    from comp3030j import app
    from comp3030j.db import db
    from comp3030j.db.User import User
    
    if getenv("POPULATE_DB"):
        with app.app_context():
             user = User(
                 username=env("ADMIN"),
                 email=env("ADMIN_EMAIL"),
             )
             db.session.add(user)
             db.session.commit()

def gen_config_py(filename: str):
    # Generate a secure secret key
    secret_key = secrets.token_hex()

    config_lines = [
        f'SECRET_KEY="{secret_key}"  # Securely generated secret key\n',
        'SQLALCHEMY_DATABASE_URI="sqlite:///comp3030j.db"\n'
    ]

    with open(filename, "w") as config_file:
        config_file.writelines(config_lines)
        print(f"Configuration file '{filename}' has been generated.")
    

def initialize():
    gen_config_py(path.join(DIRECTORY, "config.py"))
    init_db()

if __name__ == "__main__":
    initialize()
