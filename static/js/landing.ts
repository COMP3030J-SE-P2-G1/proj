/**
 * Landing Page
 */

import { ready } from "./lib/utils";
import { stickyHeaderAddShadowHandler } from "./lib/animation.ts";

/**
 * Bind events to elements
 */
function bindEvents(): void {
    const sticky_header_elem = document.getElementById("sticky-header");
    if (sticky_header_elem) {
        stickyHeaderAddShadowHandler(sticky_header_elem);
    }
}

/**
 * Without disabling scrollRestoration, the scroll position of Chrome will change
 * every time we refresh page
 */
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

(function () {
    ready(() => {
        bindEvents();
    });
})();



