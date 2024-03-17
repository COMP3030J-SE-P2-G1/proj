/** @type {import('tailwindcss').Config} */

module.exports = {
    mode: 'jit',
    content: [
        "./templates/**/*.{html,j2}",
        "./static/js/**/*.js",
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ["Inter var", "sans-serif"],
            },
        }
    },
    daisyui: {
        themes: ["light", "dim"],
    },
    plugins: [require("daisyui")],
    safelist: ['scale-125']
}

