/**
 * I simply don't want to do data-validations, which is cumbersome for hand-writing,
 * and not worth it for importing external libraries here.
 * Pls forgive me.
 */

import type { Profile, Solar, Usage, TimelyArrayData, Aggregate } from './types.ts';
import { API_PREFIX } from './constants.ts';

export async function getProfile(id: number): Promise<Profile> {
    const response = await fetch(`${API_PREFIX}/profile/${id}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export async function getProfiles(): Promise<Profile[]> {
    const response = await fetch(`${API_PREFIX}/user/profiles`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

async function _get<D>(
    endPoint: string,
    profileId: number,
    startTime: Date | null,
    endTime: Date | null,
    span_hours: number | null = null,
    aggregate: Aggregate = "day",
): Promise<D[] | TimelyArrayData[]> {
    const response = await fetch(`${API_PREFIX}/profile/${profileId}/${endPoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_time: startTime?.toISOString() ?? null,
            end_time: span_hours ? null : (endTime?.toISOString() ?? null),
            span_hours: span_hours,
            aggregate: aggregate
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export async function getSolar(
    profileId: number,
    startTime: Date | null,
    endTime: Date | null,
    span_hours: number | null = null,
    aggregate: Aggregate = "day",
): Promise<TimelyArrayData[]> {
    return _get(
        "solar",
        profileId,
        startTime,
        endTime,
        span_hours,
        aggregate,
    )
}

export async function getUsage(
    profileId: number,
    startTime: Date | null,
    endTime: Date | null,
    span_hours: number | null = null,
    aggregate: Aggregate = "day"
): Promise<TimelyArrayData[]> {
    return _get(
        "usage",
        profileId,
        startTime,
        endTime,
        span_hours,
        aggregate,
    )
}

export async function getSaving(
    profileId: number,
    startTime: Date | null,
    endTime: Date | null,
    span_hours: number | null = null,
    aggregate: Aggregate = "day"
): Promise<TimelyArrayData[]> {
    return _get(
        "saving",
        profileId,
        startTime,
        endTime,
        span_hours,
        aggregate,
    )
}

