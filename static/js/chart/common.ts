import * as echarts from 'echarts/core';
import { initDynamicTimelyChart, getDefaultFetchDataStep } from './basic';
import type { InitChartOptions } from './basic';
import type { NullableTime, Solar, Usage, ElectricityPrice, TimelyArrayData, Aggregate } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';
import * as DATA_API from '../api/data.ts';
import { dateAdd, daysBetweenNull, hoursBetweenNull } from '../lib/utils.ts';

function aggregate2hours(aggregate: Aggregate) {
    switch (aggregate) {
        case "hour":
            return 1;
        case "day":
            return 24;
        case "month":
            return 24 * 30;
        case "year":
            return 24 * 30 * 360;
    }
}

function getDefaultFetchDataDays(aggregate: Aggregate) {
    const base = 30;
    return base * aggregate2hours(aggregate);
}

export async function initElectricityUsageChart(
    elm: HTMLElement,
    profileId: number,
    startTime: Date | null = null,
    endTime: Date | null = null,
    aggregate: Aggregate = "day",
    initChartOptions: Partial<InitChartOptions<TimelyArrayData, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const profile = await PROFILE_API.getProfile(profileId);
    const gStartTime = startTime ? startTime : new Date(profile.start_time);
    const gEndTime = endTime ? endTime : new Date(profile.end_time);

    const {
        title = "Electricity Usage Chart",
        type = {
            type: 'line',
            xField: 0,
            yField: 1
        },
        optionTemplate,
        initialStateValue = gStartTime.toISOString(),
        fetchDataStep = getDefaultFetchDataStep(daysBetweenNull(gStartTime, gEndTime), getDefaultFetchDataDays(aggregate)),
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            let endTime = null;
            if (startTime) {
                const ed = dateAdd(startTime, fetchDataStep);
                endTime = gEndTime > ed ? ed : gEndTime;
            }
            return PROFILE_API.getUsage(profile.id, startTime, endTime, null, aggregate) as Promise<TimelyArrayData[]>;
        },
        overrideOption,
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicTimelyChart<TimelyArrayData>(
        elm,
        gStartTime,
        gEndTime,
        {
            title: title,
            type: type,
            optionTemplate: optionTemplate,
            initialStateValue: initialStateValue,
            fetchDataStep: fetchDataStep,
            fetchDataFunc: fetchDataFunc,
            overrideOption: overrideOption,
            updateStateFunc: updateStateFunc,
            interval: interval,
            shouldStopFetchingFunc: shouldStopFetchingFunc
        }
    );
}


export async function initSolarChart(
    elm: HTMLElement,
    profileId: number,
    startTime: Date | null = null,
    endTime: Date | null = null,
    aggregate: Aggregate = "day",
    initChartOptions: Partial<InitChartOptions<TimelyArrayData, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const profile = await PROFILE_API.getProfile(profileId);
    const gStartTime = startTime ? startTime : new Date(profile.start_time);
    const gEndTime = endTime ? endTime : new Date(profile.end_time);

    const {
        title = "Solar Chart",
        type = {
            type: 'line',
            xField: 0,
            yField: 1
        },
        optionTemplate,
        initialStateValue = gStartTime.toISOString(),
        fetchDataStep = getDefaultFetchDataStep(daysBetweenNull(gStartTime, gEndTime), getDefaultFetchDataDays(aggregate)),
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            let endTime = null;
            if (startTime) {
                const ed = dateAdd(startTime, fetchDataStep);
                endTime = gEndTime > ed ? ed : gEndTime;
            }
            return PROFILE_API.getSolar(profile.id, startTime, endTime, null, aggregate) as Promise<TimelyArrayData[]>;
        },
        overrideOption,
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicTimelyChart<TimelyArrayData>(
        elm,
        gStartTime,
        gEndTime,
        {
            title: title,
            type: type,
            optionTemplate: optionTemplate,
            initialStateValue: initialStateValue,
            fetchDataStep: fetchDataStep,
            fetchDataFunc: fetchDataFunc,
            overrideOption: overrideOption,
            updateStateFunc: updateStateFunc,
            interval: interval,
            shouldStopFetchingFunc: shouldStopFetchingFunc
        }
    );
}

export async function initElectricityPriceChart(
    elm: HTMLElement,
    startTime: Date | null = null,
    endTime: Date | null = null,
    spanHours: number | null = null,
    aggregate: Aggregate = "day",
    initChartOptions: Partial<InitChartOptions<TimelyArrayData, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const gEndTime = endTime;
    spanHours = spanHours ?? hoursBetweenNull(startTime, endTime);
    const spanDays = spanHours ? spanHours / 24 : null; 
    
    const {
        title = "Electricity Price Chart",
        type = {
            type: 'line',
            xField: 0,
            yField: 1
        },
        optionTemplate,
        initialStateValue,
        fetchDataStep = getDefaultFetchDataStep(spanDays, getDefaultFetchDataDays(aggregate)),
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            let endTime = null;
            if (startTime) {
                const ed = dateAdd(startTime, fetchDataStep);
                endTime = (!gEndTime || gEndTime < ed) ? gEndTime : ed;
            }
            spanHours = spanHours ?? (endTime ? null : fetchDataStep * 24);
            return DATA_API.getElectricityPrice(startTime, endTime, spanHours, aggregate) as Promise<TimelyArrayData[]>;
        },
        overrideOption,
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicTimelyChart<TimelyArrayData>(
        elm,
        startTime,
        endTime,
        {
            title: title,
            type: type,
            optionTemplate: optionTemplate,
            initialStateValue: initialStateValue,
            fetchDataStep: fetchDataStep,
            fetchDataFunc: fetchDataFunc,
            overrideOption: overrideOption,
            updateStateFunc: updateStateFunc,
            interval: interval,
            shouldStopFetchingFunc: shouldStopFetchingFunc
        }
    );
}


