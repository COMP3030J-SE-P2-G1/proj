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
        // NOTE: If `dim` is not used as dark theme anymore, we also need to change the
        // theme name in some CSS files inside ./static/css/ directory
        themes: ["light", "dim"],
    },
    plugins: [require("daisyui")],
    safelist: [
        'scale-125', 'shadow',
        // electricity usage calculator
        'font-bold', 'font-normal', 'p-1.5', 'text-right', 'ml-2',
        "flex", "justify-between", "text-sm", "items-center",

        // api management
        "absolute", "inset-0", "bg-black", "bg-opacity-50", "flex", "justify-center", "items-center",
        "loading", "loading-ring", "loading-lg"
    ]
}

