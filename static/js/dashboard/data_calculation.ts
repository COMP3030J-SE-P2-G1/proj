import {Usage} from "../api/types";
import * as PROFILE_API from "../api/profile";
import {dateAdd, ready} from "../lib/utils";


export async function getYearlyUsageSum(
    profileId: number,
    startTime: Date | null = null,
    endTime: Date | null = null,
): Promise<{ [year: number]: number }> {
    const profile = await PROFILE_API.getProfile(profileId);
    const gStartTime = startTime ? startTime : new Date(profile.start_time);
    const gEndTime = endTime ? endTime : new Date(profile.end_time);

    const usageData = await PROFILE_API.getUsage(profile.id, gStartTime, gEndTime);

    return calculateYearlyUsageSum(usageData);
}

function calculateYearlyUsageSum(data) {
    const yearlyUsage = {};

    data.forEach(item => {
        const date = new Date(item.time);
        const year = date.getFullYear();

        if (!yearlyUsage[year]) {
            yearlyUsage[year] = 0;
        }
        yearlyUsage[year] += item.usage;
    });

    return yearlyUsage;
}

async function displayYearlyUsageSum() {
    const profileId = 1; // Your profile ID
    const yearlyUsageSum = await getYearlyUsageSum(profileId);

    console.log("Yearly Usage Sum:");
    for (const year in yearlyUsageSum) {
        console.log(`${year}: ${yearlyUsageSum[year]}`);
    }
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


export default function onLoad() {
// Call the function to display the yearly usage sum
    displayYearlyUsageSum();
}
