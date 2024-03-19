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
    const themeSelectorDrawerSide = document.getElementById("theme-controller-drawer-side") as HTMLInputElement;
    for (const elem of [themeSelector, themeSelectorDrawerSide]) {
        const rawIsDark = localStorage.getItem(Constants.LOCAL_STAGE_IS_DARK) ?? "false";
        const isDark = JSON.parse(rawIsDark) as boolean;
        elem.checked = isDark;
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
    const themeSelectorDrawerSide = document.getElementById("theme-controller-drawer-side");
    themeSelector?.addEventListener("change", rememberThemeState);
    themeSelectorDrawerSide?.addEventListener("change", rememberThemeState);
}

(function () {
    ready(() => {
        restoreState();
        bindEvents();
    });
})();


