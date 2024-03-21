/*
 this file is meant to only contain functions that is necessary to all the pages, such as theme control
 */

import { ready } from "./lib/utils";
import * as Constants from "./constants.ts";

/**
 * Restore state at the beginning
 * note: currently only restore theme state
 */
function restoreState() {
    // restore theme
    const themeSelector = document.getElementById("theme-selector") as HTMLInputElement;
    if (themeSelector) {
        const rawIsDark = localStorage.getItem(Constants.LOCAL_STAGE_IS_DARK) ?? "false";
        const isDark = JSON.parse(rawIsDark) as boolean;
        themeSelector.checked = isDark;
    }
}

/**
 * Store theme state to local storage
 */
function rememberThemeState(e: Event) {
    const isDark = (e.target as HTMLInputElement).checked;
    localStorage.setItem(Constants.LOCAL_STAGE_IS_DARK, JSON.stringify(isDark));
}

/**
 * Bind events to elements
 */
function bindEvents(): void {
    const themeSelector = document.getElementById("theme-selector");
    themeSelector?.addEventListener("change", rememberThemeState);
}

(function () {
    ready(() => {
        restoreState();
        bindEvents();
    });
})();


