/** @type {import('tailwindcss').Config} */

module.exports = {
    mode: 'jit',
    content: [
        "./templates/**/*.{html,j2}",
        "./static/js/**/*.js",
    ],
    theme: {
        extend: {
            colors: {
                "base-content-shadow": "oklch(var(--bc) / .6)",
            },
            fontFamily: {
                inter: ["Inter var", "sans-serif"],
            },
        }
    },
    daisyui: {
        themes: ["light", "dim"],
    },
    plugins: [require("daisyui")],
    safelist: ['scale-125', 'shadow', 'font-normal']
}

