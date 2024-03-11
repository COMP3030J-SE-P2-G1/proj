/** @type {import('tailwindcss').Config} */

module.exports = {
    mode: 'jit',
    content: [
        "./templates/**/*.{html,j2}",
        "./static/js/**/*.js",
    ],
    theme: ["light", "dark"],
    plugins: [require("daisyui")]
}

