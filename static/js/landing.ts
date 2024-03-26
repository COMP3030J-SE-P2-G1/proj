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
 */
}

(function () {
    ready(() => {
        bindEvents();
    });
})();



