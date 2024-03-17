/**
 * Landing Page
 */

// NOTE Since locomotive scroll v5 beta doesn't have good typescript support, we here
// disable all the typescript checking for it when necessary 

import { ready } from "./lib/utils";
import { stickyHeaderAddShadowHanlder } from "./lib/animation.ts";
// @ts-expect-error https://github.com/locomotivemtl/locomotive-scroll/issues/550
import LocomotiveScroll from 'locomotive-scroll';

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

function bindLocomotiveScrollEvents() {
    /* eslint-disable */
    // @ts-expect-error locomotive scroll
    window.addEventListener('hero-bg-0-scroll', (e: CustomEvent) => {
        const { target , way } = e.detail;
        console.log(`target: ${target}`, `way: ${way}`);
        if (way === "enter") {
            // note: pls ensure `scale-125` is in tailwind's safelist
            target.classList.add("scale-125");
        } else {
            target.classList.remove("scale-125");
        }
    });
    /* eslint-enable */
}

(function () {
    ready(() => {
        bindEvents();

        // eslint-disable-next-line
        const locomotiveScroll = new LocomotiveScroll();
        bindLocomotiveScrollEvents();
    });
})();



