/**
 * I simply don't want to do data-validations, which is cumbersome for hand-writing,
 * and not worth it for importing external libraries here.
 * Pls forgive me.
 */

import * as API from '../types/api.ts';

export async function getProfile(id: number): Promise<API.Profile> {
    const response = await fetch(`/api/profile/${id}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

export async function getSolar(
    profileId: number,
    startTime: Date | null,
    endTime: Date | null
): Promise<API.Solar[]> {
    const response = await fetch(`/api/profile/${profileId}/solar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_time: startTime?.toISOString() ?? null,
            end_time: endTime?.toISOString() ?? null
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }


    return await response.json();
}

export async function getUsage(
    profileId: number,
    startTime: Date | null,
    endTime: Date | null
): Promise<API.Usage[]> {
    const response = await fetch(`/api/profile/${profileId}/usage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_time: startTime?.toISOString() ?? null,
            end_time: endTime?.toISOString() ?? null
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
            
    return await response.json();
}

