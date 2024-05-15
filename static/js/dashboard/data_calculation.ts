import type { Usage, TimelyArrayData } from '../api/types.ts';
import * as PROFILE_API from "../api/profile";
import {Aggregate} from "../api/types.ts";


export async function getUsageSum(
    profileId: number,
    startTime: Date | null,
    endTime: Date | null,
    span_hours: number | null = null,
    aggregate: Aggregate = "month",
): Promise<Usage[] | TimelyArrayData[]> {
    const profile = await PROFILE_API.getProfile(profileId);
    const gStartTime = startTime ? startTime : new Date(profile.start_time);
    const gEndTime = endTime ? endTime : new Date(profile.end_time);
    console.log(aggregate);
    const usageData = await PROFILE_API.getUsage(profile.id, gStartTime, gEndTime, span_hours, aggregate);
    return usageData;
}


export async function calculateYearlySum(profileId: number){
    const yearlyUsageSum = {};
    const daylyUsage= await getUsageSum(profileId, null, null, null, "month");
    console.log("We Get", daylyUsage);
    let time_stamp: string;
    let dt: Date;
    let year: number;
    for(const n in daylyUsage) {
        const day = daylyUsage[n];
        time_stamp = day[0];
        dt= new Date(time_stamp);
        year = dt.getFullYear();
        console.log(year)

        if (year in yearlyUsageSum)
            yearlyUsageSum[year] += parseInt(day[1]);
        else
            yearlyUsageSum[year] = parseInt(day[1]);
    }

    console.log("Yearly Usage Sum:");
    for (const year in yearlyUsageSum) {
        console.log(`${year}: ${yearlyUsageSum[year]}`);
    }
    return yearlyUsageSum;
}


async function displayYearlyUsageSum() {
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


export default function onLoad() {
// Call the function to display the yearly usage sum
    displayYearlyUsageSum();
}
