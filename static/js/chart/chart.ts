export * from './basic.ts'
export * from './datasource.ts';
import type { Aggregate } from '../api/types.ts';


export function getAdaptiveFormatter(aggregate: Aggregate) {
    return (value, index) => {
        // Formatted to be month/day; display year only in the first label
        const date = new Date(value);
        const hour = date.getHours();
        const day = date.getDay();
        const month = date.getMonth();
        const year = date.getFullYear();
        
        if (aggregate == "hour") {
            return `${month}/${day}/${year} ${hour}`;
        } else if (aggregate == "day") {
            return `${month}/${day}/${year}`;
        } else if (aggregate == "month") {
            return `${year}-${month}`;
        } else { // year
            return `${year}`;
        }
    }
}


export function getAdaptivePieChartFormat(aggregate: Aggregate) {
    if (aggregate == "hour") {
        return `yyyy-MMMM-dd-HH`;
    } else if (aggregate == "day") {
        return `yyyy-MMMM-dd`;
    } else if (aggregate == "month") {
        return `yyyy-MMMM`;
    } else { // year
        return `yyyy`;
    }
}

