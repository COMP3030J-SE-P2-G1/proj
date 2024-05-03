import * as echarts from 'echarts/core';
import { initDynamicTimelyChart, getDefaultFetchDataStep } from './basic';
import type { InitChartOptions } from './basic';
import type { NullableTime, Solar, Usage, ElectricityPrice, TimelyArrayData } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';
import * as DATA_API from '../api/data.ts';
import { dateAdd } from '../lib/utils.ts';

export async function initElectricityUsageChart(
    elm: HTMLElement,
    profileId: number,
    startTime: Date | null = null,
    endTime: Date | null = null,
    sum_hours: number = 24,
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
        fetchDataStep = getDefaultFetchDataStep(gStartTime, gEndTime),
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            let endTime = null;
            if (startTime) {
                const ed = dateAdd(startTime, fetchDataStep);
                endTime = gEndTime > ed ? ed : gEndTime;
            }
            return PROFILE_API.getUsage(profile.id, startTime, endTime, null, sum_hours) as Promise<TimelyArrayData[]>;
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
    sum_hours: number = 24,
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
        fetchDataStep = getDefaultFetchDataStep(gStartTime, gEndTime),
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            let endTime = null;
            if (startTime) {
                const ed = dateAdd(startTime, fetchDataStep);
                endTime = gEndTime > ed ? ed : gEndTime;
            }
            return PROFILE_API.getSolar(profile.id, startTime, endTime, null, sum_hours) as Promise<TimelyArrayData[]>;
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
    sum_hours: number = 24,
    initChartOptions: Partial<InitChartOptions<TimelyArrayData, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const gStartTime = startTime;
    const gEndTime = endTime;
    
    const {
        title = "Electricity Price Chart",
        type = {
            type: 'line',
            xField: 0,
            yField: 1
        },
        optionTemplate,
        initialStateValue,
        fetchDataStep = getDefaultFetchDataStep(gStartTime, gEndTime),
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            let endTime = null;
            if (startTime) {
                const ed = dateAdd(startTime, fetchDataStep);
                endTime = (!gEndTime || gEndTime < ed) ? gEndTime : ed;
            }
            const spanHours = endTime ? null : fetchDataStep * 24;
            return DATA_API.getElectricityPrice(startTime, endTime, spanHours, sum_hours) as Promise<TimelyArrayData[]>;
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


