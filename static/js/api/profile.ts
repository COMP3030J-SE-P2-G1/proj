/**
 * I simply don't want to do data-validations, which is cumbersome for hand-writing,
 * and not worth it for importing external libraries here.
 * Pls forgive me.
 */

export type Time = string;

export type Profile = {
    id: number,
    user_ud: number,
    name: string,
    desc: string | null,
    start_time: Time,
    end_time: Time,
    lon: number | null,
    lat: number | null,
    tech: number | null,
    loss: number | null,
    power: number | null
}

export type TimelyData = {
    time: Time,
}

export interface Solar extends TimelyData {
    generation: number,
    id: number,
    lat: number,
    lon: number,
    loss: number,
    power: number,
    tech: number
};

export interface Usage extends TimelyData {
    id: number,
    user_id: number,
    usage: number
}

export async function getProfile(id: number): Promise<Profile> {
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
): Promise<Solar[]> {
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
): Promise<Usage[]> {
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
