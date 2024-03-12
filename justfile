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
[windows]
run:
    # Please run the following command separately (open multiple terminals to run them) at the project root
    # just tailwind
    # just parcel
    # just browser-sync # it should automatically open localhost:3000 (if not occupied)
    # just flask
    echo 1 # place holder (for solving multiple command collision error)

# run the project
[unix]
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

[windows]
browser-sync:
    {{npx}} browser-sync start --proxy 'localhost:5000' --files 'comp3030j/templates/*.j2, comp3030j/static/*.css, comp3030j/static/**/*.js'

# clean parcel caches and outputs
[unix]
parcel-clean:
    rm -rf ./dist/ ./.parcel-cache/ comp3030j/static/css comp3030j/static/js comp3030j/static/image comp3030j/templates

# Parcel watch (file not optimized)
[unix]
parcel: parcel-clean
    # --no-hmr make `parcel watch` not inserting a script element at the relatively end of html file
    {{npx}} pm2 start --name "parcel watch"  "parcel watch 'templates/**/*.j2' --no-hmr"

[windows]
parcel: parcel-clean
    npx parcel watch 'templates/**/*.j2' --no-hmr

# clean parcel caches and outputs
[windows]
parcel-clean:
    -Remove-Item -r -fo ./dist -errorAction ignore
    -Remove-Item -r -fo ./.parcel-cache/ -errorAction ignore
    -Remove-Item -r -fo ./comp3030j/static/css -errorAction ignore
    -Remove-Item -r -fo ./comp3030j/static/js -errorAction ignore
    -Remove-Item -r -fo ./comp3030j/static/image -errorAction ignore
    -Remove-Item -r -fo ./comp3030j/templates -errorAction ignore

# parcel build (files are optimized)
[unix]
parcel-build: parcel-clean
    {{npx}} parcel build 'templates/**/*.j2'

[windows]
tailwind:
    {{npx}} tailwindcss -i ./static/css/main.tailwind.css -o ./static/css/main.css --minify --watch

# tailwind watch
[unix]
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
[unix]
reset: parcel-clean
    rm ./instance/comp3030j.db

[windows]
reset: parcel-clean
    rm -r -fo ./instance/comp3030j.db -errorAction ignore
    
