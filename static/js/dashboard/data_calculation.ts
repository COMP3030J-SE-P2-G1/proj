import type { Usage, TimelyArrayData } from '../api/types.ts';
import * as PROFILE_API from "../api/profile";

export async function getdaylyUsageSum(
    profileId: number,
    startTime: Date | null,
    endTime: Date | null,
    span_hours: number | null = null,
    sum_hours: number = 24,
): Promise<Usage[] | TimelyArrayData[]> {
    const profile = await PROFILE_API.getProfile(profileId);
    const gStartTime = startTime ? startTime : new Date(profile.start_time);
    const gEndTime = endTime ? endTime : new Date(profile.end_time);

    const usageData = await PROFILE_API.getUsage(profile.id, gStartTime, gEndTime, span_hours, sum_hours);

    return usageData;
}


export async function calculateYearlySum(profileId: number){
    const yearlyUsageSum = {};
    const daylyUsage= await getdaylyUsageSum(profileId, null, null, null, 24);
    console.log("1 Usage Sum:");
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


export async function calculateMonthlySum(profileId: number){
    const monthlyUsageSum = {};
    const daylyUsage= await getdaylyUsageSum(profileId, null, null, null, 24);
    let time_stamp: string;
    let dt: Date;
    let year: number;
    let month: number;
    for(const n in daylyUsage) {
        const day = daylyUsage[n];
        time_stamp = day[0];
        dt= new Date(time_stamp);
        year = dt.getFullYear();
        month = dt.getMonth();
        console.log(year)

        if (year+month in monthlyUsageSum)
            monthlyUsageSum[year+month] += parseInt(day[1]);
        else
            monthlyUsageSum[year+month] = parseInt(day[1]);
    }

    console.log("Monthly Usage Sum:");
    for (const month in monthlyUsageSum) {
        console.log(`${month}: ${monthlyUsageSum[year]}`);
    }
    return monthlyUsageSum;
}


async function displayYearlyUsageSum() {
    const profileId = 1; // Your profile ID
    const yearlyUsageSum = await calculateMonthlySum(profileId);
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
