set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

set dotenv-load
set dotenv-path := ".justfile-env"

# If you want to customize the command, take a look at .justfile-env.example
# file, rename it to .justfile-env and make changes to it.
python := env("python", "python3")
npx := env("npx", "npx")
flask_run := env("flask_run", "flask --app comp3030j run --debug")

run: flask
    
flask:
    # before this, you probably need to activate virtual environment
    {{flask_run}}

browser-sync:
    browser-sync start --proxy "localhost:5000" --files "**/*.{html,j2,css,js}"
    
initialize:
    {{python}} ./script/initialize.py

tailwind:
    {{npx}} tailwindcss -i ./comp3030j/static/css/main.tailwind.css -o ./comp3030j/static/css/main.css --minify --watch

reset:
    rm ./instance/comp3030j.db
