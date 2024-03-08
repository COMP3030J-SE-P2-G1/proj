module.exports = {
    apps : [{
        name: "tailwind watch",
        # error occurs: basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')"),
        # we can create a custom script file like `tailwindcss.sh` to solve the issue
        # However, I don't know whether it works on Windows or not
        script: "tailwindcss",
        args: "-i ./static/css/main.tailwind.css -o ./static/css/main.css --minify --watch"
    },{
        name: "parcel watch",
        script: "parcel",
        args: "watch 'templates/**/*.j2'"
    },{
        name   : "browser-sync",
        script : "browser-sync",
        args: "start --proxy 'localhost:5000' --files '**/*.{html,j2,css,js}"
    }]
}
