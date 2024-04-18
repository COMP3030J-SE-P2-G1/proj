import * as echarts from 'echarts/core';
import { initDynamicTimelyChart, StateType } from './basic';
import type { InitChartOptions, State, SupportedChartType } from './basic';
import type { NullableTime, Solar, Usage, ElectricityPrice } from '../api/types.ts';
import * as PROFILE_API from '../api/profile.ts';
import * as DATA_API from '../api/data.ts';
import { dateAdd } from '../lib/utils.ts';

const DEFAULT_FETCHDATA_STEP = 30; // 30 days

export async function initElectricityUsageChart(
    elm: HTMLElement,
    profileId: number,
    startTime: Date | null = null,
    endTime: Date | null = null,
    initChartOptions: Partial<InitChartOptions<Usage, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const profile = await PROFILE_API.getProfile(profileId);
    const gStartTime = startTime ? startTime : new Date(profile.start_time);
    const gEndTime = endTime ? endTime : new Date(profile.end_time);

    const {
        title = "Electricity Usage Chart",
        type,
        optionTemplate,
        initialStateValue = gStartTime.toISOString(),
        fetchDataStep = DEFAULT_FETCHDATA_STEP,
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            const endTime = startTime ? dateAdd(startTime, fetchDataStep) : null;
            return PROFILE_API.getUsage(profile.id, startTime, endTime);
        },
        overrideOption = (data, prevData) => {
            if (prevData) data = prevData.concat(data);
            return {
                xAxis: {
                    data: data.map(item => item.time)
                },
                series: [
                    {
                        name: 'line0',
                        data: data.map(item => item.usage)
                    }
                ]
            }
        },
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicTimelyChart<Usage>(
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
    initChartOptions: Partial<InitChartOptions<Solar, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const profile = await PROFILE_API.getProfile(profileId);
    const gStartTime = startTime ? startTime : new Date(profile.start_time);
    const gEndTime = endTime ? endTime : new Date(profile.end_time);

    const {
        title = "Solar Chart",
        type,
        optionTemplate,
        initialStateValue = gStartTime.toISOString(),
        fetchDataStep = DEFAULT_FETCHDATA_STEP,
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            const endTime = startTime ? dateAdd(startTime, fetchDataStep) : null;
            return PROFILE_API.getSolar(profile.id, startTime, endTime);
        },
        overrideOption = (data, prevData) => {
            if (prevData) data = prevData.concat(data);
            return {
                xAxis: {
                    data: data.map(item => item.time)
                },
                series: [
                    {
                        name: 'line0',
                        data: data.map(item => item.generation)
                    }
                ]
            }
        },
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicTimelyChart<Solar>(
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
    initChartOptions: Partial<InitChartOptions<ElectricityPrice, NullableTime>> = {},
): Promise<echarts.ECharts>  {
    const {
        title = "Electricity Price Chart",
        type,
        optionTemplate,
        initialStateValue,
        fetchDataStep = DEFAULT_FETCHDATA_STEP,
        fetchDataFunc = async state => {
            const startTime = state.value ? new Date(state.value) : null;
            const endTime = startTime ? dateAdd(startTime, fetchDataStep) : null;
            const spanHours = endTime ? null : fetchDataStep * 24;
            return DATA_API.getElectricityPrice(startTime, endTime, spanHours);
        },
        overrideOption = (data, prevData) => {
            if (prevData) data = prevData.concat(data);
            return {
                xAxis: {
                    data: data.map(item => item.time)
                },
                series: [
                    {
                        name: 'line0',
                        data: data.map(item => item.spot)
                    }
                ]
            }
        },
        updateStateFunc,
        interval,
        shouldStopFetchingFunc
    } = initChartOptions;
    
    return initDynamicTimelyChart<ElectricityPrice>(
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


