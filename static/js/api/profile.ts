/**
 * I simply don't want to do data-validations, which is cumbersome for hand-writing,
 * and not worth it for importing external libraries here.
 * Pls forgive me.
 */

import type { Profile, Solar, Usage } from './types.ts';
import { API_PREFIX } from './constants.ts';

export async function getProfile(id: number): Promise<Profile> {
    const response = await fetch(`${API_PREFIX}/profile/${id}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

export async function getSolar(
    profileId: number,
    startTime: Date | null,
    endTime: Date | null,
    span_hours: number | null = null,
): Promise<Solar[]> {
    const response = await fetch(`${API_PREFIX}/profile/${profileId}/solar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_time: startTime?.toISOString() ?? null,
            end_time: span_hours ? null : (endTime?.toISOString() ?? null),
            span_hours: span_hours
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
    endTime: Date | null,
    span_hours: number | null = null,
): Promise<Usage[]> {
    const response = await fetch(`${API_PREFIX}/profile/${profileId}/usage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_time: startTime?.toISOString() ?? null,
            end_time: span_hours ? null : (endTime?.toISOString() ?? null),
            span_hours: span_hours
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
            
    return await response.json();
}

