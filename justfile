set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

set dotenv-load
set dotenv-path := ".justfile-env"

# If you want to customize the command, take a look at .justfile-env.example
# file, rename it to .justfile-env and make changes to it.
python := env("python", "python3")
npm := env("npm", "npm")
npx := env("npx", "npx")
flask_run := env("flask_run", "flask --app comp3030j run --debug")

# run the project
run: kill tailwind parcel browser-sync flask
    
# Run flask application in debug mode
flask:
    # If you don't use rye, you probably need to activate virtual environment
    {{flask_run}}

# install node modules, create flask application configuration file and create database
initialize:
    {{npm}} install
    {{python}} ./script/initialize.py

# Automatically refresh browser when page changes
browser-sync:
    {{npx}} pm2 start --name "browser-sync" "browser-sync start --proxy 'localhost:5000' --files 'comp3030j/templates/*.j2, comp3030j/static/*.css, comp3030j/static/**/*.js'"

# Parcel watch (file not optimized)
parcel:
    {{npx}} pm2 start --name "parcel watch"  "parcel watch 'templates/**/*.j2'"
    
# clean parcel caches and outputs
parcel-clean:
    rm -rf ./dist/ ./.parcel-cache/ comp3030j/static/css comp3030j/static/js comp3030j/static/image comp3030j/templates


# clean parcel caches and outputs
[windows]
parcel-clean:
    rm -r -fo ./dist/
    rm -r -fo ./.parcel-cache/
    rm -r -fo ./comp3030j/static/css
    rm -r -fo ./comp3030j/static/js
    rm -r -fo ./comp3030j/static/image
    rm -r -fo ./comp3030j/templates

# parcel build (files are optimized)
parcel-build: parcel-clean
    {{npx}} parcel build 'templates/**/*.j2'

# tailwind watch
tailwind:
    {{npx}} pm2 start --name "tailwind watch" "tailwindcss -i ./static/css/main.tailwind.css -o ./static/css/main.css --minify --watch"

# tailwind build
tailwind-build:
    {{npx}} tailwindcss -i ./static/css/main.tailwind.css -o ./static/css/main.css --minify

# build the project
build: tailwind-build parcel-build

# kill all background processes managed by pm2
kill:
    {{npx}} pm2 kill

# show pm2 managed processess' state
stat:
    {{npx}} pm2 ls
    
# show pm2 logs
logs:
    {{npx}} pm2 logs

lint:
    {{npx}} eslint .

# reset the project (clean caches / outputs / databases/ etc.)
reset: parcel-clean
    rm ./instance/comp3030j.db 
