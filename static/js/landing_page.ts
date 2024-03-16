/**
 * Landing Page
 */
import { ready } from "./lib/utils";
import { stickyHeaderAddShadowHanlder } from "./lib/animation.ts";

/**
 * apply shadow to sticky header
 */

/**
 * Bind events to elements
 */
function bindEvents(): void {
    const sticky_header_elem = document.getElementById("sticky-header");
    if (sticky_header_elem) {
        stickyHeaderAddShadowHanlder(sticky_header_elem);
    }
}

(function () {
    ready(() => {
        bindEvents();
    });
})();



