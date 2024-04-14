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
    safelist: [
        'scale-125', 'shadow',
        // electricity usage calculator
        'font-bold', 'font-normal', 'p-1.5', 'text-right', 'ml-2',
        "flex", "justify-between", "text-sm", "items-center"
    ]
}

