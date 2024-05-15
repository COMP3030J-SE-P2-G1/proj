/**
 * Landing Page
 */

import { ready } from "./lib/utils";
import { stickyHeaderAddShadowHandler } from "./lib/animation.ts";
import {calculateYearlySum} from "./dashboard/data_calculation";
import {Aggregate, TimelyArrayData, Usage} from "./api/types";
import * as PROFILE_API from "./api/profile";
import {API_PREFIX} from "./api/constants";


async function Profiles() {
        const profile = await fetch(`${API_PREFIX}/data/sems`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_time: Date?.toISOString() ?? null,
            end_time: Date ?? null,
            span_hours: span_hours,
            aggregate: aggregate
        })
    });
    const profileId = 1; // Your profile ID
    const yearlyUsageSum = await calculateYearlySum(profileId);
    // Get the element where you want to display the data
    const usageSumContainer = document.getElementById('yearly-usage-sum');

    // Create an unordered list to display the yearly usage sum
    const ul = document.createElement('ul');

    // Iterate through the yearly usage sum object and create list items
    for (const year in yearlyUsageSum) {
        const li = document.createElement('li');
        li.textContent = `${year}: ${yearlyUsageSum[year]}`;
        ul.appendChild(li);
    }

    // Append the list to the container element
    usageSumContainer.appendChild(ul);
}


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



