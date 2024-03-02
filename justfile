python := "python3"

npx := ```
# check whether command 'bun' exist
if command -v bun >/dev/null 2>&1; then
    echo "bun"
else
    echo "npx"
fi
```

flask-run := ```
if command -v rye >/dev/null 2>&1; then
    echo "rye run flask-dev"
else
    echo "flask --app comp3030j run --debug"
fi
```

run: flask
    
# or you can use `rye run dev` if you have installed [rye](https://github.com/astral-sh/rye)
flask:
    # before this, you need to activate virtual environment
    {{flask-run}}

browser-sync:
    browser-sync start --proxy "localhost:5000" --files "**/*.{html,j2,css,js}"
    
initialize:
    {{python}} ./script/initialize.py

tailwind:
    {{npx}} run tailwindcss -i ./comp3030j/static/css-src/main.css -o ./comp3030j/static/css/main.css --minify --watch

reset:
    rm ./instance/comp3030j.db
