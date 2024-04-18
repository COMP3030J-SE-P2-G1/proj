import type { ElectricityPrice } from './types.ts';

export async function getElectricityPrice(
    startTime: Date | null,
    endTime: Date | null,
    span_hours: number | null,
): Promise<ElectricityPrice[]> {
    const response = await fetch(`/data/sems`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_time: startTime?.toISOString() ?? null,
            end_time: span_hours ? null : endTime?.toISOString() ?? null,
            span_hours: span_hours
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

