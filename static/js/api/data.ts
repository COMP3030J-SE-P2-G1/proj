import { API_PREFIX } from './constants.ts';
import type { ElectricityPrice, TimelyArrayData } from './types.ts';

export async function getElectricityPrice(
    startTime: Date | null,
    endTime: Date | null,
    span_hours: number | null,
    compact: boolean = true,
): Promise<ElectricityPrice[] | TimelyArrayData[]> {
    const response = await fetch(`${API_PREFIX}/data/sems`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            start_time: startTime?.toISOString() ?? null,
            end_time: span_hours ? null : (endTime?.toISOString() ?? null),
            span_hours: span_hours,
            api: compact ? "compact" : null
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

