/*
 this file is meant to only contain functions that is necessary to all the pages, such as theme control
 */

import { ready, isDarkTheme } from "./lib/utils";
import * as Constants from "./constants.ts";
import { setLangugage, getSessionLangugage} from './api/misc.ts';
import type { AcceptLangs } from './api/types.ts';

/**
 * Restore state at the beginning
 * note: currently only restore theme state
 */
function restoreState() {
    // restore theme
    const themeSelector = document.getElementById("theme-selector") as HTMLInputElement;
    if (themeSelector) {
        const isDark = isDarkTheme();
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

function changeLang(e: Event) {
    const langControllerElm = e.target as HTMLInputElement;
    if (!langControllerElm) {
        console.error("Cannot find language controller element");
        return;
    }
    const lang = langControllerElm.checked ? "zh" : "en";
    setLangugage(lang as AcceptLangs).then(result => {
        window.location.reload();
    })
}

/**
 * Bind events to elements
 */
function bindEvents(): void {
    const themeSelectorElm = document.getElementById("theme-selector");
    const languageControllerElm = document.getElementById("language-selector");
    themeSelectorElm?.addEventListener("change", rememberThemeState);
    languageControllerElm?.addEventListener("change", changeLang)
}

/**
 * Hides flash messages after a specified duration.
 * @param messageSelector  The CSS selector for the flash message element(s).
 * @param duration The duration in milliseconds after which the message(s) should be hidden.
 */
function hideFlashMessage(messageSelector: string, duration: number) {
    const message = document.querySelectorAll(messageSelector);

    message.forEach((msg) => {
        setTimeout(() => {
            msg.classList.add("hidden");
        }, duration);
    });
}

function initLanguageController() {
    const langControllerElm = document.getElementById("language-selector") as HTMLInputElement;
    getSessionLangugage().then(lang => {
        if (!lang) return;
        langControllerElm.checked = lang == "zh" ? true : false;
    })
}

(function () {
    ready(() => {
        restoreState();
        bindEvents();
        hideFlashMessage(".flash-message", 3000);
        initLanguageController();
    });
})();


